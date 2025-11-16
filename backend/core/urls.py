from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartamentoViewSet, CiudadViewSet, DeporteViewSet

app_name = 'core'

# Router para los ViewSets
router = DefaultRouter()
router.register(r'departamentos', DepartamentoViewSet, basename='departamento')
router.register(r'ciudades', CiudadViewSet, basename='ciudad')
router.register(r'deportes', DeporteViewSet, basename='deporte')

urlpatterns = [
    path('', include(router.urls)),
]

""""
=== ENDPOINTS DISPONIBLES ===

DEPARTAMENTOS:
- GET /api/core/departamentos/ - Listar todos
- GET /api/core/departamentos/{id}/ - Detalle
- GET /api/core/departamentos/{id}/con-ciudades/ - Con ciudades incluidas
- GET /api/core/departamentos/?search=nombre - Buscar por nombre

CIUDADES:
- GET /api/core/ciudades/ - Listar todas
- GET /api/core/ciudades/{id}/ - Detalle
- GET /api/core/ciudades/por-departamento/{dept_id}/ - Por departamento
- GET /api/core/ciudades/?departamento={id} - Filtrar por departamento
- GET /api/core/ciudades/?search=nombre - Buscar por nombre

DEPORTES:
- GET /api/core/deportes/ - Listar todos
- GET /api/core/deportes/{id}/ - Detalle
- GET /api/core/deportes/?search=nombre - Buscar por nombre
"""