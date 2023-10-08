from django.urls import path
from .views import UserArticleView

urlpatterns = [path("userData", UserArticleView.as_view())]
