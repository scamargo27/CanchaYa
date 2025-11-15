from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import Cancha, TarifaCancha
from .serializers import (
    CanchaListSerializer,
    CanchaDetailSerializer,
    CanchaCreateUpdateSerializer,
    TarifaCanchaSerializer,
    TarifaCanchaCreateUpdateSerializer
)
from .filters import CanchaFilter, TarifaCanchaFilter


class IsClubOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado:
    - Lectura: Cualquiera autenticado
    - Escritura: Solo el club propietario de la cancha
    """
    def has_permission(self, request, view):
        # Lectura permitida para todos los autenticados
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Escritura solo para clubes
        return (
            request.user and
            request.user.is_authenticated and
            request.user.tipo_usuario == 'club'
        )
    
    def has_object_permission(self, request, view, obj):
        # Lectura permitida para todos
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Escritura solo para el club propietario
        return obj.club.user == request.user


class CanchaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar canchas.
    
    Filtros disponibles:
    - ?club=2                  → Canchas del club 2
    - ?deporte=1               → Canchas de fútbol
    - ?ciudad=1                → Canchas en ciudad con ID 1
    - ?departamento=5          → Canchas en departamento con ID 5
    - ?nombre=futbol           → Canchas con "futbol" en el nombre
    - ?club_nombre=sports      → Canchas de clubes con "sports" en el nombre
    - ?ciudad_nombre=medellin  → Canchas en ciudades con "medellin"
    - ?is_techada=true         → Solo canchas techadas
    - ?capacidad_min=10        → Canchas con capacidad >= 10
    - ?capacidad_max=20        → Canchas con capacidad <= 20
    
    Combinar filtros:
    - ?club=2&deporte=1        → Canchas de fútbol del club 2
    - ?ciudad_nombre=medellin&is_techada=true → Canchas techadas en Medellín
    """
    permission_classes = [IsClubOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = CanchaFilter
    
    def get_queryset(self):
        """
        Filtrar canchas según el usuario:
        - Deportistas/público: Solo canchas activas
        - Clubes: Solo sus propias canchas
        """
        user = self.request.user
        
        # Si es un club, ver solo sus canchas
        if user.tipo_usuario == 'club':
            return Cancha.objects.filter(club__user=user).select_related(
                'club', 'deporte', 'club__ciudad', 'club__departamento'
            ).prefetch_related('tarifas')
        
        # Para deportistas/otros: solo canchas activas
        return Cancha.objects.filter(is_activa=True).select_related(
            'club', 'deporte', 'club__ciudad', 'club__departamento'
        ).prefetch_related('tarifas')
    
    def get_serializer_class(self):
        """Usar diferentes serializers según la acción"""
        if self.action == 'list':
            return CanchaListSerializer
        elif self.action == 'retrieve':
            return CanchaDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CanchaCreateUpdateSerializer
        return CanchaDetailSerializer
    
    def perform_create(self, serializer):
        """Asignar automáticamente el club del usuario autenticado"""
        club = self.request.user.club_profile
        serializer.save(club=club)
    
    def create(self, request, *args, **kwargs):
        """Crear una nueva cancha"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Usar el serializer detallado para la respuesta
        cancha = serializer.instance
        response_serializer = CanchaDetailSerializer(cancha)
        
        return Response({
            'exito': True,
            'mensaje': f'Cancha "{cancha.nombre}" creada exitosamente',
            'cancha': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Actualizar una cancha"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Usar el serializer detallado para la respuesta
        response_serializer = CanchaDetailSerializer(instance)
        
        return Response({
            'exito': True,
            'mensaje': f'Cancha "{instance.nombre}" actualizada exitosamente',
            'cancha': response_serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Eliminar una cancha"""
        instance = self.get_object()
        nombre = instance.nombre
        self.perform_destroy(instance)
        
        return Response({
            'exito': True,
            'mensaje': f'Cancha "{nombre}" eliminada exitosamente'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def tarifas(self, request, pk=None):
        """
        Obtener todas las tarifas de una cancha.
        GET /api/canchas/{id}/tarifas/
        """
        cancha = self.get_object()
        tarifas = cancha.tarifas.all().order_by('dia_semana', 'hora_inicio')
        serializer = TarifaCanchaSerializer(tarifas, many=True)
        
        return Response({
            'exito': True,
            'cancha': cancha.nombre,
            'total_tarifas': tarifas.count(),
            'tarifas': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def crear_tarifa(self, request, pk=None):
        """
        Crear una tarifa para una cancha específica.
        POST /api/canchas/{id}/crear-tarifa/
        """
        cancha = self.get_object()
        
        # Verificar que sea el propietario
        if cancha.club.user != request.user:
            return Response({
                'error': 'No tienes permiso para agregar tarifas a esta cancha'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TarifaCanchaCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tarifa = serializer.save(cancha=cancha)
        
        response_serializer = TarifaCanchaSerializer(tarifa)
        
        return Response({
            'exito': True,
            'mensaje': 'Tarifa creada exitosamente',
            'tarifa': response_serializer.data
        }, status=status.HTTP_201_CREATED)


class TarifaCanchaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar tarifas de canchas.
    Solo el club propietario puede crear/editar/eliminar.
    
    Filtros disponibles:
    - ?cancha=2              → Tarifas de la cancha 2
    - ?dia_semana=1          → Tarifas de lunes
    - ?club=2                → Tarifas de canchas del club 2
    - ?deporte=1             → Tarifas de canchas de fútbol
    - ?precio_min=40000      → Tarifas con precio >= 40000
    - ?precio_max=80000      → Tarifas con precio <= 80000
    - ?cancha_nombre=tenis   → Tarifas de canchas con "tenis" en nombre
    
    Combinar filtros:
    - ?cancha=2&dia_semana=1 → Tarifas de lunes de la cancha 2
    """
    serializer_class = TarifaCanchaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = TarifaCanchaFilter
    
    def get_queryset(self):
        """Solo ver tarifas de canchas del club autenticado"""
        user = self.request.user
        
        if user.tipo_usuario == 'club':
            return TarifaCancha.objects.filter(cancha__club__user=user).select_related(
                'cancha', 'cancha__club', 'cancha__deporte'
            )
        
        # Deportistas pueden ver todas las tarifas de canchas activas
        return TarifaCancha.objects.filter(cancha__is_activa=True).select_related(
            'cancha', 'cancha__club', 'cancha__deporte'
        )
    
    def get_serializer_class(self):
        """Usar serializer apropiado según la acción"""
        if self.action in ['create', 'update', 'partial_update']:
            return TarifaCanchaCreateUpdateSerializer
        return TarifaCanchaSerializer
    
    def create(self, request, *args, **kwargs):
        """Crear una tarifa"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Verificar que la cancha pertenezca al club
        cancha_id = request.data.get('cancha')
        try:
            cancha = Cancha.objects.get(id=cancha_id, club__user=request.user)
        except Cancha.DoesNotExist:
            return Response({
                'error': 'Cancha no encontrada o no tienes permiso para modificarla'
            }, status=status.HTTP_404_NOT_FOUND)
        
        tarifa = serializer.save(cancha=cancha)
        response_serializer = TarifaCanchaSerializer(tarifa)
        
        return Response({
            'exito': True,
            'mensaje': 'Tarifa creada exitosamente',
            'tarifa': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Actualizar una tarifa"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Verificar permisos
        if instance.cancha.club.user != request.user:
            return Response({
                'error': 'No tienes permiso para modificar esta tarifa'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        response_serializer = TarifaCanchaSerializer(instance)
        
        return Response({
            'exito': True,
            'mensaje': 'Tarifa actualizada exitosamente',
            'tarifa': response_serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Eliminar una tarifa"""
        instance = self.get_object()
        
        # Verificar permisos
        if instance.cancha.club.user != request.user:
            return Response({
                'error': 'No tienes permiso para eliminar esta tarifa'
            }, status=status.HTTP_403_FORBIDDEN)
        
        self.perform_destroy(instance)
        
        return Response({
            'exito': True,
            'mensaje': 'Tarifa eliminada exitosamente'
        }, status=status.HTTP_200_OK)