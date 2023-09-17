from django.urls import path
from .views import (
    UserLogin,
    UserLogout,
    UserView,
    UserRegister,
    SendLinkTo,
    GetGoogleUserData,
    ForgotPasswordView,
    AccountView,
    EditProfileView,
    VerifyPaymentWithPaystack,
)

urlpatterns = [
    path("register", UserRegister.as_view()),
    path("login", UserLogin.as_view()),
    path("logout", UserLogout.as_view()),
    path("forgotpassword/<str:email>", ForgotPasswordView.as_view()),
    path("user", UserView.as_view()),
    path("getLink", SendLinkTo.as_view()),
    path("getgoogledata", GetGoogleUserData.as_view()),
    path("account/<str:id>", AccountView.as_view()),
    path("editProfile", EditProfileView.as_view()),
    path("verifyPayment", VerifyPaymentWithPaystack.as_view()),
]
