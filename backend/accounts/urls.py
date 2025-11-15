from django.urls import path
from .views import (
    DeportistaRegistroView,
    ClubRegistroView,
    LoginView,
    LogoutView,
    MiPerfilView,
    TestPermisos,
    TestAutenticado,
)

app_name = 'accounts'

urlpatterns = [
    # Registro
    path('registro/deportista/', DeportistaRegistroView.as_view(), name='registro-deportista'),
    path('registro/club/', ClubRegistroView.as_view(), name='registro-club'),
    
    # Autenticación
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Perfil
    path('mi-perfil/', MiPerfilView.as_view(), name='mi-perfil'),

    # Test (eliminar en producción)
    path('test-publico/', TestPermisos.as_view(), name='test-publico'),
    path('test-privado/', TestAutenticado.as_view(), name='test-privado'),
]