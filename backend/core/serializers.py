from rest_framework import serializers
from .models import Departamento, Ciudad, Deporte


# ===== SERIALIZERS BÁSICOS =====

class DepartamentoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Departamento.
    Solo lectura - datos maestros.
    """
    cantidad_ciudades = serializers.SerializerMethodField()
    cantidad_clubes = serializers.SerializerMethodField()
    
    class Meta:
        model = Departamento
        fields = [
            'id',
            'nombre',
            'cantidad_ciudades',
            'cantidad_clubes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_cantidad_ciudades(self, obj):
        """Retorna la cantidad de ciudades en este departamento"""
        return obj.ciudades.count()
    
    def get_cantidad_clubes(self, obj):
        """Retorna la cantidad de clubes activos en este departamento"""
        return obj.clubes.filter(is_activo=True).count()


class CiudadSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Ciudad.
    Solo lectura - datos maestros.
    """
    departamento_nombre = serializers.CharField(
        source='departamento.nombre',
        read_only=True
    )
    cantidad_clubes = serializers.SerializerMethodField()
    
    class Meta:
        model = Ciudad
        fields = [
            'id',
            'nombre',
            'departamento',
            'departamento_nombre',
            'cantidad_clubes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_cantidad_clubes(self, obj):
        """Retorna la cantidad de clubes activos en esta ciudad"""
        return obj.clubes.filter(is_activo=True).count()


class DeporteSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Deporte.
    Solo lectura - datos maestros.
    """
    icono_url = serializers.SerializerMethodField()
    cantidad_canchas = serializers.SerializerMethodField()
    cantidad_deportistas = serializers.SerializerMethodField()
    
    class Meta:
        model = Deporte
        fields = [
            'id',
            'nombre',
            'descripcion',
            'icono',
            'icono_url',
            'cantidad_canchas',
            'cantidad_deportistas',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_icono_url(self, obj):
        """Retorna la URL completa del icono si existe"""
        if obj.icono:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.icono.url)
            return obj.icono.url
        return None
    
    def get_cantidad_canchas(self, obj):
        """Retorna la cantidad de canchas activas para este deporte"""
        return obj.canchas.filter(is_activa=True).count()
    
    def get_cantidad_deportistas(self, obj):
        """Retorna la cantidad de deportistas que tienen este deporte como favorito"""
        return obj.deportistas.filter(is_activo=True).count()


# ===== SERIALIZERS SIMPLIFICADOS (Para uso en otros serializers) =====

class DepartamentoSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado de Departamento para uso en otros serializers"""
    class Meta:
        model = Departamento
        fields = ['id', 'nombre']


class CiudadSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado de Ciudad para uso en otros serializers"""
    departamento_nombre = serializers.CharField(
        source='departamento.nombre',
        read_only=True
    )
    
    class Meta:
        model = Ciudad
        fields = ['id', 'nombre', 'departamento', 'departamento_nombre']


class DeporteSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado de Deporte para uso en otros serializers"""
    icono_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Deporte
        fields = ['id', 'nombre', 'icono_url']
    
    def get_icono_url(self, obj):
        """Retorna la URL completa del icono si existe"""
        if obj.icono:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.icono.url)
            return obj.icono.url
        return None


# ===== SERIALIZER CON RELACIONES (Para listados con detalles) =====

class CiudadConDepartamentoSerializer(serializers.ModelSerializer):
    """
    Serializer de Ciudad que incluye información completa del departamento.
    Útil para listados donde se necesita ver la jerarquía completa.
    """
    departamento = DepartamentoSimpleSerializer(read_only=True)
    cantidad_clubes = serializers.SerializerMethodField()
    
    class Meta:
        model = Ciudad
        fields = [
            'id',
            'nombre',
            'departamento',
            'cantidad_clubes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_cantidad_clubes(self, obj):
        """Retorna la cantidad de clubes activos en esta ciudad"""
        return obj.clubes.filter(is_activo=True).count()


class DepartamentoConCiudadesSerializer(serializers.ModelSerializer):
    """
    Serializer de Departamento que incluye la lista de sus ciudades.
    Útil para mostrar la estructura jerárquica completa.
    """
    ciudades = CiudadSimpleSerializer(many=True, read_only=True)
    cantidad_clubes = serializers.SerializerMethodField()
    
    class Meta:
        model = Departamento
        fields = [
            'id',
            'nombre',
            'ciudades',
            'cantidad_clubes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_cantidad_clubes(self, obj):
        """Retorna la cantidad de clubes activos en este departamento"""
        return obj.clubes.filter(is_activo=True).count()