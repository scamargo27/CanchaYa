from rest_framework import permissions


class IsDeportistaOrClubOwner(permissions.BasePermission):
    """
    Permiso personalizado para reservas:
    - Deportistas pueden ver/crear sus propias reservas
    - Clubes pueden ver reservas de sus canchas
    """
    
    def has_permission(self, request, view):
        """Verifica que el usuario esté autenticado"""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Verifica permisos a nivel de objeto (reserva específica).
        - Deportistas solo acceden a sus reservas
        - Clubes solo acceden a reservas de sus canchas
        """
        user = request.user
        
        # Deportistas solo ven sus reservas
        if user.tipo_usuario == 'deportista':
            return obj.deportista == user.deportista_profile
        
        # Clubes solo ven reservas de sus canchas
        elif user.tipo_usuario == 'club':
            return obj.cancha.club == user.club_profile
        
        return False