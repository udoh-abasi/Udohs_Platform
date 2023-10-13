from .serializer import (
    UserArticleSerializer,
    OtherArticlesFromSamePosterSerializer,
    TheUser,
)
from .models import User_Articles
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authentication import SessionAuthentication
from .validations import validate_theMainArticle
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys
import json
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from user_api.serializers import UserSerializer
from random import choice


User = get_user_model()


# This view creates a new article and returns the link for that article
@method_decorator(csrf_protect, name="dispatch")
class UserArticleView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    # Because of this, any data sent to this view has to come as a FormData object
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            data = request.data
            user = request.user

            # Since the mainArticle is sent from the frontend as a string, we need to convert it to python object before validating it
            mainArticle = json.loads(data.get("theMainArticle"))

            assert validate_theMainArticle(mainArticle)

            title = data.get("title", "").strip()
            heroImage = data.get("heroImage", "")
            theMainArticle = data.get("theMainArticle")

            try:
                titleExist = User_Articles.objects.get(user=user, title=title)
                print(titleExist)
                return Response(status=status.HTTP_409_CONFLICT)
            except:
                pass

            if title and heroImage and user.first_name and user.last_name and user.bio:
                if user.no_of_post >= 10 and (not user.premium_member):
                    return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

                theHeroImage = Image.open(heroImage)

                if theHeroImage.width != 400 or theHeroImage.height != 268:
                    print("Here", theHeroImage.width, theHeroImage.height)
                    return Response(status=status.HTTP_400_BAD_REQUEST)

                outputIOStream = BytesIO()

                # Here, we state the quality we want the image to have
                theHeroImage.save(outputIOStream, format="webp", quality=75)

                # Then we reset the output stream to the initial position
                outputIOStream.seek(0)

                compressedImage = InMemoryUploadedFile(
                    outputIOStream,
                    "ImageField",
                    "%s.webp" % heroImage.name.split(".")[0],
                    "image/webp",
                    sys.getsizeof(outputIOStream),
                    None,
                )

                obj = User_Articles.objects.create(
                    user=user,
                    title=title,
                    theMainArticle=theMainArticle,
                    heroImage=compressedImage,
                )

                obj.save()
                print("Saved Object", obj)

                # Increase the user's number of post
                user.no_of_post += 1
                user.save()

                return Response(
                    f"/read/{obj.title}/{obj.id}", status=status.HTTP_201_CREATED
                )

            return Response(status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_protect, name="dispatch")
class GetSingleArticleView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, title, articleID):
        try:
            theArticleID = int(articleID)
            theTitle = title.strip()

            if theTitle and theArticleID:
                # Get the single article that was requested
                theArticle = User_Articles.objects.get(id=articleID, title=title)
                singleArticleData = UserArticleSerializer(theArticle).data

                # Get the poster's id
                posterID = singleArticleData.get("user")

                # Get the details of the poster
                poster = get_object_or_404(User, id=posterID)
                userSerializer = UserSerializer(poster)
                posterData = userSerializer.data

                # Get the list of other articles posted by the user that posted the one requested for. (This returns an empty list if there is none)
                # Since I need 10 random articles, and using ".order_by("?")" is slow, I used this trick
                sortOptions = ["id", "-id", "title", "-title"]
                theChoice = choice(sortOptions)  # Get one random sort option

                otherArticles = (
                    User_Articles.objects.filter(user=theArticle.user)
                    .exclude(id=articleID, title=title)
                    .only(
                        "id",
                        "title",
                        "heroImage",
                        "datePosted",
                        "theMainArticle",
                        "user",
                    )
                    .order_by(theChoice)[:10]
                )

                otherArticleData = OtherArticlesFromSamePosterSerializer(
                    otherArticles, many=True
                ).data

                # This return the number we got. Maximum is 10, but it can be less if the user does not have up to 10 articles
                totalNumberOfArticlesByPoster = otherArticles.count()

                articleByOtherPoster = []

                if 10 - totalNumberOfArticlesByPoster:
                    # This will get us articles posted by all the users (except the one the that his/her article was requested).
                    articleFromOtherPoster = (
                        User_Articles.objects.exclude(user=theArticle.user)
                        .only(
                            "id",
                            "user",
                            "title",
                            "heroImage",
                            "datePosted",
                            "theMainArticle",
                        )
                        .order_by(theChoice)[: 10 - totalNumberOfArticlesByPoster]
                    )

                    # Continue here, figure out if the function 'articleFromOtherPoster' added in the model worked
                    for i in articleFromOtherPoster:
                        post = OtherArticlesFromSamePosterSerializer(i).data

                        theUser = User.objects.get(email=i.user.email)
                        poster = TheUser(theUser).data

                        articleByOtherPoster.append({"poster": poster, "post": post})

                return Response(
                    {
                        "requestedArticle": singleArticleData,
                        "otherArticles": otherArticleData,
                        "articlePoster": posterData,
                        "articleByOtherPoster": articleByOtherPoster,
                    }
                )

        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
