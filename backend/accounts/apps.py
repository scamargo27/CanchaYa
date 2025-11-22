from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    #verbose_name = 'Cuentas'

    def ready(self):
        """Importa los signals cuando la app esté lista"""
        import accounts.signals