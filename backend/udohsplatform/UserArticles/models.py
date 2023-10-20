from django.db import models
from django.contrib.auth import get_user_model
from Likes.models import Likes
from Comments.models import Comments


User = get_user_model()


# This model is the user's article itself
class User_Articles(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False)
    title = models.CharField(max_length=999, null=False, blank=False)

    heroImage = models.ImageField(upload_to="heroImages", null=False, blank=False)
    datePosted = models.DateTimeField(auto_now_add=True)
    edited = models.BooleanField(default=False, max_length=1)

    likes = models.ForeignKey(Likes, on_delete=models.CASCADE, null=True, blank=True)
    comments = models.ForeignKey(
        Comments, on_delete=models.CASCADE, null=True, blank=True
    )

    theMainArticle = models.JSONField(default=dict, null=False, blank=False)
    no_of_views = models.IntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "title"], name="unique_title")
        ]


# NOTE: This model is for the deleted data. (It is used to set up the undo functionality)
class DeletedData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False)
    model_id = models.IntegerField()
    data = models.TextField()
