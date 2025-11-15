from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Deportista, Club

# Register your models here.
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'tipo_usuario', 'is_staff', 'is_active']
    list_filter = ['tipo_usuario', 'is_staff', 'is_active']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información adicional', {'fields': ('tipo_usuario',)}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Información adicional', {'fields': ('tipo_usuario',)}),
    )


@admin.register(Deportista)
class DeportistaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'apellido', 'documento_identidad', 'user', 'is_activo']
    list_filter = ['is_activo', 'deporte_favorito']
    search_fields = ['nombre', 'apellido', 'documento_identidad', 'user__email']


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'nit', 'ciudad', 'user', 'is_activo']
    list_filter = ['is_activo', 'departamento', 'ciudad']
    search_fields = ['nombre', 'nit', 'user__email']