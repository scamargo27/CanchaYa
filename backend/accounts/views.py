from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.conf import settings

from .models import User, Deportista, Club
from .serializers import (
    DeportistaRegistroSerializer,
    ClubRegistroSerializer,
    DeportistaSerializer,
    ClubSerializer,
    DeportistaUpdateSerializer,
    ClubUpdateSerializer,
    LoginSerializer,
    CambiarPasswordSerializer,
)


# ===== VIEWSETS =====

class DeportistaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar deportistas.
    
    Endpoints generados:
    - POST   /api/accounts/deportistas/           - Registrar deportista
    - GET    /api/accounts/deportistas/           - Listar deportistas (solo admin)
    - GET    /api/accounts/deportistas/{id}/      - Ver deportista específico
    - GET    /api/accounts/deportistas/mi-perfil/ - Ver mi perfil
    - PUT    /api/accounts/deportistas/mi-perfil/ - Actualizar mi perfil completo
    - PATCH  /api/accounts/deportistas/mi-perfil/ - Actualizar mi perfil parcial
    """
    queryset = Deportista.objects.select_related('user', 'deporte_favorito').all()
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'create':
            return DeportistaRegistroSerializer
        elif self.action in ['update', 'partial_update', 'mi_perfil'] and self.request.method != 'GET':
            return DeportistaUpdateSerializer
        return DeportistaSerializer
    
    def get_permissions(self):
        """
        Permisos personalizados:
        - create: Cualquiera (registro público)
        - mi_perfil: Autenticado
        - resto: Autenticado
        """
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """
        Registro de deportista.
        POST /api/accounts/deportistas/
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deportista = serializer.save()
        
        # Crear token automáticamente
        token = Token.objects.create(user=deportista.user)
        
        # Serializar respuesta
        response_serializer = DeportistaSerializer(
            deportista, 
            context={'request': request}
        )
        
        return Response({
            'exito': True,
            'mensaje': '¡Bienvenido a CanchaYa! Tu cuenta ha sido creada exitosamente.',
            'detalle': 'Guarda tu token para futuras peticiones.',
            'token': token.key,
            'deportista': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get', 'put', 'patch'], url_path='mi-perfil')
    def mi_perfil(self, request):
        """
        Obtener o actualizar el perfil del deportista autenticado.
        
        GET    /api/accounts/deportistas/mi-perfil/
        PUT    /api/accounts/deportistas/mi-perfil/
        PATCH  /api/accounts/deportistas/mi-perfil/
        """
        # Verificar que sea deportista
        if request.user.tipo_usuario != 'deportista':
            return Response({
                'error': 'Este endpoint es solo para deportistas',
                'detalle': 'Tu tipo de usuario es: ' + request.user.tipo_usuario
            }, status=status.HTTP_403_FORBIDDEN)
        
        deportista = request.user.deportista_profile
        
        # GET - Ver perfil
        if request.method == 'GET':
            serializer = DeportistaSerializer(deportista, context={'request': request})
            return Response({
                'exito': True,
                'deportista': serializer.data
            })
        
        # PUT o PATCH - Actualizar perfil
        partial = request.method == 'PATCH'
        serializer = DeportistaUpdateSerializer(
            deportista, 
            data=request.data, 
            partial=partial,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Respuesta con datos actualizados
        response_serializer = DeportistaSerializer(deportista, context={'request': request})
        
        return Response({
            'exito': True,
            'mensaje': 'Perfil actualizado exitosamente',
            'deportista': response_serializer.data
        })
    
    @action(detail=False, methods=['post'], url_path='desactivar-cuenta')
    def desactivar_cuenta(self, request):
        """
        Desactivar la cuenta del deportista.
        POST /api/accounts/deportistas/desactivar-cuenta/
        """
        if request.user.tipo_usuario != 'deportista':
            return Response({
                'error': 'Este endpoint es solo para deportistas'
            }, status=status.HTTP_403_FORBIDDEN)
        
        deportista = request.user.deportista_profile
        deportista.is_activo = False
        deportista.save()
        
        # Desactivar también el User
        request.user.is_active = False
        request.user.save()
        
        # Eliminar token
        Token.objects.filter(user=request.user).delete()
        
        return Response({
            'exito': True,
            'mensaje': 'Tu cuenta ha sido desactivada',
            'detalle': '¡Esperamos verte pronto de vuelta!'
        }, status=status.HTTP_200_OK)


class ClubViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar clubes.
    
    Endpoints generados:
    - POST   /api/accounts/clubes/           - Registrar club
    - GET    /api/accounts/clubes/           - Listar clubes (público)
    - GET    /api/accounts/clubes/{id}/      - Ver club específico
    - GET    /api/accounts/clubes/mi-perfil/ - Ver mi perfil
    - PUT    /api/accounts/clubes/mi-perfil/ - Actualizar mi perfil completo
    - PATCH  /api/accounts/clubes/mi-perfil/ - Actualizar mi perfil parcial
    """
    queryset = Club.objects.select_related('user', 'departamento', 'ciudad').filter(is_activo=True)
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'create':
            return ClubRegistroSerializer
        elif self.action in ['update', 'partial_update', 'mi_perfil'] and self.request.method != 'GET':
            return ClubUpdateSerializer
        return ClubSerializer
    
    def get_permissions(self):
        """
        Permisos personalizados:
        - create: Cualquiera (registro público)
        - list/retrieve: Cualquiera (clubes públicos)
        - mi_perfil: Autenticado
        """
        if self.action in ['create', 'list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """
        Registro de club.
        POST /api/accounts/clubes/
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        club = serializer.save()
        
        # Crear token automáticamente
        token = Token.objects.create(user=club.user)
        
        # Serializar respuesta
        response_serializer = ClubSerializer(club, context={'request': request})
        
        return Response({
            'exito': True,
            'mensaje': '¡Club registrado exitosamente en CanchaYa!',
            'detalle': 'Tu club ya está visible en la plataforma. Guarda tu token para futuras peticiones.',
            'token': token.key,
            'club': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get', 'put', 'patch'], url_path='mi-perfil')
    def mi_perfil(self, request):
        """
        Obtener o actualizar el perfil del club autenticado.
        
        GET    /api/accounts/clubes/mi-perfil/
        PUT    /api/accounts/clubes/mi-perfil/
        PATCH  /api/accounts/clubes/mi-perfil/
        """
        # Verificar que sea club
        if request.user.tipo_usuario != 'club':
            return Response({
                'error': 'Este endpoint es solo para clubes',
                'detalle': 'Tu tipo de usuario es: ' + request.user.tipo_usuario
            }, status=status.HTTP_403_FORBIDDEN)
        
        club = request.user.club_profile
        
        # GET - Ver perfil
        if request.method == 'GET':
            serializer = ClubSerializer(club, context={'request': request})
            return Response({
                'exito': True,
                'club': serializer.data
            })
        
        # PUT o PATCH - Actualizar perfil
        partial = request.method == 'PATCH'
        serializer = ClubUpdateSerializer(
            club, 
            data=request.data, 
            partial=partial,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Respuesta con datos actualizados
        response_serializer = ClubSerializer(club, context={'request': request})
        
        return Response({
            'exito': True,
            'mensaje': 'Perfil del club actualizado exitosamente',
            'club': response_serializer.data
        })
    
    @action(detail=False, methods=['post'], url_path='desactivar-cuenta')
    def desactivar_cuenta(self, request):
        """
        Desactivar la cuenta del club.
        POST /api/accounts/clubes/desactivar-cuenta/
        """
        if request.user.tipo_usuario != 'club':
            return Response({
                'error': 'Este endpoint es solo para clubes'
            }, status=status.HTTP_403_FORBIDDEN)
        
        club = request.user.club_profile
        club.is_activo = False
        club.save()
        
        # Desactivar también el User
        request.user.is_active = False
        request.user.save()
        
        # Eliminar token
        Token.objects.filter(user=request.user).delete()
        
        return Response({
            'exito': True,
            'mensaje': 'Tu club ha sido desactivado',
            'detalle': '¡Esperamos verte pronto de vuelta!'
        }, status=status.HTTP_200_OK)


# ===== APIVIEWS (Autenticación) =====

class LoginView(APIView):
    """
    Vista para el login con token.
    POST /api/accounts/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Obtener o crear token
        token, created = Token.objects.get_or_create(user=user)
        
        # Obtener el perfil según el tipo de usuario
        if user.tipo_usuario == 'deportista':
            perfil = DeportistaSerializer(
                user.deportista_profile, 
                context={'request': request}
            ).data
            mensaje_bienvenida = f"¡Bienvenido de nuevo, {perfil['nombre']}!"
        else:  # club
            perfil = ClubSerializer(
                user.club_profile, 
                context={'request': request}
            ).data
            mensaje_bienvenida = f"¡Bienvenido de nuevo, {perfil['nombre']}!"
        
        return Response({
            'exito': True,
            'mensaje': mensaje_bienvenida,
            'detalle': 'Usa este token en el header: Authorization: Token <tu_token>',
            'token': token.key,
            'tipo_usuario': user.tipo_usuario,
            'perfil': perfil
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Vista para el logout (elimina el token).
    POST /api/accounts/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Eliminar el token del usuario
            request.user.auth_token.delete()
            return Response({
                'exito': True,
                'mensaje': '¡Hasta pronto!',
                'detalle': 'Tu sesión ha sido cerrada correctamente.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'exito': False,
                'mensaje': 'Error al cerrar sesión',
                'detalle': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class CambiarPasswordView(APIView):
    """
    Vista para cambiar contraseña del usuario autenticado.
    POST /api/accounts/auth/cambiar-password/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CambiarPasswordSerializer(
            data=request.data, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Cambiar contraseña
        user = request.user
        user.set_password(serializer.validated_data['password_nueva'])
        user.save()
        
        # Eliminar token actual (forzar re-login por seguridad)
        Token.objects.filter(user=user).delete()
        
        return Response({
            'exito': True,
            'mensaje': 'Contraseña cambiada exitosamente',
            'detalle': 'Por seguridad, debes iniciar sesión nuevamente con tu nueva contraseña.'
        }, status=status.HTTP_200_OK)


# ===== VISTAS DE UTILIDAD (Opcional - Útil para desarrollo) =====

class MiPerfilGenericoView(APIView):
    """
    Vista genérica que redirige al perfil correcto según tipo de usuario.
    GET /api/accounts/mi-perfil/
    
    DEPRECADO: Usar /api/accounts/deportistas/mi-perfil/ o /api/accounts/clubes/mi-perfil/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.tipo_usuario == 'deportista':
            perfil = DeportistaSerializer(
                user.deportista_profile, 
                context={'request': request}
            ).data
            endpoint = '/api/accounts/deportistas/mi-perfil/'
        else:  # club
            perfil = ClubSerializer(
                user.club_profile, 
                context={'request': request}
            ).data
            endpoint = '/api/accounts/clubes/mi-perfil/'
        
        return Response({
            'exito': True,
            'mensaje': 'Perfil obtenido correctamente',
            'tipo_usuario': user.tipo_usuario,
            'perfil': perfil,
            'nota': f'Este endpoint está deprecado. Usa: {endpoint}'
        }, status=status.HTTP_200_OK)