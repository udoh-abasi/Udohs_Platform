from django.urls import path
from .views import UserArticleView, GetSingleArticleView

urlpatterns = [
    path("userData", UserArticleView.as_view()),
    path("singleArticle/<str:title>/<str:articleID>", GetSingleArticleView.as_view()),
]
