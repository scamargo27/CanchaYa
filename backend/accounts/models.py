from django.db import models
from django.contrib.auth.models import AbstractUser
from core.models import Departamento, Ciudad, Deporte


class User(AbstractUser):
    """
    Usuario base personalizado que extiende AbstractUser de Django.
    Este modelo permite tener un campo 'tipo_usuario' para diferenciar
    entre Deportista y Club.
    """
    TIPO_USUARIO_CHOICES = [
        ('deportista', 'Deportista'),
        ('club', 'Club'),
    ]
    
    tipo_usuario = models.CharField(
        max_length=20,
        choices=TIPO_USUARIO_CHOICES,
        default='deportista'
    )
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return self.username


class Deportista(models.Model):
    """
    Perfil extendido para usuarios tipo Deportista.
    Tiene relación OneToOne con User.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='deportista_profile'
    )
    deporte_favorito = models.ForeignKey(
        Deporte,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deportistas'
    )
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    documento_identidad = models.CharField(max_length=20, unique=True)
    avatar = models.ImageField(
        upload_to='deportistas/avatars/',
        blank=True,
        null=True,
        help_text='Foto de perfil del deportista'
    )
    is_activo = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Deportista'
        verbose_name_plural = 'Deportistas'
        ordering = ['apellido', 'nombre']
    
    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class Club(models.Model):
    """
    Perfil extendido para usuarios tipo Club.
    Tiene relación OneToOne con User.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='club_profile'
    )
    nombre = models.CharField(max_length=100)
    nit = models.CharField(max_length=20, unique=True, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    telefono_1 = models.CharField(max_length=20, blank=True, null=True)
    telefono_2 = models.CharField(max_length=20, blank=True, null=True)
    disponibilidad = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Ejemplo: Lunes a Domingo 6am - 10pm'
    )
    informacion = models.TextField(blank=True, null=True)
    logo = models.ImageField(
        upload_to='clubes/logos/',
        blank=True,
        null=True,
        help_text='Logo del club deportivo'
    )
    is_activo = models.BooleanField(default=True)
    
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.RESTRICT,
        related_name='clubes'
    )
    ciudad = models.ForeignKey(
        Ciudad,
        on_delete=models.RESTRICT,
        related_name='clubes'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Club'
        verbose_name_plural = 'Clubes'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre