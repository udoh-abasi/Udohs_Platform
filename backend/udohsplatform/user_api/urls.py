from django.urls import path
from .views import (
    UserLogin,
    UserLogout,
    UserView,
    UserRegister,
    SendLinkTo,
    GetGoogleUserData,
    ForgotPasswordView,
)

urlpatterns = [
    path("register", UserRegister.as_view()),
    path("login", UserLogin.as_view()),
    path("logout", UserLogout.as_view()),
    path("forgotpassword/<str:email>", ForgotPasswordView.as_view()),
    path("user", UserView.as_view()),
    path("getLink", SendLinkTo.as_view()),
    path("getgoogledata", GetGoogleUserData.as_view()),
]
