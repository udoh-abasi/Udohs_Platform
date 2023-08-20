from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model


User = get_user_model()


class UserExistInDatabasePermission(BasePermission):
    """This permission checks if the user already has an account in our database. If they do, then they are given the permission to change their password"""

    def has_permission(self, request, view):
        if User.objects.filter(
            email=request.data.get("email"), auth_provider="AppUser"
        ).exists():
            return True

        return False
