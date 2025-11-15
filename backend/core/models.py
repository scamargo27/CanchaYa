from django.db import models

# Create your models here.
class Departamento(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    
    class Meta:
        verbose_name = 'Departamento'
        verbose_name_plural = 'Departamentos'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre


class Ciudad(models.Model):
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.RESTRICT,
        related_name='ciudades'
    )
    nombre = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = 'Ciudad'
        verbose_name_plural = 'Ciudades'
        ordering = ['nombre']
        unique_together = [['departamento', 'nombre']]
    
    def __str__(self):
        return f"{self.nombre}, {self.departamento.nombre}"


class Deporte(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    icono_url = models.URLField(max_length=255, blank=True, null=True)
    
    class Meta:
        verbose_name = 'Deporte'
        verbose_name_plural = 'Deportes'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre