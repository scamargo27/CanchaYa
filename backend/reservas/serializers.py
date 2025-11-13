from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Reserva
from canchas.models import Cancha, TarifaCancha
from accounts.models import Deportista


# ===== SERIALIZERS DE LECTURA =====

class ReservaSerializer(serializers.ModelSerializer):
    """Serializer completo de Reserva con información detallada"""
    
    # Información de la cancha
    cancha_nombre = serializers.CharField(source='cancha.nombre', read_only=True)
    cancha_superficie = serializers.CharField(source='cancha.superficie', read_only=True)
    cancha_capacidad = serializers.IntegerField(source='cancha.capacidad_jugadores', read_only=True)
    cancha_techada = serializers.BooleanField(source='cancha.is_techada', read_only=True)
    
    # Información del club
    club_id = serializers.IntegerField(source='cancha.club.id', read_only=True)
    club_nombre = serializers.CharField(source='cancha.club.nombre', read_only=True)
    club_direccion = serializers.CharField(source='cancha.club.direccion', read_only=True)
    club_telefono = serializers.CharField(source='cancha.club.telefono_1', read_only=True)
    
    # Información del deporte
    deporte_id = serializers.IntegerField(source='cancha.deporte.id', read_only=True)
    deporte_nombre = serializers.CharField(source='cancha.deporte.nombre', read_only=True)
    
    # Información del deportista
    deportista_nombre = serializers.SerializerMethodField()
    deportista_telefono = serializers.CharField(source='deportista.telefono', read_only=True)
    deportista_email = serializers.CharField(source='deportista.user.email', read_only=True)
    
    # Información de ubicación
    ciudad = serializers.CharField(source='cancha.club.ciudad.nombre', read_only=True)
    departamento = serializers.CharField(source='cancha.club.departamento.nombre', read_only=True)
    
    # Estado y propiedades calculadas
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    duracion_horas = serializers.FloatField(read_only=True)
    esta_vencida = serializers.BooleanField(read_only=True)
    es_hoy = serializers.BooleanField(read_only=True)
    dias_restantes = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Reserva
        fields = [
            'id',
            'cancha',
            'cancha_nombre',
            'cancha_superficie',
            'cancha_capacidad',
            'cancha_techada',
            'club_id',
            'club_nombre',
            'club_direccion',
            'club_telefono',
            'deporte_id',
            'deporte_nombre',
            'deportista',
            'deportista_nombre',
            'deportista_telefono',
            'deportista_email',
            'ciudad',
            'departamento',
            'estado',
            'estado_display',
            'fecha',
            'hora_inicio',
            'hora_fin',
            'duracion_horas',
            'precio',
            'observaciones',
            'esta_vencida',
            'es_hoy',
            'dias_restantes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_deportista_nombre(self, obj):
        """Retorna el nombre completo del deportista"""
        return f"{obj.deportista.nombre} {obj.deportista.apellido}"


class ReservaSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado de Reserva para listados"""
    cancha_nombre = serializers.CharField(source='cancha.nombre', read_only=True)
    club_nombre = serializers.CharField(source='cancha.club.nombre', read_only=True)
    deporte_nombre = serializers.CharField(source='cancha.deporte.nombre', read_only=True)
    deportista_nombre = serializers.SerializerMethodField()
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Reserva
        fields = [
            'id',
            'cancha_nombre',
            'club_nombre',
            'deporte_nombre',
            'deportista_nombre',
            'fecha',
            'hora_inicio',
            'hora_fin',
            'precio',
            'estado',
            'estado_display'
        ]
    
    def get_deportista_nombre(self, obj):
        return f"{obj.deportista.nombre} {obj.deportista.apellido}"


# ===== SERIALIZERS DE ESCRITURA =====

class ReservaCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear una reserva"""
    
    class Meta:
        model = Reserva
        fields = [
            'cancha',
            'fecha',
            'hora_inicio',
            'hora_fin',
            'observaciones'
        ]
    
    def validate_cancha(self, value):
        """Validar que la cancha exista y esté activa"""
        if not value.is_activa:
            raise serializers.ValidationError(
                "Esta cancha no está disponible para reservas."
            )
        return value
    
    def validate_fecha(self, value):
        """Validar que la fecha sea futura"""
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "No se pueden crear reservas para fechas pasadas."
            )
        return value
    
    def validate(self, data):
        """Validaciones cruzadas"""
        # Validar que hora_fin sea mayor que hora_inicio
        if data['hora_fin'] <= data['hora_inicio']:
            raise serializers.ValidationError({
                'hora_fin': 'La hora de fin debe ser posterior a la hora de inicio.'
            })
        
        # Validar que no exista un conflicto de reservas
        cancha = data['cancha']
        fecha = data['fecha']
        hora_inicio = data['hora_inicio']
        hora_fin = data['hora_fin']
        
        # Buscar reservas que se solapen
        reservas_conflicto = Reserva.objects.filter(
            cancha=cancha,
            fecha=fecha,
            estado__in=['pendiente', 'confirmada']
        ).filter(
            # Condición de solapamiento de horarios
            hora_inicio__lt=hora_fin,
            hora_fin__gt=hora_inicio
        )
        
        if reservas_conflicto.exists():
            raise serializers.ValidationError({
                'hora_inicio': 'Ya existe una reserva para esta cancha en este horario.'
            })
        
        return data
    
    def create(self, validated_data):
        """Crear la reserva y calcular el precio automáticamente"""
        cancha = validated_data['cancha']
        fecha = validated_data['fecha']
        hora_inicio = validated_data['hora_inicio']
        hora_fin = validated_data['hora_fin']
        
        # Obtener el deportista del contexto (usuario autenticado)
        request = self.context.get('request')
        deportista = request.user.deportista_profile
        
        # Calcular el precio basado en las tarifas
        precio = self._calcular_precio(cancha, fecha, hora_inicio, hora_fin)
        
        # Crear la reserva con estado 'confirmada' automáticamente
        reserva = Reserva.objects.create(
            deportista=deportista,
            precio=precio,
            estado='confirmada',  # Confirmación automática
            **validated_data
        )
        
        return reserva
    
    def _calcular_precio(self, cancha, fecha, hora_inicio, hora_fin):
        """Calcula el precio total de la reserva basándose en las tarifas"""
        dia_semana = fecha.weekday()  # 0=Lunes, 6=Domingo
        # Convertir a formato de la DB: 0=Domingo, 1=Lunes, ..., 6=Sábado
        dia_semana_db = (dia_semana + 1) % 7
        
        # Buscar la tarifa correspondiente
        tarifa = TarifaCancha.objects.filter(
            cancha=cancha,
            dia_semana=dia_semana_db,
            hora_inicio__lte=hora_inicio,
            hora_fin__gte=hora_fin
        ).first()
        
        if tarifa:
            # Calcular duración en horas
            inicio = datetime.combine(fecha, hora_inicio)
            fin = datetime.combine(fecha, hora_fin)
            duracion = (fin - inicio).total_seconds() / 3600
            
            # Precio = tarifa por hora * duración
            return float(tarifa.precio) * duracion
        else:
            # Si no hay tarifa específica, mostrar error
            raise serializers.ValidationError({
                'hora_inicio': 'No hay tarifa disponible para este horario. Contacta al club.'
            })


# ===== SERIALIZER PARA CONSULTAR DISPONIBILIDAD =====

class DisponibilidadCanchaSerializer(serializers.Serializer):
    """Serializer para consultar la disponibilidad de una cancha en una fecha"""
    fecha = serializers.DateField(required=True)
    
    def validate_fecha(self, value):
        """Validar que la fecha sea futura"""
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "No se puede consultar disponibilidad para fechas pasadas."
            )
        return value