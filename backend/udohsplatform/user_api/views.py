from django.contrib.auth import login, logout, get_user_model, authenticate
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys
from django.core.files.storage import FileSystemStorage
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
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
from UserArticles.models import User_Articles
from UserArticles.serializer import OtherArticlesFromSamePosterSerializer


User = get_user_model()


# @method_decorator(csrf_protect, name="dispatch")
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


# @method_decorator(csrf_protect, name="dispatch")
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


# @method_decorator(csrf_protect, name="dispatch")
class UserLogout(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_protect, name="dispatch")
class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# This view sends the logged in user's data (request will be sent to it from the 'User Profile') page in the frontend
@method_decorator(csrf_protect, name="dispatch")
class UserArticlesView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        try:
            # Then we make a query to get all the articles posted by that user
            articles = User_Articles.objects.filter(user=request.user).only(
                "id",
                "title",
                "heroImage",
                "datePosted",
                "theMainArticle",
                "user",
            )

            articleData = OtherArticlesFromSamePosterSerializer(
                articles, many=True
            ).data
            return Response(articleData, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# This view takes the user's id and returns the details of their account
# @method_decorator(csrf_protect, name="dispatch")
class AccountView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, id):
        try:
            if id:
                # First, we get a user with that id
                user = get_object_or_404(User, id=id)

                # Then we get their data
                profileData = UserSerializer(user).data

                # Then we make a query to get all the articles posted by that user
                articles = User_Articles.objects.filter(user=user).only(
                    "id",
                    "title",
                    "heroImage",
                    "datePosted",
                    "theMainArticle",
                    "user",
                )

                articleData = OtherArticlesFromSamePosterSerializer(
                    articles, many=True
                ).data

                # Then we return the profile and the article
                return Response(
                    {"profile": profileData, "articles": articleData},
                    status=status.HTTP_200_OK,
                )

        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# This edits the user's profile (first name, last name, bio and profile pics)
@method_decorator(csrf_protect, name="dispatch")
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
                    # First check if the user has already uploaded a profile pic before
                    if user.profile_pic:
                        user.profile_pic.delete()  # Then Delete the old profile picture from the database and replace with the new profile picture

                    theImage = Image.open(profilePic)

                    # If the height and width isn't the same (300x300), then something went wrong, and the data did not come from our frontend
                    if theImage.width != 300 or theImage.height != 300:
                        return Response(status=status.HTTP_400_BAD_REQUEST)

                    # This is a container that will handle writing the changes that we want to make in our image
                    outputIOStream = BytesIO()

                    # Here, we state the quality we want the image to have
                    theImage.save(outputIOStream, format="webp", quality=75)

                    # Then we reset the output stream to the initial position
                    outputIOStream.seek(0)

                    compressedImage = InMemoryUploadedFile(
                        outputIOStream,
                        "ImageField",
                        "%s.webp" % profilePic.name.split(".")[0],
                        "image/webp",
                        sys.getsizeof(outputIOStream),
                        None,
                    )

                    user.profile_pic = compressedImage

                user.save()

                serializer = UserSerializer(user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)


# This view sends the Google Link
# @method_decorator(csrf_protect, name="dispatch")
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


# @method_decorator(csrf_protect, name="dispatch")
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


# @method_decorator(csrf_protect, name="dispatch")
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


@method_decorator(csrf_protect, name="dispatch")
class VerifyPaymentWithPaystack(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        paymentRef = request.data.get("paymentRef", "")

        user = request.user
        user.paystack_ref = paymentRef
        user.save()

        if paymentRef:
            try:
                url = f"https://api.paystack.co/transaction/verify/{paymentRef}"
                headers = {
                    "Authorization": f"Bearer {os.environ.get('PAYSTACK_SECRET_KEY')}"
                }

                response = requests.get(url, headers=headers)
                data = response.json()
                data = data.get("data")

                # According to paystack docs, we are to confirm the amount is what we expect from the user, and the status is 'success'
                if (
                    response.status_code == 200
                    and data.get("status") == "success"
                    and (data.get("amount") == 10000 or data.get("amount") == 20000)
                ):
                    user.premium_member = True
                    user.save()

                    serializer = UserSerializer(user)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                raise Exception("Bad request")

            except Exception as e:
                print(e)
                return Response(status=status.HTTP_400_BAD_REQUEST)


# This view takes the image sent by EditorJS (from the write page), and saves it to our backend, then return the URL of the saved image to the frontend, in the format requested by EditorJS
class UploadImageFromEditorJSWritePage(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        hostURL = "http://localhost:8000"  # Change this in production
        image = request.FILES.get("image", "")

        print("content_type", image.content_type)

        try:
            if image.content_type.startswith("image"):
                # This will ensure the images are saved in the media folder
                fs = FileSystemStorage()
                imageName = str(image).split(".")[0]

                im = Image.open(image)

                original_width, original_height = im.size

                desired_width = 720

                # Check if the image's original width is bigger than our desired maximum width, the resize it to the desired width
                if original_width > desired_width:
                    width_percentage = desired_width / float(original_width)
                    obtained_height = int(
                        float(original_height) * float(width_percentage)
                    )

                    im = im.resize((desired_width, obtained_height))

                # Store the image result (from Pillow) here if not, FileSystem will not be able to read it
                outputIOStream = BytesIO()

                # Here, we state the quality we want the image to have
                im.save(outputIOStream, format="webp", quality=75)

                # Then we reset the output stream to the initial position
                outputIOStream.seek(0)

                savedImage = fs.save(imageName, outputIOStream)
                imageURL = fs.url(savedImage)

                # This is the JSON format that EditorJS expects
                return Response(
                    {
                        "success": 1,
                        "file": {
                            "url": f"{hostURL}{imageURL}",
                        },
                    }
                )
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
