from rest_framework.views import APIView
from rest_framework import permissions, status
from .models import EmailVerification
from rest_framework.response import Response
from .serializers import EmailSendSerializer
from .permissions import UserAlreadyExistPermission
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect


@method_decorator(csrf_protect, name="dispatch")
class SendEmailView(APIView):
    permission_classes = (permissions.AllowAny, UserAlreadyExistPermission)

    def post(self, request):
        try:
            email = request.data.get("email")

            serializer = EmailSendSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.send_code_to_email(email)
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_protect, name="dispatch")
class ConfirmEmailView(APIView):
    permission_classes = (permissions.AllowAny, UserAlreadyExistPermission)

    def post(self, request):
        try:
            email = request.data.get("email")
            code = request.data.get("code")

            code_exist = EmailVerification.objects.get(email=email, code=code)

            code_exist.is_email_verified = True
            code_exist.save()

            return Response(status=status.HTTP_200_OK)

        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
