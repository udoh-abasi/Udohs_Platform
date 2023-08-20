from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

from django.apps import apps


User = get_user_model()


class UserAlreadyExistPermission(BasePermission):
    """This permission checks if the user already has an account in our database. If they do, then they are NOT given permissions. It is used to prevent already registered users from accessing the 'signup' view"""

    def has_permission(self, request, view):
        if User.objects.filter(email=request.data.get("email")).exists():
            return False
        return True
