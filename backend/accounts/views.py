from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.conf import settings
from .models import Deportista, Club
from .serializers import (
    DeportistaRegistroSerializer,
    ClubRegistroSerializer,
    LoginSerializer,
    DeportistaSerializer,
    ClubSerializer
)


class DeportistaRegistroView(generics.CreateAPIView):
    """
    Vista para el registro de deportistas.
    POST /api/auth/registro/deportista/
    """
    serializer_class = DeportistaRegistroSerializer
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, *args, **kwargs):
        """Permite ver el formulario solo en modo DEBUG"""
        if settings.DEBUG:
            serializer = self.get_serializer()
            return Response({
                'mensaje': 'Formulario de registro para deportistas',
                'campos': serializer.data
            })
        return Response(
            {
                "mensaje": "Método GET no permitido en producción",
                "detalle": "Use POST para registrar un deportista"
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deportista = serializer.save()
        
        # Crear token automáticamente al registrarse
        token = Token.objects.create(user=deportista.user)
        
        return Response({
            'exito': True,
            'mensaje': '¡Bienvenido a CanchaYa! Tu cuenta de deportista ha sido creada exitosamente.',
            'detalle': 'Guarda tu token para futuras peticiones.',
            'token': token.key,
            'deportista': DeportistaSerializer(deportista).data
        }, status=status.HTTP_201_CREATED)


class ClubRegistroView(generics.CreateAPIView):
    """
    Vista para el registro de clubes.
    POST /api/auth/registro/club/
    """
    serializer_class = ClubRegistroSerializer
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, *args, **kwargs):
        """Permite ver el formulario solo en modo DEBUG"""
        if settings.DEBUG:
            serializer = self.get_serializer()
            return Response({
                'mensaje': 'Formulario de registro para clubes deportivos',
                'campos': serializer.data
            })
        return Response(
            {
                "mensaje": "Método GET no permitido en producción",
                "detalle": "Use POST para registrar un club"
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        club = serializer.save()
        
        # Crear token automáticamente al registrarse
        token = Token.objects.create(user=club.user)
        
        return Response({
            'exito': True,
            'mensaje': '¡Club registrado exitosamente en CanchaYa!',
            'detalle': 'Tu club ya está visible en la plataforma. Guarda tu token para futuras peticiones.',
            'token': token.key,
            'club': ClubSerializer(club).data
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Vista para el login con token.
    POST /api/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, *args, **kwargs):
        """Permite ver el formulario solo en modo DEBUG"""
        if settings.DEBUG:
            serializer = LoginSerializer()
            return Response({
                'mensaje': 'Formulario de inicio de sesión',
                'detalle': 'Ingresa tu email y contraseña para obtener tu token de autenticación',
                'campos': serializer.data
            })
        return Response(
            {
                "mensaje": "Método GET no permitido en producción",
                "detalle": "Use POST para iniciar sesión"
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Obtener o crear token
        token, created = Token.objects.get_or_create(user=user)
        
        # Obtener el perfil según el tipo de usuario
        if user.tipo_usuario == 'deportista':
            perfil = DeportistaSerializer(user.deportista_profile).data
            mensaje_bienvenida = f"¡Bienvenido de nuevo, {perfil['nombre']}!"
        else:  # club
            perfil = ClubSerializer(user.club_profile).data
            mensaje_bienvenida = f"¡Bienvenido de nuevo, {perfil['nombre']}!"
        
        return Response({
            'exito': True,
            'mensaje': mensaje_bienvenida,
            'detalle': 'Usa este token en el header Authorization: Token <tu_token>',
            'token': token.key,
            'tipo_usuario': user.tipo_usuario,
            'perfil': perfil
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Vista para el logout (elimina el token).
    POST /api/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Eliminar el token del usuario
        try:
            request.user.auth_token.delete()
            return Response({
                'exito': True,
                'mensaje': '¡Hasta pronto!',
                'detalle': 'Tu token ha sido eliminado. Deberás iniciar sesión nuevamente.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'exito': False,
                'mensaje': 'Error al cerrar sesión',
                'detalle': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class MiPerfilView(APIView):
    """
    Vista para obtener el perfil del usuario autenticado.
    GET /api/auth/mi-perfil/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.tipo_usuario == 'deportista':
            perfil = DeportistaSerializer(user.deportista_profile).data
            mensaje = 'Perfil de deportista obtenido correctamente'
        else:  # club
            perfil = ClubSerializer(user.club_profile).data
            mensaje = 'Perfil de club obtenido correctamente'
        
        return Response({
            'exito': True,
            'mensaje': mensaje,
            'tipo_usuario': user.tipo_usuario,
            'perfil': perfil
        }, status=status.HTTP_200_OK)


# ===== VISTAS DE TEST (Eliminar en producción) =====

class TestPermisos(APIView):
    """
    Vista de prueba para verificar permisos - Acceso público
    GET /api/auth/test-publico/
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({
            'exito': True,
            'mensaje': 'Esta es una vista pública',
            'detalle': 'Cualquier persona puede acceder a este endpoint sin autenticación',
            'autenticado': request.user.is_authenticated,
            'usuario': str(request.user) if request.user.is_authenticated else 'Anónimo'
        }, status=status.HTTP_200_OK)


class TestAutenticado(APIView):
    """
    Vista de prueba que requiere autenticación
    GET /api/auth/test-privado/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            'exito': True,
            'mensaje': 'Esta es una vista privada',
            'detalle': 'Solo usuarios autenticados pueden acceder a este endpoint',
            'usuario': str(request.user),
            'tipo_usuario': request.user.tipo_usuario,
            'token_usado': request.auth.key if request.auth else None
        }, status=status.HTTP_200_OK)