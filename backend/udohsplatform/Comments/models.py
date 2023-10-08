from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()


class Comments(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.JSONField(default=dict)
    dateCommented = models.DateTimeField(auto_now_add=True)
