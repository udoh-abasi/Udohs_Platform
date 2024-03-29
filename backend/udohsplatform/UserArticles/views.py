from .serializer import (
    UserArticleSerializer,
    OtherArticlesFromSamePosterSerializer,
    ArticlePosterSerializer,
    AllArticleSerializer,
    TopPostSerializer,
    SearchArticleSerializer,
)
from .models import User_Articles, DeletedData
from rest_framework.views import APIView
from rest_framework.generics import DestroyAPIView, ListAPIView
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
from django.core import serializers
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.filters import SearchFilter
from django.http import Http404
from reactions.models import Reactions
from django.core.exceptions import ObjectDoesNotExist
from .tasks import send_mail_func


User = get_user_model()

frontendLink = ""


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

                # NOTE: This sends an email to us. We used celery so this won't delay the client. The 'send_mail_func' expect a 'link', so we sent it in the 'delay' method
                send_mail_func.delay(f"{frontendLink}/read/{obj.title}/{obj.id}")

                return Response(
                    f"/read/{obj.title}/{obj.id}", status=status.HTTP_201_CREATED
                )

            return Response(status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# NOTE: This view sends it response to the 'Read' page. Which will display the article that the user wants to read, other articles by the same user and by other users
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

                # This return the number of other articles posted by the user that posted the one requested for.
                # Maximum is 10, but it can be less if the user does not have up to 10 articles
                totalNumberOfArticlesByPoster = otherArticles.count()

                articleByOtherPoster = []

                if 10 - totalNumberOfArticlesByPoster:
                    # This will get us articles posted by all the users (except the one that his/her article was requested).
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

                    # Now, we want to get the post and the poster. So we loop through all the posts made by all other user (except the one that his/her article was requested)
                    for i in articleFromOtherPoster:
                        # Here, we get the post
                        post = OtherArticlesFromSamePosterSerializer(i).data

                        # Then we get the poster (the person that made the post), from our user model
                        theUser = User.objects.get(email=i.user.email)
                        poster = ArticlePosterSerializer(theUser).data

                        # Then, in our list, we append the post and the poster.
                        articleByOtherPoster.append({"poster": poster, "post": post})

                # Here, we increment the number of views of the article
                theArticle.no_of_views += 1
                theArticle.save()

                # Here, we want to return the number of reactions (i.e, likes and loves)  that this article has, and check if the requested user is logged in, and if they have reacted to this article before
                # Check if there are likes on this article
                areThereAnyLikes = False
                if Reactions.objects.filter(
                    article=theArticle, reaction_type="like"
                ).exists():
                    areThereAnyLikes = True

                # Check if there are loves on this article
                areThereAnyLoves = False
                if Reactions.objects.filter(
                    article=theArticle, reaction_type="love"
                ).exists():
                    areThereAnyLoves = True

                total_num_reactions = theArticle.reactions_set.count()

                youLiked = False
                youLoved = False

                # Check if the user that sent this request is authenticated (i.e is logged in)
                if request.user.is_authenticated:
                    try:
                        # If the user is logged in, check if they have reacted to the article before
                        reaction = Reactions.objects.get(
                            article=theArticle, user=request.user
                        )
                        # Get their reaction type
                        if reaction.reaction_type == "love":
                            youLoved = True
                            total_num_reactions -= 1
                        elif reaction.reaction_type == "like":
                            youLiked = True
                            total_num_reactions -= 1

                    except ObjectDoesNotExist:
                        pass

                # Now, we want to get the total number of comments on this article, and send to the frontend
                # NOTE: 'comments' here is the name of the model, which has it foreign key set to 'User_Articles'. The model's name is 'Comments', but we use the lowercase letter throughout
                total_num_comments = theArticle.comments_set.count()

                return Response(
                    {
                        "requestedArticle": singleArticleData,
                        "otherArticles": otherArticleData,
                        "articlePoster": posterData,
                        "articleByOtherPoster": articleByOtherPoster,
                        "total_num_comments": total_num_comments,
                        "reactionData": {
                            "total_num_reactions": total_num_reactions,
                            "areThereAnyLikes": areThereAnyLikes,
                            "areThereAnyLoves": areThereAnyLoves,
                            "youLiked": youLiked,
                            "youLoved": youLoved,
                        },
                    }
                )

        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# This view deletes an article.
@method_decorator(csrf_protect, name="dispatch")
class ArticleDeleteView(DestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def delete(self, request, articleID):
        try:
            articleID = int(articleID)
            # First, we get the article the user wants to edit
            article = User_Articles.objects.get(user=request.user, id=articleID)

            # Here, we serialized the entire article object (converted it to a text format, so it can be easily store)
            dataToDelete = serializers.serialize("json", [article])

            # Then we checked if the user already has objects in the 'DeletedData' model, so we delete them all
            # This is because we want a user to only be able to undo the deletion of one item at a time
            dataExist = DeletedData.objects.filter(user=request.user)
            if dataExist.exists():
                for i in dataExist:
                    i.delete()

            # NOTE: Here, notice we passed in the data that we want to delete in a field called 'data'
            DeletedData.objects.create(
                user=request.user, model_id=article.id, data=dataToDelete
            )

            # Then we delete the article, just like the usr wanted.
            article.delete()

            # Then reduce the number of articles posted by that user by 1
            request.user.no_of_post -= 1
            request.user.save()

            # Then send back an updated articles (which will exclude the deleted data to the frontend)
            articles = User_Articles.objects.filter(user=request.user).only(
                "id",
                "title",
                "heroImage",
                "datePosted",
                "theMainArticle",
            )

            articleData = OtherArticlesFromSamePosterSerializer(
                articles, many=True
            ).data

            return Response(articleData, status=status.HTTP_200_OK)

        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# This view takes requests to undo a delete.
@method_decorator(csrf_protect, name="dispatch")
class UndoDeleteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request, articleID):
        articleID = int(articleID)

        # First, we check and get the article the user wants to undo its delete.
        # Notice we used 'request.user' to ensure that someone does not recover someone else article
        retrievedArticle = DeletedData.objects.get(
            user=request.user, model_id=articleID
        )

        # Remember that the entire object of the article was serialized (converted to a string) and stored in a DeletedData's model field called 'data'
        # So, we recovered that 'data' field here, and deserialized it (i.e, converted it back to it original form, which is a python dictionary)
        for article in serializers.deserialize("json", retrievedArticle.data):
            article.save()

        # Then we delete that retrieved data from the 'DeletedData' model
        retrievedArticle.delete()

        # Then increment the number of post made by that user
        request.user.no_of_post += 1
        request.user.save()

        # Then send back an updated articles (which will include the deleted data that we just retrieved, to the frontend)
        articles = User_Articles.objects.filter(user=request.user).only(
            "id",
            "title",
            "heroImage",
            "datePosted",
            "theMainArticle",
        )

        articleData = OtherArticlesFromSamePosterSerializer(articles, many=True).data
        return Response(articleData, status=status.HTTP_200_OK)


# NOTE: This view Edits the user's article
@method_decorator(csrf_protect, name="dispatch")
class EditArticleView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    # Because of this, any data sent to this view has to come as a FormData object
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            data = request.data
            user = request.user

            articleID = data.get("theArticleID")

            articleToEdit = User_Articles.objects.get(user=user, id=articleID)

            # Since the mainArticle is sent from the frontend as a string, we need to convert it to python object before validating it
            mainArticle = json.loads(data.get("theMainArticle"))

            assert validate_theMainArticle(mainArticle)

            title = data.get("title", "").strip()
            heroImage = data.get("heroImage", "")
            theMainArticle = data.get("theMainArticle")

            # check that title does not exist
            titleExist = User_Articles.objects.filter(user=user, title=title).exclude(
                id=articleID
            )

            # Here, we check to be sure that the user does not change to another title already exist
            if titleExist.exists():
                return Response(status=status.HTTP_409_CONFLICT)

            if title:
                if heroImage:
                    articleToEdit.heroImage.delete()
                    theHeroImage = Image.open(heroImage)

                    if theHeroImage.width != 400 or theHeroImage.height != 268:
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

                    articleToEdit.heroImage = compressedImage

                articleToEdit.title = title
                articleToEdit.theMainArticle = theMainArticle
                articleToEdit.edited = True

                articleToEdit.save()

                articles = User_Articles.objects.filter(user=user).only(
                    "id",
                    "title",
                    "heroImage",
                    "datePosted",
                    "theMainArticle",
                )

                articleData = OtherArticlesFromSamePosterSerializer(
                    articles, many=True
                ).data

                return Response(articleData, status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class ArticlePagination(LimitOffsetPagination):
    default_limit = 5  # NOTE: This is the default limit. So, only 10 items will be returned by default, per page

    # NOTE: This is the maximum size of a page, that can be set by the client
    max_limit = 10


# This view gets all the articles, and returns it result to the AllArticles Page.
@method_decorator(csrf_protect, name="dispatch")
class GetAllArticleView(ListAPIView):
    permission_classes = (permissions.AllowAny,)
    pagination_class = ArticlePagination
    serializer_class = AllArticleSerializer

    # filter_backends = [
    #     DjangoFilterBackend,
    #     OrderingFilter,
    # ]
    # ordering_fields = ["user__first_name", "title", "no_of_views", "datePosted"]

    # NOTE: Since our queryset returns a list, we cannot use something like - '?ordering=title' when sending a request to this route, as we will get an error that 'order_by' is not a function
    # So, we used kwargs to send the order and sort type

    # NOTE: This returns a list of 'post' and the 'poster'
    def get_queryset(self):
        try:
            sortBys = ["title", "user__first_name", "datePosted", "no_of_views"]
            orders = ["asc", "des"]

            sortBy = self.kwargs.get("sortBy")
            order = self.kwargs.get("order")

            if sortBy in sortBys and order in orders:
                articleByOtherPoster = []

                # This will get us articles posted by all the users (except the one that his/her article was requested).
                articleFromOtherPoster = User_Articles.objects.only(
                    "id",
                    "user",
                    "title",
                    "heroImage",
                    "datePosted",
                    "theMainArticle",
                )

                if order == "asc":
                    articleFromOtherPoster = articleFromOtherPoster.order_by(
                        f"{sortBy}"
                    )
                elif order == "des":
                    articleFromOtherPoster = articleFromOtherPoster.order_by(
                        f"-{sortBy}"
                    )

                # Now, we want to get the post and the poster. So we loop through all the posts made by all other user (except the one that his/her article was requested)
                for i in articleFromOtherPoster:
                    # Here, we get the post
                    post = OtherArticlesFromSamePosterSerializer(i).data

                    # Then we get the poster (the person that made the post), from our user model
                    theUser = User.objects.get(email=i.user.email)
                    poster = ArticlePosterSerializer(theUser).data

                    # Then, in our list, we append the post and the poster.
                    articleByOtherPoster.append({"poster": poster, "post": post})

                return articleByOtherPoster

            raise Http404("Something went wrong")
        except:
            raise Http404("Something went wrong")


# This view gets the top 6 most viewed articles and sends it result to the HomePage
@method_decorator(csrf_protect, name="dispatch")
class TopArticlesForHomePage(ListAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = AllArticleSerializer

    def get_queryset(self):
        try:
            postAndPoster = []

            # This will get us the top six articles.
            topPost = User_Articles.objects.only(
                "id",
                "user",
                "title",
                "datePosted",
            ).order_by("-no_of_views")[:6]

            # Now, we want to get the post and the poster. So we loop through the top six post and get their poster
            for i in topPost:
                # Here, we get the post
                post = TopPostSerializer(i).data

                # Then we get the poster (the person that made the post), from our user model
                theUser = User.objects.get(email=i.user.email)
                poster = ArticlePosterSerializer(theUser).data

                # Then, in our list, we append the post and the poster.
                postAndPoster.append({"poster": poster, "post": post})

            return postAndPoster

        except:
            raise Http404("Something went wrong")


# This view sends it result to the search page
@method_decorator(csrf_protect, name="dispatch")
class SearchArticlesView(ListAPIView):
    permission_classes = (permissions.AllowAny,)
    pagination_class = ArticlePagination

    queryset = User_Articles.objects.only(
        "id", "title", "heroImage", "datePosted", "theMainArticle", "user"
    ).order_by("title")

    serializer_class = SearchArticleSerializer

    filter_backends = (SearchFilter,)
    search_fields = [
        "title",
        "user__first_name",
        "user__last_name",
        "user__bio",
        "theMainArticle",
    ]

    # First, we override the get method to return the article and the person that posted it
    def get(self, request, *args, **kwargs):
        # Our search will return a data, so we get that data here
        response = super().get(request, *args, **kwargs)

        # NOTE: Here, we used '.get("results")' because the data returned when we use pagination is always in the 'results' property
        searchResultData = response.data.get("results")
        nextLink = response.data.get("next")

        postAndPoster = []

        # Then loop through that data and get the poster
        for i in searchResultData:
            # Then we get the poster (the person that made the post), from our user model
            theUser = User.objects.get(id=i.get("user"))
            poster = ArticlePosterSerializer(theUser).data

            # Then, in our list, we append the post and the poster.
            postAndPoster.append({"poster": poster, "post": i})

        return Response(
            {"results": postAndPoster, "next": nextLink}, status=status.HTTP_200_OK
        )
