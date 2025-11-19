from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Deportista, Club


@receiver(post_save, sender=User)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    """
    Signal que crea automáticamente el perfil (Deportista o Club)
    cuando se crea un nuevo User.
    """
    if created:
        if instance.tipo_usuario == 'deportista':
            Deportista.objects.get_or_create(
                user=instance,
                defaults={
                    'nombre': instance.first_name or 'Por definir',
                    'apellido': instance.last_name or 'Por definir',
                    'documento_identidad': f'TEMP-{instance.id}'
                }
            )
        
        elif instance.tipo_usuario == 'club':
            from core.models import Departamento, Ciudad
            
            ## Obtener el primer departamento y ciudad disponibles
            departamento_default = Departamento.objects.first()
            ciudad_default = Ciudad.objects.first()
            
            ## Solo crear el club si existen departamento y ciudad
            if departamento_default and ciudad_default:
                Club.objects.get_or_create(
                    user=instance,
                    defaults={
                        'nombre': instance.first_name or 'Por definir',
                        'departamento': departamento_default,
                        'ciudad': ciudad_default
                    }
                )