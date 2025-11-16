from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Departamento, Ciudad, Deporte
from .serializers import (
    DepartamentoSerializer,
    CiudadSerializer,
    DeporteSerializer,
    DepartamentoConCiudadesSerializer,
    CiudadConDepartamentoSerializer
)


# ===== VIEWSETS =====

class DepartamentoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para Departamentos.
    
    Endpoints disponibles:
    - GET /api/core/departamentos/ - Listar todos los departamentos
    - GET /api/core/departamentos/{id}/ - Detalle de un departamento
    - GET /api/core/departamentos/{id}/con-ciudades/ - Departamento con sus ciudades
    
    Filtros disponibles:
    - ?search=nombre - Búsqueda por nombre
    """
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre', 'created_at']
    ordering = ['nombre']
    
    @action(detail=True, methods=['get'], url_path='con-ciudades')
    def con_ciudades(self, request, pk=None):
        """
        Obtiene un departamento con todas sus ciudades.
        GET /api/core/departamentos/{id}/con-ciudades/
        """
        departamento = self.get_object()
        serializer = DepartamentoConCiudadesSerializer(
            departamento,
            context={'request': request}
        )
        
        return Response({
            'exito': True,
            'departamento': serializer.data
        })
    
    def list(self, request, *args, **kwargs):
        """
        Lista todos los departamentos.
        GET /api/core/departamentos/
        
        Query params opcionales:
        - ?search=nombre - Buscar por nombre
        - ?ordering=nombre - Ordenar por campo
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'exito': True,
            'total': queryset.count(),
            'departamentos': serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        """
        Obtiene el detalle de un departamento.
        GET /api/core/departamentos/{id}/
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'exito': True,
            'departamento': serializer.data
        })


class CiudadViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para Ciudades.
    
    Endpoints disponibles:
    - GET /api/core/ciudades/ - Listar todas las ciudades
    - GET /api/core/ciudades/{id}/ - Detalle de una ciudad
    - GET /api/core/ciudades/por-departamento/{departamento_id}/ - Ciudades de un departamento
    
    Filtros disponibles:
    - ?search=nombre - Búsqueda por nombre
    - ?departamento={id} - Filtrar por departamento
    """
    queryset = Ciudad.objects.select_related('departamento').all()
    serializer_class = CiudadSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['departamento']
    search_fields = ['nombre', 'departamento__nombre']
    ordering_fields = ['nombre', 'departamento__nombre', 'created_at']
    ordering = ['nombre']
    
    @action(detail=False, methods=['get'], url_path='por-departamento/(?P<departamento_id>[^/.]+)')
    def por_departamento(self, request, departamento_id=None):
        """
        Obtiene todas las ciudades de un departamento específico.
        GET /api/core/ciudades/por-departamento/{departamento_id}/
        """
        try:
            departamento = Departamento.objects.get(id=departamento_id)
        except Departamento.DoesNotExist:
            return Response({
                'exito': False,
                'error': 'Departamento no encontrado',
                'detalle': f'No existe un departamento con id {departamento_id}'
            }, status=status.HTTP_404_NOT_FOUND)
        
        ciudades = self.queryset.filter(departamento=departamento)
        serializer = CiudadConDepartamentoSerializer(
            ciudades,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'exito': True,
            'departamento': {
                'id': departamento.id,
                'nombre': departamento.nombre
            },
            'total': ciudades.count(),
            'ciudades': serializer.data
        })
    
    def list(self, request, *args, **kwargs):
        """
        Lista todas las ciudades.
        GET /api/core/ciudades/
        
        Query params opcionales:
        - ?search=nombre - Buscar por nombre
        - ?departamento={id} - Filtrar por departamento
        - ?ordering=nombre - Ordenar por campo
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = CiudadConDepartamentoSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'exito': True,
            'total': queryset.count(),
            'ciudades': serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        """
        Obtiene el detalle de una ciudad.
        GET /api/core/ciudades/{id}/
        """
        instance = self.get_object()
        serializer = CiudadConDepartamentoSerializer(
            instance,
            context={'request': request}
        )
        
        return Response({
            'exito': True,
            'ciudad': serializer.data
        })


class DeporteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para Deportes.
    
    Endpoints disponibles:
    - GET /api/core/deportes/ - Listar todos los deportes
    - GET /api/core/deportes/{id}/ - Detalle de un deporte
    
    Filtros disponibles:
    - ?search=nombre - Búsqueda por nombre
    """
    queryset = Deporte.objects.all()
    serializer_class = DeporteSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'created_at']
    ordering = ['nombre']
    
    def list(self, request, *args, **kwargs):
        """
        Lista todos los deportes.
        GET /api/core/deportes/
        
        Query params opcionales:
        - ?search=nombre - Buscar por nombre o descripción
        - ?ordering=nombre - Ordenar por campo
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(
            queryset,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'exito': True,
            'total': queryset.count(),
            'deportes': serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        """
        Obtiene el detalle de un deporte.
        GET /api/core/deportes/{id}/
        """
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            context={'request': request}
        )
        
        return Response({
            'exito': True,
            'deporte': serializer.data
        })