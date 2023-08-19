from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model


User = get_user_model()


class UserAlreadyExistPermission(BasePermission):
    """This permission checks if the user already has an account in our database"""

    def has_permission(self, request, view):
        if User.objects.filter(email=request.data.get("email")).exists():
            return False

        return True
