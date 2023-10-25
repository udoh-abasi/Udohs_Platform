from django.db import models
from django.contrib.auth import get_user_model
from UserArticles.models import User_Articles


User = get_user_model()


class Reactions(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    article = models.ForeignKey(User_Articles, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=5)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "article"], name="unique_user_reacting_on_an_article"
            )
        ]
