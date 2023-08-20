from rest_framework.views import APIView
from rest_framework import permissions, status
from .models import PasswordEmailVerification
from rest_framework.response import Response
from .serializers import EmailSendSerializer
from django.contrib.auth import get_user_model


User = get_user_model()


class SendEmailView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        if not User.objects.filter(
            email=request.data.get("email"), auth_provider="AppUser"
        ).exists():
            return Response(
                {
                    "message": "User not found. It's possible you signed in with google. Please continue your sign in with google or create an account"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            email = request.data.get("email")

            serializer = EmailSendSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.send_code_to_email(email)
            return Response(status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class ConfirmEmailView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        if not User.objects.filter(
            email=request.data.get("email"), auth_provider="AppUser"
        ).exists():
            return Response(
                {
                    "message": "User not found. It's possible you signed in with google. Please continue your sign in with google or create an account"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            email = request.data.get("email")
            code = request.data.get("code")

            code_exist = PasswordEmailVerification.objects.get(email=email, code=code)

            code_exist.is_email_verified = True
            code_exist.save()

            return Response(status=status.HTTP_200_OK)

        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
