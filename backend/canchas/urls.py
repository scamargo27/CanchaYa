from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CanchaViewSet, TarifaCanchaViewSet

app_name = 'canchas'

# Router para los viewsets
router = DefaultRouter()
router.register(r'tarifas', TarifaCanchaViewSet, basename='tarifa')

# URLs personalizadas para canchas
cancha_list = CanchaViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

cancha_detail = CanchaViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

cancha_tarifas = CanchaViewSet.as_view({
    'get': 'tarifas'
})

cancha_crear_tarifa = CanchaViewSet.as_view({
    'post': 'crear_tarifa'
})

urlpatterns = [
    # Canchas
    path('canchas/', cancha_list, name='cancha-list'),
    path('canchas/<int:pk>/', cancha_detail, name='cancha-detail'),
    path('canchas/<int:pk>/tarifas/', cancha_tarifas, name='cancha-tarifas'),
    path('canchas/<int:pk>/crear-tarifa/', cancha_crear_tarifa, name='cancha-crear-tarifa'),
    
    # Tarifas (usando el router)
    path('', include(router.urls)),
]

"""

 GET    /api/canchas/                    - Listar canchas GET    /api/canchas/                    - Listar canchas
 POST   /api/canchas/                    - Crear cancha POST   /api/canchas/                    - Crear cancha
 GET    /api/canchas/{id}/               - Ver detalle GET    /api/canchas/{id}/               - Ver detalle
 PUT    /api/canchas/{id}/               - Actualizar completo PUT    /api/canchas/{id}/               - Actualizar completo
 PATCH  /api/canchas/{id}/               - Actualizar parcial PATCH  /api/canchas/{id}/               - Actualizar parcial
 DELETE /api/canchas/{id}/               - Eliminar DELETE /api/canchas/{id}/               - Eliminar
 GET    /api/canchas/{id}/tarifas/       - Ver tarifas GET    /api/canchas/{id}/tarifas/       - Ver tarifas
 POST   /api/canchas/{id}/crear-tarifa/  - Crear tarifa

 GET    /api/tarifas/      - Listar tarifas
 GET    /api/tarifas/      - Listar tarifas
 POST   /api/tarifas/      - Crear tarifa
 POST   /api/tarifas/      - Crear tarifa
 GET    /api/tarifas/{id}/ - Ver detalle
 GET    /api/tarifas/{id}/ - Ver detalle
 PUT    /api/tarifas/{id}/ - Actualizar completo
 PUT    /api/tarifas/{id}/ - Actualizar completo
 PATCH  /api/tarifas/{id}/ - Actualizar parcial
 PATCH  /api/tarifas/{id}/ - Actualizar parcial
 DELETE /api/tarifas/{id}/ - Eliminar

 """