from rest_framework import serializers
from .models import Cancha, TarifaCancha
from accounts.models import Club
from core.models import Deporte


class TarifaCanchaSerializer(serializers.ModelSerializer):
    """Serializer para las tarifas de canchas"""
    dia_semana_display = serializers.CharField(source='get_dia_display_custom', read_only=True)
    
    class Meta:
        model = TarifaCancha
        fields = [
            'id', 'cancha', 'dia_semana', 'dia_semana_display',
            'hora_inicio', 'hora_fin', 'precio', 'titulo',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validar que hora_fin sea mayor que hora_inicio"""
        if data.get('hora_fin') and data.get('hora_inicio'):
            if data['hora_fin'] <= data['hora_inicio']:
                raise serializers.ValidationError({
                    "hora_fin": "La hora de fin debe ser mayor que la hora de inicio."
                })
        return data


class TarifaCanchaCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear/actualizar tarifas (sin el campo cancha en el body)"""
    dia_semana_display = serializers.CharField(source='get_dia_display_custom', read_only=True)
    
    class Meta:
        model = TarifaCancha
        fields = [
            'id', 'dia_semana', 'dia_semana_display',
            'hora_inicio', 'hora_fin', 'precio', 'titulo'
        ]
        read_only_fields = ['id','dia_semana_display']
    
    def validate(self, data):
        """Validar que hora_fin sea mayor que hora_inicio"""
        if data.get('hora_fin') and data.get('hora_inicio'):
            if data['hora_fin'] <= data['hora_inicio']:
                raise serializers.ValidationError({
                    "hora_fin": "La hora de fin debe ser mayor que la hora de inicio."
                })
        return data


class CanchaListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar canchas"""
    club_nombre = serializers.CharField(source='club.nombre', read_only=True)
    deporte_nombre = serializers.CharField(source='deporte.nombre', read_only=True)
    ciudad = serializers.CharField(source='club.ciudad.nombre', read_only=True)
    departamento = serializers.CharField(source='club.departamento.nombre', read_only=True)
    
    class Meta:
        model = Cancha
        fields = [
            'id', 'nombre', 'club', 'club_nombre', 'deporte', 'deporte_nombre',
            'ciudad', 'departamento', 'capacidad_jugadores', 'superficie',
            'is_techada', 'is_activa'
        ]


class CanchaDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para ver una cancha específica"""
    club_nombre = serializers.CharField(source='club.nombre', read_only=True)
    club_email = serializers.EmailField(source='club.user.email', read_only=True)
    club_telefono = serializers.CharField(source='club.telefono_1', read_only=True)
    club_direccion = serializers.CharField(source='club.direccion', read_only=True)
    deporte_nombre = serializers.CharField(source='deporte.nombre', read_only=True)
    ciudad = serializers.CharField(source='club.ciudad.nombre', read_only=True)
    departamento = serializers.CharField(source='club.departamento.nombre', read_only=True)
    tarifas = TarifaCanchaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cancha
        fields = [
            'id', 'nombre', 'club', 'club_nombre', 'club_email', 'club_telefono',
            'club_direccion', 'deporte', 'deporte_nombre', 'ciudad', 'departamento',
            'capacidad_jugadores', 'superficie', 'is_techada', 'is_activa',
            'descripcion', 'tarifas', 'created_at', 'updated_at'
        ]


class CanchaCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear y actualizar canchas (solo para clubes propietarios)"""
    
    class Meta:
        model = Cancha
        fields = [
            'id', 'deporte', 'nombre', 'capacidad_jugadores',
            'superficie', 'is_techada', 'is_activa', 'descripcion'
        ]
        read_only_fields = ['id']
    
    def validate_nombre(self, value):
        """Validar que el nombre no esté vacío"""
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre de la cancha no puede estar vacío.")
        return value.strip()
    
    def create(self, validated_data):
        """Crear cancha asignando automáticamente el club del usuario autenticado"""
        # El club se asigna desde la vista
        return super().create(validated_data)