from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework.authentication import SessionAuthentication
from rest_framework import permissions, status
from rest_framework.response import Response
import json
from UserArticles.validations import validate_theMainArticle
from UserArticles.models import User_Articles
from .models import Comments
from .serializers import CommentSerializer, CommenterSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.pagination import LimitOffsetPagination
from django.http import Http404

User = get_user_model()


@method_decorator(csrf_protect, name="dispatch")
class CreateCommentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        try:
            data = request.data
            user = request.user

            comment = data.get("comment")
            article_id = data.get("article_id")

            # Since the comment will be sent as a string of object, we need to convert it first
            JSONcomment = json.loads(comment)

            # Then we validate the comment to be sure it's a valid EditorJS data. Notice here we used the same validator we use in validating the main article
            assert validate_theMainArticle(JSONcomment)

            # Get the article the user wants to comment on
            theArticle = get_object_or_404(User_Articles, id=article_id)

            # Create the new comment
            createdComment = Comments.objects.create(
                user=user, article=theArticle, comment=comment
            )

            # Now, we want to send the created comment back to the frontend, so we get the data
            serializer = CommentSerializer(createdComment)

            # Here, we want to get the details of the user who created the comment
            commenter_id = serializer.data.get("user")
            commenter = get_object_or_404(User, id=commenter_id)
            commenterData = CommenterSerializer(commenter).data

            # Check if the person that commented has not set their first_name and last_name yet, so we use their email address
            if (
                commenterData.get("first_name") is None
                and commenterData.get("last_name") is None
            ):
                # First get the email
                email = commenterData.get("email")

                # Then check whether, in the email, a full-stop (.) comes before an '@' sign (e.g in udoh.abasi@gmail.com, we want only 'Udoh' to be the first name)
                fullStopIndex = email.find(".")
                atSignIndex = email.find("@")

                if fullStopIndex < atSignIndex:
                    emailEdit = email[:fullStopIndex]
                elif atSignIndex < fullStopIndex:
                    emailEdit = email[:atSignIndex]

                # We want the first name we just created to have the first letter capitalized
                newCommenterData = {
                    **commenterData,
                    "first_name": emailEdit.capitalize(),
                }

                # Take out the email address, because we don't want to send that to the frontend
                newCommenterData.pop("email", None)

                commenterData = newCommenterData

            commenterData.pop("email", None)

            # get the total number of users that commented
            total_num_comments = theArticle.comments_set.count()

            # Get the total number of users that liked the comment
            total_num_comments_likes = createdComment.comment_likes.count()

            return Response(
                dict(
                    commentData={
                        "comment": {
                            **serializer.data,
                            "total_num_comments_likes": total_num_comments_likes,
                        },
                        "commenter": commenterData,
                    },
                    total_num_comments=total_num_comments,
                ),
                status=status.HTTP_200_OK,
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class CommentPagination(LimitOffsetPagination):
    default_limit = 10  # NOTE: This is the default limit. So, only 10 items will be returned by default, per page

    # NOTE: This is the maximum size of a page, that can be set by the client
    max_limit = 10


# This view returns all the users that commented on an article
@method_decorator(csrf_protect, name="dispatch")
class AllCommentsView(ListAPIView):
    permission_classes = (permissions.AllowAny,)
    pagination_class = CommentPagination
    serializer_class = CommentSerializer

    def get_queryset(self):
        try:
            # Get the article_id, and check if the article exists
            article_id = self.kwargs.get("article_id")
            article_id = int(article_id)
            theArticle = User_Articles.objects.get(id=article_id)

            # Then return all the comments made on the article, and make sure it is ordered by the date (So, recent comments will appear on top)
            return theArticle.comments_set.all().order_by("-dateCommented")
        except:
            raise Http404("Something went wrong")

    def get(self, request, *args, **kwargs):
        try:
            responseData = super().get(request, *args, **kwargs).data

            allComments = responseData.get("results")
            nextLink = responseData.get("next")

            # Get the article id
            article_id = kwargs.get("article_id")
            article_id = int(article_id)
            # Get the article
            theArticle = get_object_or_404(User_Articles, id=article_id)

            # This will store what we want to return to the user
            returnResult = []

            # First, we check if this is the first request made, so we can append the comments of the logged in user at the top of the returnedList
            if request.GET.get("limit") is None and request.user.is_authenticated:
                # Get all the comments the logged in user made on the article
                loggedInUserComments = Comments.objects.filter(
                    article=theArticle, user=request.user
                ).order_by("-dateCommented")

                if loggedInUserComments.exists():
                    # Get the details of the logged in user from the serializer
                    commenterData = CommenterSerializer(request.user).data
                    # Check if the logged in user has not set their first_name and last_name yet, so we use their email address
                    if (
                        commenterData.get("first_name") is None
                        and commenterData.get("last_name") is None
                    ):
                        # First, get the email
                        email = commenterData.get("email")

                        # Then check whether, in the email, a full-stop (.) comes before an '@' sign (e.g in udoh.abasi@gmail.com, we want only 'Udoh' to be the first name)
                        fullStopIndex = email.find(".")
                        atSignIndex = email.find("@")

                        if fullStopIndex < atSignIndex:
                            emailEdit = email[:fullStopIndex]
                        elif atSignIndex < fullStopIndex:
                            emailEdit = email[:atSignIndex]

                        # We want the first name we just created to have the first letter capitalized
                        newCommenterData = {
                            **commenterData,
                            "first_name": emailEdit.capitalize(),
                        }

                        commenterData = newCommenterData

                    # Take out the email address, because we don't want to send that to the frontend
                    commenterData.pop("email", None)

                    # Here, we looped through the comments of the logged in user, then append it to the list we want to return
                    for comment in loggedInUserComments:
                        theCommentData = CommentSerializer(comment).data

                        # Get the number of likes on the comment
                        total_num_comments_likes = comment.comment_likes.count()

                        returnResult.append(
                            {
                                "comment": {
                                    **theCommentData,
                                    "total_num_comments_likes": total_num_comments_likes,
                                },
                                "commenter": commenterData,
                            },
                        )

            # Now, we loop through all the comments
            for comment in allComments:
                # First, we check if the comment was made by the logged in user, so we skip it, as we have already handled this above
                if comment.get("user") == request.user.id:
                    continue

                # Here, we would have used 'serializer = CommentSerializer(data=comment)', but if we do so, we will not be able to get the number of likes on the comment, so we have to get the comment object first
                comment = get_object_or_404(Comments, id=comment.get("id"))
                serializer = CommentSerializer(comment)

                # Here, we want to get the details of the user who created the comment
                commenter_id = serializer.data.get("user")
                commenter = get_object_or_404(User, id=commenter_id)
                commenterData = CommenterSerializer(commenter).data

                # Check if the person that commented has not set their first_name and last_name yet, so we use their email address
                if (
                    commenterData.get("first_name") is None
                    and commenterData.get("last_name") is None
                ):
                    # First get the email
                    email = commenterData.get("email")

                    # Then check whether, in the email, a full-stop (.) comes before an '@' sign (e.g in udoh.abasi@gmail.com, we want only 'Udoh' to be the first name)
                    fullStopIndex = email.find(".")
                    atSignIndex = email.find("@")

                    if fullStopIndex < atSignIndex:
                        emailEdit = email[:fullStopIndex]
                    elif atSignIndex < fullStopIndex:
                        emailEdit = email[:atSignIndex]

                    # We want the first name we just created to have the first letter capitalized
                    newCommenterData = {
                        **commenterData,
                        "first_name": emailEdit.capitalize(),
                    }

                    commenterData = newCommenterData

                # Take out the email address, because we don't want to send that to the frontend
                commenterData.pop("email", None)

                # Get the total number of users that liked the comment
                total_num_comments_likes = comment.comment_likes.count()

                returnResult.append(
                    {
                        "comment": {
                            **serializer.data,
                            "total_num_comments_likes": total_num_comments_likes,
                        },
                        "commenter": commenterData,
                    },
                )

            # Get the total number of users that commented
            total_num_comments = theArticle.comments_set.count()

            return Response(
                dict(
                    commentData=returnResult,
                    total_num_comments=total_num_comments,
                    nextCommentLink=nextLink,
                ),
                status=status.HTTP_200_OK,
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# This view deletes a comment from an article
@method_decorator(csrf_protect, name="dispatch")
class DeleteCommentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def delete(self, request, comment_id, article_id):
        try:
            user = request.user

            # Get the article id and check if it exists
            article_id = int(article_id)
            theArticle = User_Articles.objects.get(id=article_id)

            comment_id = int(comment_id)

            # Get the comment that the user wants to delete.
            commentToDelete = Comments.objects.get(
                id=comment_id, user=user, article=theArticle
            )

            # Delete the comment
            commentToDelete.delete()

            return Response({"deletedCommentID": comment_id}, status=status.HTTP_200_OK)

        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
