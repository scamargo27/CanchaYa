from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservaViewSet

app_name = 'reservas'

# Router para los ViewSets
router = DefaultRouter()
router.register(r'', ReservaViewSet, basename='reserva')

urlpatterns = [
    path('', include(router.urls)),
]
