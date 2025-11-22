import django_filters
from .models import Cancha, TarifaCancha


class CanchaFilter(django_filters.FilterSet):
    """
    Filtros para buscar canchas por diferentes criterios.
    """
    # Filtros exactos
    club = django_filters.NumberFilter(field_name='club__id')
    deporte = django_filters.NumberFilter(field_name='deporte__id')
    ciudad = django_filters.NumberFilter(field_name='club__ciudad__id')
    departamento = django_filters.NumberFilter(field_name='club__departamento__id')
    
    # Filtros por nombre (búsqueda parcial)
    nombre = django_filters.CharFilter(field_name='nombre', lookup_expr='icontains')
    club_nombre = django_filters.CharFilter(field_name='club__nombre', lookup_expr='icontains')
    ciudad_nombre = django_filters.CharFilter(field_name='club__ciudad__nombre', lookup_expr='icontains')
    deporte_nombre = django_filters.CharFilter(field_name='deporte__nombre', lookup_expr='icontains')
    
    # Filtros booleanos
    is_techada = django_filters.BooleanFilter(field_name='is_techada')
    is_activa = django_filters.BooleanFilter(field_name='is_activa')
    
    # Filtros de rango
    capacidad_min = django_filters.NumberFilter(field_name='capacidad_jugadores', lookup_expr='gte')
    capacidad_max = django_filters.NumberFilter(field_name='capacidad_jugadores', lookup_expr='lte')

    class Meta:
        model = Cancha
        fields = []  # Los definimos arriba manualmente para más control

class TarifaCanchaFilter(django_filters.FilterSet):  
    """
    Filtros para buscar tarifas por diferentes criterios.
    """
    # Filtros exactos
    cancha = django_filters.NumberFilter(field_name='cancha__id')
    dia_semana = django_filters.NumberFilter(field_name='dia_semana')
    club = django_filters.NumberFilter(field_name='cancha__club__id')
    deporte = django_filters.NumberFilter(field_name='cancha__deporte__id')
    
    # Filtros de rango de precio
    precio_min = django_filters.NumberFilter(field_name='precio', lookup_expr='gte')
    precio_max = django_filters.NumberFilter(field_name='precio', lookup_expr='lte')
    
    # Filtros de horario
    hora_inicio_desde = django_filters.TimeFilter(field_name='hora_inicio', lookup_expr='gte')
    hora_inicio_hasta = django_filters.TimeFilter(field_name='hora_inicio', lookup_expr='lte')
    
    # Filtro por nombre de cancha
    cancha_nombre = django_filters.CharFilter(field_name='cancha__nombre', lookup_expr='icontains')
    
    class Meta:
        model = TarifaCancha
        fields = []