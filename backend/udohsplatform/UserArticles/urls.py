from django.urls import path
from .views import (
    UserArticleView,
    GetSingleArticleView,
    ArticleDeleteView,
    UndoDeleteView,
    EditArticleView,
    GetAllArticleView,
)

urlpatterns = [
    path("userData", UserArticleView.as_view()),
    path("singleArticle/<str:title>/<str:articleID>", GetSingleArticleView.as_view()),
    path("deleteArticle/<str:articleID>", ArticleDeleteView.as_view()),
    path("undoDeleteArticle/<str:articleID>", UndoDeleteView.as_view()),
    path("editArticle", EditArticleView.as_view()),
    path(
        "getAllArticles/<str:sortBy>/<str:order>",
        GetAllArticleView.as_view(),
    ),
]
