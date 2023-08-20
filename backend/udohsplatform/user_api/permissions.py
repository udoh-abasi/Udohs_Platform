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


# class UserExistInDatabasePermission(BasePermission):
#     """This permission checks if the user already has an account in our database. If they do, then they are given the permission to change their password. It is used to prevent non-registered users from accessing the forgot password view"""


#     def has_permission(self, request, view):
#         print(request.data.get("email"))
#         # print("Email is", email)
#         if User.objects.filter(
#             email=request.data.get("email"), auth_provider="AppUser"
#         ).exists():
#             return True

#         return False
