from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, time
from canchas.models import Cancha
from accounts.models import Deportista

# Create your models here.

class Reserva(models.Model):
    """
    Modelo para representar una reserva de cancha.
    Una reserva conecta un deportista con una cancha en una fecha y hora específicas.
    """
    ESTADO_CHOICES = [
        #('pendiente', 'Pendiente'),       # Para futuras versiones
        ('confirmada', 'Confirmada'),     # Estado por defecto (automático)
        #('completada', 'Completada'),     # Para futuras versiones
        #('cancelada', 'Cancelada'),       # Para futuras versiones
    ]
    
    cancha = models.ForeignKey(
        Cancha,
        on_delete=models.RESTRICT,
        related_name='reservas',
        help_text='Cancha reservada'
    )
    deportista = models.ForeignKey(
        Deportista,
        on_delete=models.RESTRICT,
        related_name='reservas',
        help_text='Deportista que realiza la reserva'
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='confirmada',  # Se confirma automáticamente
        help_text='Estado actual de la reserva'
    )
    fecha = models.DateField(
        help_text='Fecha de la reserva'
    )
    hora_inicio = models.TimeField(
        help_text='Hora de inicio de la reserva'
    )
    hora_fin = models.TimeField(
        help_text='Hora de fin de la reserva'
    )
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Precio total de la reserva (calculado automáticamente)'
    )
    observaciones = models.TextField(
        blank=True,
        null=True,
        help_text='Observaciones adicionales del deportista'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
        ordering = ['-fecha', '-hora_inicio']
        constraints = [
            models.CheckConstraint(
                check=models.Q(hora_fin__gt=models.F('hora_inicio')),
                name='hora_fin_mayor_que_hora_inicio_reserva'
            )
        ]
    
    def __str__(self):
        return f"Reserva #{self.id} - {self.cancha.nombre} - {self.fecha} {self.hora_inicio}"
    
    def clean(self):
        """Validaciones personalizadas"""
        # Validar que hora_fin sea mayor que hora_inicio
        if self.hora_fin <= self.hora_inicio:
            raise ValidationError({
                'hora_fin': 'La hora de fin debe ser posterior a la hora de inicio.'
            })
        
        # Validar que la fecha no sea en el pasado
        if self.fecha < timezone.now().date():
            raise ValidationError({
                'fecha': 'No se pueden crear reservas para fechas pasadas.'
            })
        
        # Validar que la cancha esté activa
        if not self.cancha.is_activa:
            raise ValidationError({
                'cancha': 'Esta cancha no está disponible para reservas.'
            })
        
        # Validar que el deportista esté activo
        if not self.deportista.is_activo:
            raise ValidationError({
                'deportista': 'Este deportista no puede realizar reservas.'
            })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def duracion_horas(self):
        """Calcula la duración de la reserva en horas"""
        inicio = datetime.combine(self.fecha, self.hora_inicio)
        fin = datetime.combine(self.fecha, self.hora_fin)
        duracion = (fin - inicio).total_seconds() / 3600
        return duracion
    
    @property
    def esta_vencida(self):
        """Verifica si la reserva ya pasó"""
        ahora = timezone.now()
        fecha_hora_fin = datetime.combine(self.fecha, self.hora_fin)
        # Hacer timezone-aware si es necesario
        if timezone.is_naive(fecha_hora_fin):
            fecha_hora_fin = timezone.make_aware(fecha_hora_fin)
        return ahora > fecha_hora_fin
    
    @property
    def es_hoy(self):
        """Verifica si la reserva es para hoy"""
        return self.fecha == timezone.now().date()
    
    @property
    def dias_restantes(self):
        """Calcula los días que faltan para la reserva"""
        hoy = timezone.now().date()
        if self.fecha < hoy:
            return 0
        return (self.fecha - hoy).days