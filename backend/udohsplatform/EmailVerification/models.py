from django.db import models


class EmailVerification(models.Model):
    email = models.EmailField(unique=True)
    code = models.CharField(max_length=6)
    is_email_verified = models.BooleanField(default=False)
