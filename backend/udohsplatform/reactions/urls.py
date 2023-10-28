from django.urls import path
from .views import AddReaction, RemoveReaction, GetUsersThatReacted

urlpatterns = [
    path("addReaction", AddReaction.as_view()),
    path("removeReaction/<str:article_id>", RemoveReaction.as_view()),
    path(
        "getUsersThatReacted/<str:article_id>",
        GetUsersThatReacted.as_view(),
    ),
]
