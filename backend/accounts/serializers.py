# accounts/serializers.py - VERSIÓN COMPLETA CON VIEWSETS

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Deportista, Club
from core.models import Deporte, Departamento, Ciudad


# ===== SERIALIZERS DE REGISTRO =====

class DeportistaRegistroSerializer(serializers.ModelSerializer):
    """Serializer para el registro de deportistas"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = Deportista
        fields = [
            'email', 'password', 'password_confirm',
            'nombre', 'apellido', 'documento_identidad',
            'telefono', 'deporte_favorito', 'avatar'
        ]
    
    def validate_email(self, value):
        """Verifica que el email no esté registrado"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value
    
    def validate_documento_identidad(self, value):
        """Verifica que el documento no esté registrado"""
        if Deportista.objects.filter(documento_identidad=value).exists():
            raise serializers.ValidationError("Este documento ya está registrado.")
        return value
    
    def validate(self, data):
        """Valida que las contraseñas coincidan"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Las contraseñas no coinciden."
            })
        return data
    
    def create(self, validated_data):
        """Crea el usuario y el perfil de deportista"""
        # Extraer datos
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')
        
        # Crear el User
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            tipo_usuario='deportista'
        )
        
        # Crear el perfil Deportista
        deportista = Deportista.objects.create(
            user=user,
            **validated_data
        )
        
        return deportista


class ClubRegistroSerializer(serializers.ModelSerializer):
    """Serializer para el registro de clubes"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = Club
        fields = [
            'email', 'password', 'password_confirm',
            'nombre', 'nit', 'direccion',
            'telefono_1', 'telefono_2',
            'departamento', 'ciudad',
            'disponibilidad', 'informacion', 'logo'
        ]
    
    def validate_email(self, value):
        """Verifica que el email no esté registrado"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value
    
    def validate_nit(self, value):
        """Verifica que el NIT no esté registrado"""
        if value and Club.objects.filter(nit=value).exists():
            raise serializers.ValidationError("Este NIT ya está registrado.")
        return value
    
    def validate(self, data):
        """Valida que las contraseñas coincidan"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Las contraseñas no coinciden."
            })
        return data
    
    def create(self, validated_data):
        """Crea el usuario y el perfil de club"""
        # Extraer datos
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')
        
        # Crear el User
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            tipo_usuario='club'
        )
        
        # Crear el perfil Club
        club = Club.objects.create(
            user=user,
            **validated_data
        )
        
        return club


# ===== SERIALIZERS DE LECTURA =====

class DeportistaSerializer(serializers.ModelSerializer):
    """Serializer para ver información del deportista"""
    email = serializers.EmailField(source='user.email', read_only=True)
    deporte_favorito_nombre = serializers.CharField(
        source='deporte_favorito.nombre', 
        read_only=True
    )
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Deportista
        fields = [
            'id', 'email', 'nombre', 'apellido',
            'documento_identidad', 'telefono',
            'deporte_favorito', 'deporte_favorito_nombre',
            'avatar', 'avatar_url', 'is_activo',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'updated_at']
    
    def get_avatar_url(self, obj):
        """Retorna la URL completa del avatar"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class ClubSerializer(serializers.ModelSerializer):
    """Serializer para ver información del club"""
    email = serializers.EmailField(source='user.email', read_only=True)
    departamento_nombre = serializers.CharField(
        source='departamento.nombre',
        read_only=True
    )
    ciudad_nombre = serializers.CharField(
        source='ciudad.nombre',
        read_only=True
    )
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Club
        fields = [
            'id', 'email', 'nombre', 'nit',
            'direccion', 'telefono_1', 'telefono_2',
            'departamento', 'departamento_nombre',
            'ciudad', 'ciudad_nombre',
            'disponibilidad', 'informacion',
            'logo', 'logo_url', 'is_activo',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'updated_at']
    
    def get_logo_url(self, obj):
        """Retorna la URL completa del logo"""
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


# ===== SERIALIZERS DE ACTUALIZACIÓN =====

class DeportistaUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar perfil de deportista"""
    
    class Meta:
        model = Deportista
        fields = [
            'nombre', 'apellido', 'telefono',
            'deporte_favorito', 'avatar'
        ]
    
    def validate_telefono(self, value):
        """Validar formato de teléfono"""
        if value and len(value) < 7:
            raise serializers.ValidationError(
                "El teléfono debe tener al menos 7 dígitos."
            )
        return value


class ClubUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar perfil de club"""
    
    class Meta:
        model = Club
        fields = [
            'nombre', 'direccion', 'telefono_1', 'telefono_2',
            'departamento', 'ciudad', 'disponibilidad',
            'informacion', 'logo'
        ]
    
    def validate(self, data):
        """Validar que la ciudad pertenezca al departamento"""
        ciudad = data.get('ciudad')
        departamento = data.get('departamento')
        
        # Si se están actualizando ambos, validar
        if ciudad and departamento:
            if ciudad.departamento != departamento:
                raise serializers.ValidationError({
                    "ciudad": "La ciudad debe pertenecer al departamento seleccionado."
                })
        
        # Si solo se actualiza la ciudad, validar con el departamento actual
        elif ciudad and not departamento:
            if ciudad.departamento != self.instance.departamento:
                raise serializers.ValidationError({
                    "ciudad": "La ciudad debe pertenecer al departamento actual."
                })
        
        return data


# ===== SERIALIZERS DE AUTENTICACIÓN =====

class LoginSerializer(serializers.Serializer):
    """Serializer para el login con token"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True, 
        write_only=True, 
        style={'input_type': 'password'}
    )
    
    def validate(self, data):
        """Valida las credenciales del usuario"""
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            # Buscar el usuario por email
            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    "error": "Credenciales incorrectas. Verifica tu email y contraseña."
                })
            
            # Autenticar con username y password
            user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError({
                    "error": "Credenciales incorrectas. Verifica tu email y contraseña."
                })
            
            if not user.is_active:
                raise serializers.ValidationError({
                    "error": "Esta cuenta está desactivada. Contacta al administrador."
                })
            
            data['user'] = user
        else:
            raise serializers.ValidationError({
                "error": "Debe proporcionar email y contraseña."
            })
        
        return data


class CambiarPasswordSerializer(serializers.Serializer):
    """Serializer para cambiar contraseña"""
    password_actual = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )
    password_nueva = serializers.CharField(
        required=True, 
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirmar = serializers.CharField(
        required=True, 
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'}
    )
    
    def validate(self, data):
        """Validar que las contraseñas nuevas coincidan"""
        if data['password_nueva'] != data['password_confirmar']:
            raise serializers.ValidationError({
                "password_confirmar": "Las contraseñas no coinciden."
            })
        return data
    
    def validate_password_actual(self, value):
        """Validar que la contraseña actual sea correcta"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                "La contraseña actual es incorrecta."
            )
        return value
    
    def validate_password_nueva(self, value):
        """Validar que la nueva contraseña sea diferente"""
        user = self.context['request'].user
        if user.check_password(value):
            raise serializers.ValidationError(
                "La nueva contraseña debe ser diferente a la actual."
            )
        return value