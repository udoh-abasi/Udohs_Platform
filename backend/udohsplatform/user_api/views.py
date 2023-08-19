from django.contrib.auth import login, logout, get_user_model, authenticate
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import (
    UserSerializer,
    UserLoginSerializer,
    UserRegisterSerializer,
    SendLink,
)
from .validation import custom_validation, validate_email, validate_password
from rest_framework import permissions, status

from rest_framework.generics import GenericAPIView

import requests
from urllib.parse import urlencode, unquote
import os


User = get_user_model()


class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        print(request.data)
        clean_data = custom_validation(request.data)
        serializer = UserRegisterSerializer(data=clean_data)

        if serializer.is_valid(raise_exception=True):
            user = serializer.create(clean_data)
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        data = request.data
        print(data)
        assert validate_email(data)
        assert validate_password(data)

        try:
            user = User.objects.get(email=data["email"], auth_provider="google")
            return Response(
                {
                    "response": "You signed up with google, please click 'Sign in to google' to continue",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        except:
            pass

        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.check_user(data)
            login(request, user)
            return Response(serializer.data["email"], status=status.HTTP_200_OK)


class UserLogout(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({"user": serializer.data}, status=status.HTTP_200_OK)


class SendLinkTo(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        clientID = os.environ.get("GOOGLE_CLIENT_ID")
        redirectURL = "http://localhost:8000/api/getgoogledata"

        # Construct the authorization URL
        auth_url = "https://accounts.google.com/o/oauth2/auth?" + urlencode(
            {
                "response_type": "code",
                "client_id": clientID,
                "redirect_uri": redirectURL,
                "scope": "openid email profile",
            }
        )

        serializer = SendLink(data={"auth_url": auth_url})

        if serializer.is_valid(raise_exception=True):
            return Response({"theURL": serializer.data}, status=status.HTTP_200_OK)


class GetGoogleUserData(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        google_code = request.GET.get("code")
        print(google_code)

        # Replace with the authorization code obtained from the callback
        if google_code:
            authorization_code = unquote(google_code)

            print(authorization_code)

            client_id = os.environ.get("GOOGLE_CLIENT_ID")
            client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")

            token_url = "https://oauth2.googleapis.com/token"
            token_data = {
                "code": authorization_code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": "http://localhost:8000/api/getgoogledata",
                "grant_type": "authorization_code",
            }

            response = requests.post(token_url, data=token_data)
            token_data = response.json()

            print("Token data", token_data)

            try:
                access_token = token_data["access_token"]
                # refresh_token = token_data.get("refresh_token")

                headers = {"Authorization": f"Bearer {access_token}"}

                response = requests.get(
                    "https://people.googleapis.com/v1/people/me?personFields=emailAddresses,names",
                    headers=headers,
                )
                profile_data = response.json()

                email = profile_data.get("emailAddresses", [{}])[0].get("value", None)
                first_name = profile_data.get("names", [{}])[0].get("givenName", None)
                last_name = profile_data.get("names", [{}])[0].get("familyName", None)
                print("Profile Field is", profile_data)

                print("User's Email:", email)

                if email:
                    try:
                        user = User.objects.get(email=email, auth_provider="google")

                        user = authenticate(
                            username=email,
                            password=os.environ.get("GOOGLE_USER_PASSWORD"),
                        )
                        login(request, user)

                        user = User.objects.get(email=email)
                        serializer = UserSerializer(user)
                        return Response(serializer.data, status=status.HTTP_200_OK)
                    except:
                        try:
                            User.objects.get(email=email)
                            return Response(
                                {"User already authenticated, Please log in."},
                                status=status.HTTP_403_FORBIDDEN,
                            )
                        except:
                            pass

                if email and first_name and last_name:
                    new_user = User.objects.create_user(
                        email, password=os.environ.get("GOOGLE_USER_PASSWORD")
                    )

                    new_user.auth_provider = "google"
                    new_user.is_email_verified = True
                    new_user.first_name = first_name
                    new_user.last_name = last_name
                    new_user.save()

                    user = authenticate(
                        username=email,
                        password=os.environ.get("GOOGLE_USER_PASSWORD"),
                    )
                    login(request, user)

                    serializer = UserSerializer(new_user)
                    return Response(serializer.data, status=status.HTTP_200_OK)

            except Exception as e:
                print(e)

        return Response(status=status.HTTP_400_BAD_REQUEST)
