from django.contrib.auth import login, logout, get_user_model, authenticate
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser


from .serializers import (
    UserSerializer,
    UserLoginSerializer,
    UserRegisterSerializer,
    SendLink,
    ProfileEditSerializer,
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
        try:
            clean_data = custom_validation(request.data)
        except:
            return Response(
                {
                    "message": "Email already exist or password does not meet requirement"
                },
                status=status.HTTP_403_FORBIDDEN,
            )

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

        try:
            assert validate_email(data)
            assert validate_password(data)
        except:
            return Response(
                {
                    "message": "Invalid email or password",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=data["email"], auth_provider="google")
            return Response(
                {
                    "message": "You signed up with google, please click 'Sign in to google' to continue",
                },
                status=status.HTTP_401_UNAUTHORIZED,
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
                status=status.HTTP_404_NOT_FOUND,
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
        return Response(serializer.data, status=status.HTTP_200_OK)


# This view takes the user's id and returns the details of their account
class AccountView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, id):
        try:
            if int(id):
                user = get_object_or_404(User, id=id)
                serializer = UserSerializer(user)
                return Response(serializer.data, status=status.HTTP_200_OK)

        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# This edits the user's profile (first name, last name, bio and profile pics)
class EditProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    # Because of this, any data sent to this view has to come as a FormData object
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            user = get_object_or_404(User, id=request.user.id)
            data = request.data

            firstName = data.get("first_name", "").strip()
            lastName = data.get("last_name", "").strip()
            bio = data.get("bio", "").strip()

            # Send the data to the serializer to validate, (incase malicious file was sent as photo)
            serializer = ProfileEditSerializer(data=data)

            if (
                firstName
                and lastName
                and bio
                and serializer.is_valid(raise_exception=True)
            ):
                user.bio = bio
                user.first_name = firstName
                user.last_name = lastName

                profilePic = data.get("profile_pic", None)
                if profilePic:
                    user.profile_pic.delete()  # Delete the old profile picture from the database and replace with the new profile picture
                    user.profile_pic = profilePic

                user.save()

                serializer = UserSerializer(user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)


# This view sends the Google Link
class SendLinkTo(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        clientID = os.environ.get("GOOGLE_CLIENT_ID")
        redirectURL = "http://localhost:5173"

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


"""
# NOTE: For everything to work in development:
# 1. Make sure the frontend is on localhost E.g: "http://localhost:5173"
# 2. Make sure the backend is on localhost as well by running: - python manage.py runserver localhost:8000

# 3. Make sure that on Google consent, the "Authorized Redirect URI" is also on localhost, E.g "http://localhost:5173"

# 4. Lastly, make sure that the request are being sent through the localhost from the frontend to the backend. E.g:
'''
import axios from "axios";

// NOTE: Here, we create an axios instance with the django's base URL, so we only have to type in the django's base URL just once
const axiosClient = axios.create({
  baseURL: "http://localhost:8000",     # NOTE: We used 'localhost' here, instead of "127.0.0.1".
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withCredentials: true,
});

export default axiosClient;
'''
"""


class GetGoogleUserData(APIView):
    # If this is NOT added , only authenticated users will be allowed to access this view
    permission_classes = (permissions.AllowAny,)

    # Tells Django we are using sessionID and NOT JWT
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
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
                "redirect_uri": "http://localhost:5173",
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
                        googleUser = User.objects.get(
                            email=email, auth_provider="google"
                        )

                        user = authenticate(
                            username=email,
                            password=os.environ.get("GOOGLE_USER_PASSWORD"),
                        )

                        login(request, user)

                        serializer = UserSerializer(googleUser)

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
                print("The error is", e)

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
