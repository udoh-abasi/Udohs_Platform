from django.urls import path
from .views import (
    UserLogin,
    UserLogout,
    UserView,
    UserRegister,
    SendLinkTo,
    GetGoogleUserData,
)

urlpatterns = [
    path("register", UserRegister.as_view()),
    path("login", UserLogin.as_view()),
    path("logout", UserLogout.as_view()),
    path("user", UserView.as_view()),
    path("getLink", SendLinkTo.as_view()),
    path("getgoogledata", GetGoogleUserData.as_view()),
]


a = {
    "access_token": "ya29.a0AfB_byC0CDYluY6s7FrHyFsYcr9MQuPWsnjq5fECvyzXew9qBtc4KKJGOzuFeZtBD8-EApyblobw3H6KY1bxLkTOUGSNZOV9ckR5XTAVidxmFhF8hOc2aSw_-QF0dEqWQ6W4tvVbrAgN0ciTVDbHJ8epf8e3aCgYKAQsSARISFQHsvYlsQFDV3CD85VFc3Oseh0_VUw0163",
    "expires_in": 3599,
    "scope": "openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    "token_type": "Bearer",
    "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdjOWM3OGUzYjAwZTFiYjA5MmQyNDZjODg3YjExMjIwYzg3YjdkMjAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1NjA3NDg2MjE0NzUtdjB0c29oZ2JydXU5bTNxbGpjaWhlbG5oYzQ3ZXE3ZTMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1NjA3NDg2MjE0NzUtdjB0c29oZ2JydXU5bTNxbGpjaWhlbG5oYzQ3ZXE3ZTMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQxNjQ1NDQzNTI4ODc3Mjg3NDYiLCJoZCI6InRlbmVjZS5jb20iLCJlbWFpbCI6InVkb2guYWJhc2lAdGVuZWNlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiSXJudlYxUlc4a05OZDVtOGZkVjBJZyIsIm5hbWUiOiJVZG9oIEFiYXNpIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGU4U0RYdTQ5cktwckVScVBuMTdVMjY2R2JNYjRpTV9JQ3BXTF82dFctaT1zOTYtYyIsImdpdmVuX25hbWUiOiJVZG9oIiwiZmFtaWx5X25hbWUiOiJBYmFzaSIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjkyMjQyOTc4LCJleHAiOjE2OTIyNDY1Nzh9.mWc9ddVQrFJ8uiSDuCUaF2-_1cvOykCggAyReKg4Zdx7oOYIgY0zxB-vPpB-TcHfbZ1gqq3EgWX3EDTzH9rEWQnBvlwG6SMgv4bkjp_Qd82AHB52dseEt6a7WIEIa7FFtmTGyqOpfNq5KlOMsYrkiXXZglSUatqpXH4wP-UFRVmn7Wj6YaXtqyRVuaNKHo6lUYF1Mm0bgC3ISnrkXTNU0cpO4JWhQyInuITLcSUzPILAG2j8wSoh1unPH6eboOP26lmgv7JsZR7VpH-W15OlgPq7QLA8saoFlFDEMKfHYh7qJKeB3bjKpRWQKGS66gd7TxqFlSNIyJGjLjB4d9mQhg",
}

b = {
    "resourceName": "people/104164544352887728746",
    "etag": "%EgcBAgkuNz0+GgQBAgUHIgxKNkpkNjlmLys5dz0=",
    "names": [
        {
            "metadata": {
                "primary": True,
                "source": {"type": "PROFILE", "id": "104164544352887728746"},
                "sourcePrimary": True,
            },
            "displayName": "Udoh Abasi",
            "familyName": "Abasi",
            "givenName": "Udoh",
            "displayNameLastFirst": "Abasi, Udoh",
            "unstructuredName": "Udoh Abasi",
        },
        {
            "metadata": {
                "source": {"type": "DOMAIN_PROFILE", "id": "104164544352887728746"}
            },
            "displayName": "Udoh Abasi",
            "familyName": "Abasi",
            "givenName": "Udoh",
            "displayNameLastFirst": "Udoh Abasi",
            "unstructuredName": "Udoh Abasi",
        },
    ],
    "emailAddresses": [
        {
            "metadata": {
                "primary": True,
                "verified": True,
                "source": {"type": "DOMAIN_PROFILE", "id": "104164544352887728746"},
                "sourcePrimary": True,
            },
            "value": "udoh.abasi@tenece.com",
        }
    ],
}

c = {
    "resourceName": "people/118082393509564531923",
    "etag": "%EgcBAgkuNz0+GgQBAgUHIgxOakY1KzVDenI3cz0=",
    "names": [
        {
            "metadata": {
                "primary": True,
                "source": {"type": "PROFILE", "id": "118082393509564531923"},
                "sourcePrimary": True,
            },
            "displayName": "Abasiono Udoh",
            "familyName": "Udoh",
            "givenName": "Abasiono",
            "displayNameLastFirst": "Udoh, Abasiono",
            "unstructuredName": "Abasiono Udoh",
        }
    ],
    "emailAddresses": [
        {
            "metadata": {
                "primary": True,
                "verified": True,
                "source": {"type": "ACCOUNT", "id": "118082393509564531923"},
                "sourcePrimary": True,
            },
            "value": "tropyganty0@gmail.com",
        }
    ],
}
