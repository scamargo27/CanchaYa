from django.contrib import admin
from django.utils.html import format_html
from .models import Reserva

# Register your models here.

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'cancha_info',
        'deportista_info',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'precio_format',
        'estado_badge',
        'created_at'
    ]
    list_filter = [
        'estado',
        'fecha',
        'cancha__club',
        'cancha__deporte',
        'created_at'
    ]
    search_fields = [
        'cancha__nombre',
        'cancha__club__nombre',
        'deportista__nombre',
        'deportista__apellido',
        'deportista__user__email'
    ]
    
    def get_readonly_fields(self, request, obj=None):
        """Campos de solo lectura según si es creación o edición"""
        if obj:  # Editando una reserva existente
            return [
                'duracion_horas',
                'esta_vencida',
                'es_hoy',
                'dias_restantes',
                'created_at',
                'updated_at'
            ]
        else:  # Creando una nueva reserva
            return []
    
    def get_fieldsets(self, request, obj=None):
        """Fieldsets dinámicos según si es creación o edición"""
        if obj:  # Editando una reserva existente
            return (
                ('Información de la Reserva', {
                    'fields': ('cancha', 'deportista', 'estado')
                }),
                ('Fecha y Horario', {
                    'fields': ('fecha', 'hora_inicio', 'hora_fin', 'duracion_horas')
                }),
                ('Precio', {
                    'fields': ('precio',)
                }),
                ('Observaciones', {
                    'fields': ('observaciones',),
                    'classes': ('collapse',)
                }),
                ('Estado de la Reserva', {
                    'fields': ('esta_vencida', 'es_hoy', 'dias_restantes'),
                    'classes': ('collapse',)
                }),
                ('Fechas del Sistema', {
                    'fields': ('created_at', 'updated_at'),
                    'classes': ('collapse',)
                }),
            )
        else:  # Creando una nueva reserva
            return (
                ('Información de la Reserva', {
                    'fields': ('cancha', 'deportista', 'estado')
                }),
                ('Fecha y Horario', {
                    'fields': ('fecha', 'hora_inicio', 'hora_fin')
                }),
                ('Precio', {
                    'fields': ('precio',)
                }),
                ('Observaciones', {
                    'fields': ('observaciones',),
                    'classes': ('collapse',)
                }),
            )
    
    def cancha_info(self, obj):
        """Muestra información de la cancha"""
        return f"{obj.cancha.club.nombre} - {obj.cancha.nombre}"
    cancha_info.short_description = 'Cancha'
    
    def deportista_info(self, obj):
        """Muestra información del deportista"""
        return f"{obj.deportista.nombre} {obj.deportista.apellido}"
    deportista_info.short_description = 'Deportista'
    
    def precio_format(self, obj):
        """Formatea el precio"""
        return f"${obj.precio:,.0f}"
    precio_format.short_description = 'Precio'
    
    def estado_badge(self, obj):
        """Muestra el estado con un badge de color"""
        colors = {
            'pendiente': '#FFA500',  # Naranja
            'confirmada': '#28A745', # Verde
            'completada': '#6C757D', # Gris
            'cancelada': '#DC3545',  # Rojo
        }
        color = colors.get(obj.estado, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_estado_display()
        )
    estado_badge.short_description = 'Estado'
    
    def get_queryset(self, request):
        """Optimiza las queries"""
        return super().get_queryset(request).select_related(
            'cancha',
            'cancha__club',
            'cancha__deporte',
            'deportista',
            'deportista__user'
        )