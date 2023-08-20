from django.urls import path
from .views import SendEmailView, ConfirmEmailView

urlpatterns = [
    path("reset_password_sendemailcode", SendEmailView.as_view()),
    path("reset_password_confirmemail", ConfirmEmailView.as_view()),
]
