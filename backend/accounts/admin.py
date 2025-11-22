from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm
from .models import User, Deportista, Club
from core.models import Departamento, Ciudad


class CustomUserCreationForm(UserCreationForm):
    """Formulario personalizado para crear usuarios"""
    
    # Campos adicionales para Club
    departamento = forms.ModelChoiceField(
        queryset=Departamento.objects.all(),
        required=False,
        label='Departamento (solo para clubes)',
        help_text='Obligatorio si el tipo de usuario es Club'
    )
    ciudad = forms.ModelChoiceField(
        queryset=Ciudad.objects.all(),
        required=False,
        label='Ciudad (solo para clubes)',
        help_text='Obligatorio si el tipo de usuario es Club'
    )
    
    class Meta:
        model = User
        fields = ('email', 'tipo_usuario')
    
    def clean(self):
        cleaned_data = super().clean()
        tipo_usuario = cleaned_data.get('tipo_usuario')
        departamento = cleaned_data.get('departamento')
        ciudad = cleaned_data.get('ciudad')
        
        # Validar que si es club, tenga departamento y ciudad
        if tipo_usuario == 'club':
            if not departamento:
                raise forms.ValidationError({
                    'departamento': 'El departamento es obligatorio para clubes.'
                })
            if not ciudad:
                raise forms.ValidationError({
                    'ciudad': 'La ciudad es obligatoria para clubes.'
                })
        
        return cleaned_data


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    
    list_display = ['email', 'tipo_usuario', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['tipo_usuario', 'is_staff', 'is_active']
    search_fields = ['email', 'username']
    ordering = ['email']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'tipo_usuario')}),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'tipo_usuario', 'password1', 'password2'),
        }),
        ('Información de ubicación (Solo para Clubes)', {
            'classes': ('wide',),
            'fields': ('departamento', 'ciudad'),
            'description': 'Estos campos son obligatorios si seleccionas "Club" como tipo de usuario.'
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Guarda el user y crea/actualiza el perfil correspondiente"""
        if not change:  # Solo en creación
            # Guardar el usuario primero (esto dispara el signal)
            super().save_model(request, obj, form, change)
            
            # Si es club, manejar el perfil
            if obj.tipo_usuario == 'club':
                departamento = form.cleaned_data.get('departamento')
                ciudad = form.cleaned_data.get('ciudad')
                
                # Verificar si el signal ya creó el club
                if hasattr(obj, 'club_profile'):
                    # Ya existe, actualizar con datos del formulario
                    club = obj.club_profile
                    club.departamento = departamento
                    club.ciudad = ciudad
                    club.nombre = obj.first_name or 'Por definir'
                    club.save()
                else:
                    # El signal no lo creó, crear manualmente
                    Club.objects.create(
                        user=obj,
                        nombre=obj.first_name or 'Por definir',
                        departamento=departamento,
                        ciudad=ciudad
                    )
            # Para deportistas no hacemos nada extra, el signal ya lo maneja
        else:
            # Si es edición, comportamiento normal
            super().save_model(request, obj, form, change)


@admin.register(Deportista)
class DeportistaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'apellido', 'documento_identidad', 'get_email', 'is_activo']
    list_filter = ['is_activo', 'deporte_favorito']
    search_fields = ['nombre', 'apellido', 'documento_identidad', 'user__email']
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'nit', 'ciudad', 'get_email', 'is_activo']
    list_filter = ['is_activo', 'departamento', 'ciudad']
    search_fields = ['nombre', 'nit', 'user__email']
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'