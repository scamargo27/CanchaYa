from django.contrib import admin
from .models import Departamento, Ciudad, Deporte

# Register your models here.
@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre']
    search_fields = ['nombre']


@admin.register(Ciudad)
class CiudadAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'departamento']
    list_filter = ['departamento']
    search_fields = ['nombre', 'departamento__nombre']


@admin.register(Deporte)
class DeporteAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'descripcion']
    search_fields = ['nombre']