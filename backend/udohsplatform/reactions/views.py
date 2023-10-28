from rest_framework.authentication import SessionAuthentication
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework.views import APIView
from rest_framework import permissions, status
from .models import Reactions
from UserArticles.models import User_Articles
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.generics import ListAPIView
from rest_framework.pagination import LimitOffsetPagination
from .serializers import ReactionsSerializer, UsersThatReactedSerializer
from django.contrib.auth import get_user_model
from django.http import Http404


User = get_user_model()


# This view add a like or love to an article
@method_decorator(csrf_protect, name="dispatch")
class AddReaction(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def put(self, request):
        try:
            user = request.user
            data = request.data

            youReacted = False

            # Get the reaction type (whether like or love)
            reaction_type = data.get("reaction_type", "")
            assert reaction_type in ["like", "love"]

            # Get the article the user wants to react to.
            article_id = data.get("article_id", "")
            theArticle = User_Articles.objects.get(id=article_id)

            try:
                # Check if this user has already reacted to this article
                already_saved_reaction = Reactions.objects.get(
                    user=user, article=theArticle
                )

                # If the user had already reacted, change their reaction type to the current one
                already_saved_reaction.reaction_type = reaction_type
                already_saved_reaction.save()

                youReacted = True

            except ObjectDoesNotExist:
                # If we get here, it means the user has not reacted to this article before
                Reactions.objects.create(
                    user=user, article=theArticle, reaction_type=reaction_type
                )
                youReacted = True

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

            # Get the total number of reactions in this article
            # total_num_reactions = Reactions.objects.filter(article=theArticle).count()
            total_num_reactions = theArticle.reactions_set.count()

            return Response(
                {
                    "total_num_reactions": total_num_reactions,
                    "areThereAnyLikes": areThereAnyLikes,
                    "areThereAnyLoves": areThereAnyLoves,
                    "youReacted": youReacted,
                },
                status=status.HTTP_200_OK,
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# This view removes a like or love from an article
@method_decorator(csrf_protect, name="dispatch")
class RemoveReaction(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def delete(self, request, article_id):
        try:
            user = request.user

            # Get the article id and check if it exists
            theArticle = User_Articles.objects.get(id=article_id)

            # Get the reaction by the user and delete it
            reaction = Reactions.objects.get(user=user, article=theArticle)
            reaction.delete()

            # Check if there are likes
            areThereAnyLikes = False
            if Reactions.objects.filter(
                article=theArticle, reaction_type="like"
            ).exists():
                areThereAnyLikes = True

            # Check if there are loves
            areThereAnyLoves = False
            if Reactions.objects.filter(
                article=theArticle, reaction_type="love"
            ).exists():
                areThereAnyLoves = True

            # If we got here, that means everything went well and the user deleted their reaction
            youReacted = False

            total_num_reactions = theArticle.reactions_set.count()

            return Response(
                {
                    "total_num_reactions": total_num_reactions,
                    "areThereAnyLikes": areThereAnyLikes,
                    "areThereAnyLoves": areThereAnyLoves,
                    "youReacted": youReacted,
                },
                status=status.HTTP_200_OK,
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class ReactionsPagination(LimitOffsetPagination):
    default_limit = 10  # NOTE: This is the default limit. So, only 10 items will be returned by default, per page

    # NOTE: This is the maximum size of a page, that can be set by the client
    max_limit = 10


# This view returns the users that reacted to an article.
# It takes a get request. And accepts the article_id and the reaction_type (optional) as part of the URL
# A request to this route will be in the format - http://localhost:8000/api/getUsersThatReacted/95?reaction_type=like
@method_decorator(csrf_protect, name="dispatch")
class GetUsersThatReacted(ListAPIView):
    permission_classes = (permissions.AllowAny,)
    pagination_class = ReactionsPagination
    serializer_class = ReactionsSerializer

    # First, we override the queryset to return either all the users that reacted, or only those that liked, or only those that loved the article.
    def get_queryset(self):
        try:
            # Get the article_id, and check if the article exists
            article_id = self.kwargs.get("article_id")
            article_id = int(article_id)
            theArticle = User_Articles.objects.get(id=article_id)

            # Check if a reaction type was sent
            reaction_type_requested = self.request.GET.get("reaction_type")

            # If a reaction type was sent, we want to return all users that made that reaction to the article
            if reaction_type_requested:
                assert reaction_type_requested in ["like", "love"]
                return Reactions.objects.filter(
                    article=theArticle, reaction_type=reaction_type_requested
                ).only("user", "reaction_type")

            # If a reaction type was not sent, then we return ALL the users that reacted, (whether they loved or liked the article)
            return theArticle.reactions_set.only("user", "reaction_type")
        except:
            raise Http404("Something went wrong")

    # Then we override the get request to return, to make sure we return the result in our desired way
    def get(self, request, *args, **kwargs):
        try:
            # First, get the default response that ListAPIView returns
            response = super().get(request, *args, **kwargs)

            # Then get the results and the link to the next page to get the next results
            data = response.data.get("results")
            nextLink = response.data.get("next")

            # This will store what we want to return to the user
            returnResult = []

            # Get the article id
            article_id = kwargs.get("article_id")
            # Get the article
            theArticle = User_Articles.objects.get(id=article_id)
            # Check the total number of people that liked the article
            total_num_of_reactions = theArticle.reactions_set.count()

            # Then loop through that data and get the users that reacted
            for i in data:
                # Then we get the details of each user (the person that reacted to the post), from our user model
                theUser = User.objects.get(id=i.get("user"))
                reactor = UsersThatReactedSerializer(theUser).data

                reaction_type = i.get("reaction_type")

                # Then, in our list, we append the user and the their type of reaction (whether like or love).
                returnResult.append(
                    {"reactor": reactor, "reaction_type": reaction_type}
                )

            return Response(
                dict(
                    results=returnResult,
                    total_num_of_reactions=total_num_of_reactions,
                    next=nextLink,
                ),
                status=status.HTTP_200_OK,
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
