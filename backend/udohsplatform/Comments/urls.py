from django.urls import path
from .views import CreateCommentView, AllCommentsView, DeleteCommentView


urlpatterns = [
    path("createComment", CreateCommentView.as_view()),
    path("allComments/<str:article_id>", AllCommentsView.as_view()),
    path(
        "deleteComment/<str:comment_id>/<str:article_id>", DeleteCommentView.as_view()
    ),
]
