from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Deportista, Club
from core.models import Deporte, Departamento, Ciudad


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
            'telefono', 'deporte_favorito', 'avatar_url'
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
        validated_data.pop('password_confirm')  # Ya no se necesita
        
        # Crear el User
        user = User.objects.create_user(
            username=email,  # Usamos el email como username
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
            'disponibilidad', 'informacion', 'logo_url'
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


class LoginSerializer(serializers.Serializer):
    """Serializer para el login con token"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
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


class DeportistaSerializer(serializers.ModelSerializer):
    """Serializer para ver información del deportista"""
    email = serializers.EmailField(source='user.email', read_only=True)
    deporte_favorito_nombre = serializers.CharField(
        source='deporte_favorito.nombre', 
        read_only=True
    )
    
    class Meta:
        model = Deportista
        fields = [
            'id', 'email', 'nombre', 'apellido',
            'documento_identidad', 'telefono',
            'deporte_favorito', 'deporte_favorito_nombre',
            'avatar_url', 'is_activo'
        ]
        read_only_fields = ['id', 'email']


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
    
    class Meta:
        model = Club
        fields = [
            'id', 'email', 'nombre', 'nit',
            'direccion', 'telefono_1', 'telefono_2',
            'departamento', 'departamento_nombre',
            'ciudad', 'ciudad_nombre',
            'disponibilidad', 'informacion',
            'logo_url', 'is_activo'
        ]
        read_only_fields = ['id', 'email']