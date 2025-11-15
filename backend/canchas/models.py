from django.db import models
from accounts.models import Club
from core.models import Deporte

# Create your models here.
class Cancha(models.Model):
    """
    Modelo para representar una cancha deportiva.
    Cada cancha pertenece a un club y tiene un deporte específico.
    """
    club = models.ForeignKey(
        Club,
        on_delete=models.CASCADE,
        related_name='canchas',
        help_text='Club al que pertenece la cancha'
    )
    deporte = models.ForeignKey(
        Deporte,
        on_delete=models.RESTRICT,
        related_name='canchas',
        help_text='Deporte que se practica en esta cancha'
    )
    nombre = models.CharField(
        max_length=100,
        help_text='Nombre identificativo de la cancha'
    )
    capacidad_jugadores = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Número máximo de jugadores'
    )
    superficie = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Tipo de superficie (ej: césped sintético, cemento)'
    )
    is_techada = models.BooleanField(
        default=False,
        help_text='Indica si la cancha está techada/cubierta'
    )
    is_activa = models.BooleanField(
        default=True,
        help_text='Indica si la cancha está activa para reservas'
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text='Descripción detallada de la cancha'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Cancha'
        verbose_name_plural = 'Canchas'
        ordering = ['club', 'nombre']
        unique_together = [['club', 'nombre']]  # No dos canchas con el mismo nombre en un club
    
    def __str__(self):
        return f"{self.club.nombre} - {self.nombre}"


class TarifaCancha(models.Model):
    """
    Modelo para las tarifas de las canchas por día y horario.
    Permite configurar precios diferentes según el día de la semana y franja horaria.
    """
    DIA_CHOICES = [
        (0, 'Domingo'),
        (1, 'Lunes'),
        (2, 'Martes'),
        (3, 'Miércoles'),
        (4, 'Jueves'),
        (5, 'Viernes'),
        (6, 'Sábado'),
    ]
    
    cancha = models.ForeignKey(
        Cancha,
        on_delete=models.CASCADE,
        related_name='tarifas',
        help_text='Cancha a la que aplica esta tarifa'
    )
    dia_semana = models.IntegerField(
        choices=DIA_CHOICES,
        help_text='Día de la semana (0=Domingo, 6=Sábado)'
    )
    hora_inicio = models.TimeField(
        help_text='Hora de inicio de esta tarifa'
    )
    hora_fin = models.TimeField(
        help_text='Hora de fin de esta tarifa'
    )
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Precio por hora en esta franja'
    )
    titulo = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Nombre descriptivo de la tarifa (ej: Tarifa Nocturna)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Tarifa de Cancha'
        verbose_name_plural = 'Tarifas de Canchas'
        ordering = ['cancha', 'dia_semana', 'hora_inicio']
        constraints = [
            models.CheckConstraint(
                check=models.Q(hora_fin__gt=models.F('hora_inicio')),
                name='hora_fin_mayor_que_hora_inicio'
            )
        ]
    
    def __str__(self):
        dia_nombre = dict(self.DIA_CHOICES)[self.dia_semana]
        return f"{self.cancha.nombre} - {dia_nombre} {self.hora_inicio}-{self.hora_fin}: ${self.precio}"
    
    def get_dia_display_custom(self):
        """Retorna el nombre del día en español"""
        return dict(self.DIA_CHOICES)[self.dia_semana]