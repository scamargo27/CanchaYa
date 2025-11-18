from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, time, timedelta
from .models import Reserva
from .serializers import (
    ReservaSerializer,
    ReservaSimpleSerializer,
    ReservaCreateSerializer,
    DisponibilidadCanchaSerializer
)
from canchas.models import Cancha, TarifaCancha
from .permissions import IsDeportistaOrClubOwner


# ===== VIEWSETS =====

class ReservaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reservas.
    
    Endpoints disponibles:
    - GET /api/reservas/ - Listar reservas (filtra según tipo de usuario)
    - POST /api/reservas/ - Crear reserva (solo deportistas)
    - GET /api/reservas/{id}/ - Ver detalle de una reserva
    - GET /api/reservas/mis-reservas/ - Reservas del deportista autenticado
    - GET /api/reservas/reservas-club/ - Reservas del club autenticado
    - POST /api/reservas/disponibilidad-cancha/{cancha_id}/ - Ver disponibilidad
    """
    queryset = Reserva.objects.select_related(
        'cancha',
        'cancha__club',
        'cancha__deporte',
        'cancha__club__ciudad',
        'cancha__club__departamento',
        'deportista',
        'deportista__user'
    ).all()
    permission_classes = [permissions.IsAuthenticated, IsDeportistaOrClubOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'fecha', 'cancha', 'deportista']
    search_fields = [
        'cancha__nombre',
        'cancha__club__nombre',
        'deportista__nombre',
        'deportista__apellido'
    ]
    ordering_fields = ['fecha', 'hora_inicio', 'created_at', 'precio']
    ordering = ['-fecha', '-hora_inicio']
    
    def get_serializer_class(self):
        """Retorna el serializer adecuado según la acción"""
        if self.action == 'create':
            return ReservaCreateSerializer
        elif self.action == 'list':
            return ReservaSimpleSerializer
        return ReservaSerializer
    
    def get_queryset(self):
        """
        Filtra las reservas según el tipo de usuario:
        - Deportistas: Solo ven sus propias reservas
        - Clubes: Solo ven reservas de sus canchas
        """
        user = self.request.user
        queryset = super().get_queryset()
        
        if user.tipo_usuario == 'deportista':
            # Deportistas solo ven sus reservas
            return queryset.filter(deportista=user.deportista_profile)
        
        elif user.tipo_usuario == 'club':
            # Clubes solo ven reservas de sus canchas
            return queryset.filter(cancha__club=user.club_profile)
        
        return queryset.none()
    
    def create(self, request, *args, **kwargs):
        """
        Crear una nueva reserva.
        POST /api/reservas/
        
        Solo deportistas pueden crear reservas.
        La reserva se confirma automáticamente.
        """
        # Verificar que sea deportista
        if request.user.tipo_usuario != 'deportista':
            return Response({
                'error': 'Solo los deportistas pueden crear reservas',
                'detalle': 'Debes iniciar sesión como deportista para reservar una cancha.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reserva = serializer.save()
        
        # Serializar respuesta con el serializer completo
        response_serializer = ReservaSerializer(reserva, context={'request': request})
        
        return Response({
            'exito': True,
            'mensaje': '¡Reserva creada exitosamente!',
            'detalle': f'Tu reserva para {reserva.cancha.nombre} el {reserva.fecha} ha sido confirmada automáticamente.',
            'reserva': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        """
        Listar reservas.
        GET /api/reservas/
        
        Deportistas ven sus reservas.
        Clubes ven reservas de sus canchas.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'exito': True,
            'total': queryset.count(),
            'reservas': serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        """
        Ver detalle de una reserva.
        GET /api/reservas/{id}/
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'exito': True,
            'reserva': serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='mis-reservas')
    def mis_reservas(self, request):
        """
        Obtener todas las reservas del deportista autenticado.
        GET /api/reservas/mis-reservas/
        
        Query params opcionales:
        - ?estado=confirmada - Filtrar por estado
        - ?futuras=true - Solo reservas futuras
        - ?pasadas=true - Solo reservas pasadas
        """
        if request.user.tipo_usuario != 'deportista':
            return Response({
                'error': 'Este endpoint es solo para deportistas'
            }, status=status.HTTP_403_FORBIDDEN)
        
        queryset = self.get_queryset()
        
        # Filtrar por futuras o pasadas
        if request.query_params.get('futuras') == 'true':
            queryset = queryset.filter(fecha__gte=timezone.now().date())
        elif request.query_params.get('pasadas') == 'true':
            queryset = queryset.filter(fecha__lt=timezone.now().date())
        
        # Aplicar filtros adicionales
        queryset = self.filter_queryset(queryset)
        
        # Agrupar por estado
        proximas = queryset.filter(
            fecha__gte=timezone.now().date(),
            estado__in=['pendiente', 'confirmada']
        ).order_by('fecha', 'hora_inicio')
        
        completadas = queryset.filter(
            Q(estado='completada') | Q(fecha__lt=timezone.now().date())
        ).order_by('-fecha', '-hora_inicio')
        
        return Response({
            'exito': True,
            'total': queryset.count(),
            'proximas': {
                'total': proximas.count(),
                'reservas': ReservaSimpleSerializer(proximas, many=True, context={'request': request}).data
            },
            'anteriores': {
                'total': completadas.count(),
                'reservas': ReservaSimpleSerializer(completadas, many=True, context={'request': request}).data
            }
        })
    
    @action(detail=False, methods=['get'], url_path='reservas-club')
    def reservas_club(self, request):
        """
        Obtener todas las reservas de las canchas del club autenticado.
        GET /api/reservas/reservas-club/
        
        Query params opcionales:
        - ?cancha={id} - Filtrar por cancha específica
        - ?fecha={YYYY-MM-DD} - Filtrar por fecha
        - ?estado=confirmada - Filtrar por estado
        """
        if request.user.tipo_usuario != 'club':
            return Response({
                'error': 'Este endpoint es solo para clubes'
            }, status=status.HTTP_403_FORBIDDEN)
        
        queryset = self.filter_queryset(self.get_queryset())
        
        # Estadísticas
        total = queryset.count()
        hoy = queryset.filter(fecha=timezone.now().date()).count()
        proximas = queryset.filter(
            fecha__gte=timezone.now().date(),
            estado__in=['pendiente', 'confirmada']
        ).count()
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'exito': True,
            'estadisticas': {
                'total': total,
                'hoy': hoy,
                'proximas': proximas
            },
            'reservas': serializer.data
        })
    
    @action(detail=False, methods=['post'], url_path='disponibilidad-cancha/(?P<cancha_id>[^/.]+)')
    def disponibilidad_cancha(self, request, cancha_id=None):
        """
        Consultar la disponibilidad de una cancha por HORA para una fecha específica.
        POST /api/reservas/disponibilidad-cancha/{cancha_id}/
    
        Body:
        {
            "fecha": "2025-11-22"
        }
    
        Retorna los SLOTS POR HORA disponibles según las tarifas y reservas existentes.
        """
        # Validar que la cancha existe y está activa
        try:
            cancha = Cancha.objects.select_related('club', 'deporte').get(id=cancha_id)
        except Cancha.DoesNotExist:
            return Response({
                'error': 'Cancha no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
    
        if not cancha.is_activa:
            return Response({
                'error': 'Esta cancha no está disponible para reservas'
            }, status=status.HTTP_400_BAD_REQUEST)
    
        # Validar fecha
        serializer = DisponibilidadCanchaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fecha = serializer.validated_data['fecha']
    
        # Obtener día de la semana (0=Domingo en la DB)
        dia_semana = fecha.weekday()
        dia_semana_db = (dia_semana + 1) % 7
    
        # Obtener tarifas para ese día
        tarifas = TarifaCancha.objects.filter(
            cancha=cancha,
            dia_semana=dia_semana_db
        ).order_by('hora_inicio')
    
        if not tarifas.exists():
            return Response({
                'exito': True,
                'cancha': {
                    'id': cancha.id,
                    'nombre': cancha.nombre,
                    'club': cancha.club.nombre,
                    'deporte': cancha.deporte.nombre,
                    'capacidad': cancha.capacidad_jugadores,
                    'techada': cancha.is_techada
                },
                'fecha': fecha,
                'mensaje': 'No hay horarios disponibles para esta fecha',
                'slots_disponibles': []
            })
    
        # Obtener reservas existentes para esa fecha
        reservas_existentes = Reserva.objects.filter(
            cancha=cancha,
            fecha=fecha,
            estado__in=['pendiente', 'confirmada']
        ).values_list('hora_inicio', 'hora_fin')
    
        # Convertir reservas a lista de tuplas para fácil comparación
        reservas_list = [(r[0], r[1]) for r in reservas_existentes]
    
        # Construir slots por hora disponibles
        slots_disponibles = []
    
        for tarifa in tarifas:
            # Generar slots de 1 hora dentro del rango de la tarifa
            hora_actual = datetime.combine(fecha, tarifa.hora_inicio)
            hora_fin_tarifa = datetime.combine(fecha, tarifa.hora_fin)
        
            while hora_actual < hora_fin_tarifa:
                hora_siguiente = hora_actual + timedelta(hours=1)
            
                # Verificar si este slot específico tiene conflicto con alguna reserva
                slot_ocupado = False
            
                for reserva_inicio, reserva_fin in reservas_list:
                    reserva_inicio_dt = datetime.combine(fecha, reserva_inicio)
                    reserva_fin_dt = datetime.combine(fecha, reserva_fin)
                
                    # Hay conflicto si los rangos se solapan
                    # Solapamiento: slot_inicio < reserva_fin AND slot_fin > reserva_inicio
                    if hora_actual < reserva_fin_dt and hora_siguiente > reserva_inicio_dt:
                        slot_ocupado = True
                        break
            
                # Si el slot está libre, agregarlo a la lista
                if not slot_ocupado:
                    slots_disponibles.append({
                        'hora_inicio': hora_actual.time().strftime('%H:%M:%S'),
                        'hora_fin': hora_siguiente.time().strftime('%H:%M:%S'),
                        'precio_hora': float(tarifa.precio),  # Precio por hora
                        'tarifa_titulo': tarifa.titulo or f'Tarifa {tarifa.hora_inicio}-{tarifa.hora_fin}'
                    })
            
                hora_actual = hora_siguiente
    
        return Response({
            'exito': True,
            'cancha': {
                'id': cancha.id,
                'nombre': cancha.nombre,
                'club': cancha.club.nombre,
                'deporte': cancha.deporte.nombre,
                'capacidad': cancha.capacidad_jugadores,
                'techada': cancha.is_techada
            },
            'fecha': fecha,
            'total_slots': len(slots_disponibles),
            'slots_disponibles': slots_disponibles
        })
  