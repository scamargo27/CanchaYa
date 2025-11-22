from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DeportistaViewSet,
    ClubViewSet,
    LoginView,
    LogoutView,
    CambiarPasswordView,
    MiPerfilGenericoView,
)

app_name = 'accounts'

# ===== ROUTER PARA VIEWSETS =====
router = DefaultRouter()
router.register(r'deportistas', DeportistaViewSet, basename='deportista')
router.register(r'clubes', ClubViewSet, basename='club')

urlpatterns = [
    # ===== AUTENTICACIÓN (APIViews) =====
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/cambiar-password/', CambiarPasswordView.as_view(), name='cambiar-password'),
    
    # ===== PERFIL GENÉRICO (Deprecado pero útil) =====
    path('mi-perfil/', MiPerfilGenericoView.as_view(), name='mi-perfil-generico'),
    
    # ===== VIEWSETS (Router automático) =====
    path('', include(router.urls)),
]

"""
ENDPOINTS:

DEPORTISTAS:
├── POST   /api/accounts/deportistas/                    - Registro
├── GET    /api/accounts/deportistas/                    - Listar (admin)
├── GET    /api/accounts/deportistas/{id}/               - Ver específico
├── GET    /api/accounts/deportistas/mi-perfil/          - Mi perfil
├── PUT    /api/accounts/deportistas/mi-perfil/          - Actualizar completo
├── PATCH  /api/accounts/deportistas/mi-perfil/          - Actualizar parcial
└── POST   /api/accounts/deportistas/desactivar-cuenta/  - Desactivar

CLUBES:
├── POST   /api/accounts/clubes/                    - Registro
├── GET    /api/accounts/clubes/                    - Listar (público)
├── GET    /api/accounts/clubes/{id}/               - Ver específico
├── GET    /api/accounts/clubes/mi-perfil/          - Mi perfil
├── PUT    /api/accounts/clubes/mi-perfil/          - Actualizar completo
├── PATCH  /api/accounts/clubes/mi-perfil/          - Actualizar parcial
└── POST   /api/accounts/clubes/desactivar-cuenta/  - Desactivar

AUTENTICACIÓN:
├── POST   /api/accounts/auth/login/            - Login
├── POST   /api/accounts/auth/logout/           - Logout
└── POST   /api/accounts/auth/cambiar-password/ - Cambiar contraseña

UTILIDAD:
└── GET    /api/accounts/mi-perfil/  - Perfil genérico 
"""