from django.contrib import admin
from .models import Departamento, Ciudad, Deporte

# Register your models here.

class CiudadInline(admin.TabularInline):
    """Inline para mostrar ciudades dentro del departamento"""
    model = Ciudad
    extra = 1
    fields = ['nombre']


@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'cantidad_ciudades', 'cantidad_clubes', 'created_at']
    search_fields = ['nombre']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [CiudadInline]
    
    fieldsets = (
        ('Información', {
            'fields': ('nombre',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def cantidad_ciudades(self, obj):
        """Muestra la cantidad de ciudades del departamento"""
        return obj.ciudades.count()
    cantidad_ciudades.short_description = 'Ciudades'
    
    def cantidad_clubes(self, obj):
        """Muestra la cantidad de clubes activos del departamento"""
        return obj.clubes.filter(is_activo=True).count()
    cantidad_clubes.short_description = 'Clubes Activos'


@admin.register(Ciudad)
class CiudadAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'departamento', 'cantidad_clubes', 'created_at']
    list_filter = ['departamento']
    search_fields = ['nombre', 'departamento__nombre']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información', {
            'fields': ('departamento', 'nombre')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def cantidad_clubes(self, obj):
        """Muestra la cantidad de clubes activos de la ciudad"""
        return obj.clubes.filter(is_activo=True).count()
    cantidad_clubes.short_description = 'Clubes Activos'


@admin.register(Deporte)
class DeporteAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'tiene_icono', 'cantidad_canchas', 'cantidad_deportistas', 'created_at']
    search_fields = ['nombre', 'descripcion']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información', {
            'fields': ('nombre', 'descripcion')
        }),
        ('Icono', {
            'fields': ('icono',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def tiene_icono(self, obj):
        """Indica si el deporte tiene icono"""
        return bool(obj.icono)
    tiene_icono.boolean = True
    tiene_icono.short_description = 'Icono'
    
    def cantidad_canchas(self, obj):
        """Muestra la cantidad de canchas activas para este deporte"""
        return obj.canchas.filter(is_activa=True).count()
    cantidad_canchas.short_description = 'Canchas Activas'
    
    def cantidad_deportistas(self, obj):
        """Muestra la cantidad de deportistas que lo tienen como favorito"""
        return obj.deportistas.filter(is_activo=True).count()
    cantidad_deportistas.short_description = 'Deportistas'