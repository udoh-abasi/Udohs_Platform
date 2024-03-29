from django.db import models
from django.contrib.auth import get_user_model
from UserArticles.models import User_Articles

User = get_user_model()


class Comments(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.JSONField(default=dict)
    dateCommented = models.DateTimeField(auto_now_add=True)

    article = models.ForeignKey(User_Articles, on_delete=models.CASCADE)
    comment_likes = models.ManyToManyField(
        User, related_name="comment_likes", blank=True
    )
