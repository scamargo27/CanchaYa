from django.db import models

class Departamento(models.Model):
    """
    Modelo para los departamentos de Colombia.
    Datos maestros que se usan para ubicación de clubes.
    """
    nombre = models.CharField(
        max_length=50, 
        unique=True,
        help_text='Nombre del departamento'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Departamento'
        verbose_name_plural = 'Departamentos'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre


class Ciudad(models.Model):
    """
    Modelo para las ciudades/municipios.
    Cada ciudad pertenece a un departamento.
    Datos maestros que se usan para ubicación de clubes.
    """
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.RESTRICT,
        related_name='ciudades',
        help_text='Departamento al que pertenece la ciudad'
    )
    nombre = models.CharField(
        max_length=100,
        help_text='Nombre de la ciudad o municipio'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Ciudad'
        verbose_name_plural = 'Ciudades'
        ordering = ['nombre']
        unique_together = [['departamento', 'nombre']]
    
    def __str__(self):
        return f"{self.nombre}, {self.departamento.nombre}"


class Deporte(models.Model):
    """
    Modelo para representar un deporte disponible en la plataforma.
    Datos maestros que se usan para clasificar canchas y preferencias de deportistas.
    """
    nombre = models.CharField(
        max_length=50, 
        unique=True,
        help_text='Nombre del deporte'
    )
    descripcion = models.TextField(
        blank=True, 
        null=True,
        help_text='Descripción del deporte'
    )
    icono = models.ImageField(
        upload_to='deportes/iconos/',
        blank=True,
        null=True,
        help_text='Icono representativo del deporte'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Deporte'
        verbose_name_plural = 'Deportes'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre