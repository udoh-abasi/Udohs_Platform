from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

# from django.apps import apps


User = get_user_model()


class UserAlreadyExistPermission(BasePermission):
    """This permission checks if the user already has an account in our database"""

    def has_permission(self, request, view):
        print("First Data", request.data)
        print(
            "First result",
            User.objects.filter(email=request.data.get("email")).exists(),
        )
        if User.objects.filter(email=request.data.get("email")).exists():
            return False
        return True


# class IsUserEmailVerifiedPermission(BasePermission):
#     """This permission checks if the user's email is verified, before allowing the user to proceed with Registering their accounts"""

#     def has_permission(self, request, view):
#         EmailVerification = apps.get_model("EmailVerification", "EmailVerification")
#         print(
#             EmailVerification.objects.filter(
#                 email=request.data.get("email"), is_email_verified=True
#             ).exists()
#         )

#         print("Data", request.data)

#         if request.method == "GET":
#             return True
#         if EmailVerification.objects.filter(
#             email=request.data.get("email"), is_email_verified=True
#         ).exists():
#             return True
#         return False
