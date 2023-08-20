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
from .validation import (
    custom_validation,
    validate_email,
    validate_password,
    validate_password_before_signup,
)
from rest_framework import permissions, status

import requests
from urllib.parse import urlencode, unquote
import os
from .permissions import UserAlreadyExistPermission
from django.apps import apps
from django.core.exceptions import ValidationError


User = get_user_model()


class UserRegister(APIView):
    permission_classes = (
        UserAlreadyExistPermission,
        permissions.AllowAny,
    )

    def post(self, request):
        clean_data = custom_validation(request.data)

        EmailVerification = apps.get_model("EmailVerification", "EmailVerification")

        try:
            email_verification_obj = EmailVerification.objects.get(
                email=clean_data.get("email"), is_email_verified=True
            )
        except:
            return Response(
                {"message": "You need to verify your email"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = UserRegisterSerializer(data=clean_data)

        if serializer.is_valid(raise_exception=True):
            user = serializer.create(clean_data)
            if user:
                email_verification_obj.delete()
                return Response(
                    serializer.data["email"], status=status.HTTP_201_CREATED
                )
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

        try:
            serializer = UserLoginSerializer(data=data)
            if serializer.is_valid(raise_exception=True):
                user = serializer.check_user(data)
                login(request, user)
                return Response(serializer.data["email"], status=status.HTTP_200_OK)
        except ValidationError:
            return Response(
                {
                    "message": "User not found",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except:
            return Response(
                {
                    "message": "Something went wrong",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


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
    # If this is NOT added , only authenticated users will be allowed to access this view
    permission_classes = (permissions.AllowAny,)

    # Tells Django we are using sessionID and NOT JWT
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        # Get the 'code' from the URL. The 'code' is sent as 'http://127.0.0.1:8000/api/getgoogledata?code=4%2Fsh3cndc'
        google_code = request.GET.get("code")

        if google_code:
            authorization_code = unquote(google_code)

            client_id = os.environ.get("GOOGLE_CLIENT_ID")
            client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")

            token_url = "https://oauth2.googleapis.com/token"  # URL for google API, used to get access_token
            token_data = {
                "code": authorization_code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": "http://localhost:8000/api/getgoogledata",
                "grant_type": "authorization_code",
            }

            response = requests.post(token_url, data=token_data)

            # Now, we get the data returned by google API. It will either be the JSON containing the access_token or error message
            token_data = response.json()

            try:
                # This will raise an error if no token was sent. So, we use a try-except block
                access_token = token_data["access_token"]
                # refresh_token = token_data.get("refresh_token")

                headers = {"Authorization": f"Bearer {access_token}"}

                # Send another request to Google's People API to get the user's data, if the token is valid
                response = requests.get(
                    "https://people.googleapis.com/v1/people/me?personFields=emailAddresses,names",
                    headers=headers,
                )
                profile_data = response.json()

                email = profile_data.get("emailAddresses", [{}])[0].get("value", None)
                first_name = profile_data.get("names", [{}])[0].get("givenName", None)
                last_name = profile_data.get("names", [{}])[0].get("familyName", None)

                if email:
                    try:
                        # First, we check if the user had sign in with google before, then we log them in
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
                            # Then we check if the user had already signed up (using username and password). If not, we will get an Integrity Constraint error
                            User.objects.get(email=email)
                            return Response(
                                {
                                    "message": "User already authenticated, Please log in."
                                },
                                status=status.HTTP_403_FORBIDDEN,
                            )
                        except:
                            pass

                # If everything went well, and we got to this level, that means the user does NOT exits in our database, so we create an account for them
                if email and first_name and last_name:
                    new_user = User.objects.create_user(
                        email, password=os.environ.get("GOOGLE_USER_PASSWORD")
                    )

                    new_user.auth_provider = "google"
                    new_user.is_email_verified = True
                    new_user.first_name = first_name
                    new_user.last_name = last_name
                    new_user.save()

                    # After signing up the user, we log in the user at once and return their email
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


class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def put(self, request, email):
        ForgotPasswordVerificationModel = apps.get_model(
            "forgotPasswordEmailVerification", "PasswordEmailVerification"
        )

        try:
            forgot_Password_Verified_Obj = ForgotPasswordVerificationModel.objects.get(
                email=email, is_email_verified=True
            )
        except:
            return Response(
                {"message": "Please verify your email if you already have an account"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            password = validate_password_before_signup(request.data.get("password"))
            if not password:
                return Response(
                    {
                        "message": f"{request.data.get('password')} does not meet password requirements"
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            user = User.objects.get(email=email, auth_provider="AppUser")
            user.set_password(request.data.get("password"))
            user.save()

            forgot_Password_Verified_Obj.delete()
            return Response()
        except:
            return Response(
                {
                    "message": "User not found. It's possible you signed in with google. Please continue your sign in with google or create an account"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
