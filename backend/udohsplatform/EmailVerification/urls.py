from django.urls import path
from .views import SendEmailView, ConfirmEmailView

urlpatterns = [
    path("sendemailcode", SendEmailView.as_view()),
    path("confirmemail", ConfirmEmailView.as_view()),
]
