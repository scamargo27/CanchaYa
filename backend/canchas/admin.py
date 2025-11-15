from django.contrib import admin
from .models import Cancha, TarifaCancha

#Register your models here

class TarifaCanchaInline(admin.TabularInline):
    """Inline para mostrar tarifas dentro de la cancha"""
    model = TarifaCancha
    extra = 1
    fields = ['dia_semana', 'hora_inicio', 'hora_fin', 'precio', 'titulo']


@admin.register(Cancha)
class CanchaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'club', 'deporte', 'superficie', 'is_techada', 'is_activa']
    list_filter = ['is_activa', 'is_techada', 'deporte', 'club']
    search_fields = ['nombre', 'club__nombre', 'descripcion']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [TarifaCanchaInline]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('club', 'deporte', 'nombre')
        }),
        ('Características', {
            'fields': ('capacidad_jugadores', 'superficie', 'is_techada', 'descripcion')
        }),
        ('Estado', {
            'fields': ('is_activa',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TarifaCancha)
class TarifaCanchaAdmin(admin.ModelAdmin):
    list_display = ['id', 'cancha', 'get_dia_display', 'hora_inicio', 'hora_fin', 'precio', 'titulo']
    list_filter = ['dia_semana', 'cancha__club', 'cancha__deporte']
    search_fields = ['cancha__nombre', 'titulo']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Cancha', {
            'fields': ('cancha',)
        }),
        ('Horario', {
            'fields': ('dia_semana', 'hora_inicio', 'hora_fin')
        }),
        ('Precio', {
            'fields': ('precio', 'titulo')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_dia_display(self, obj):
        return obj.get_dia_display_custom()
    get_dia_display.short_description = 'Día'