from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
import uuid


class AppUserManager(BaseUserManager):
    def create_user(self, email, password=None, **other_fields):
        if email is None:
            raise ValueError("An email is required")

        if password is None:
            raise ValueError("A password is required")

        email = self.normalize_email(email)
        user = self.model(email=email)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None):
        if email is None:
            raise ValueError("An email is required")

        if password is None:
            raise ValueError("A password is required")

        user = self.create_user(email, password)
        user.is_superuser = True
        user.is_staff = True
        user.is_email_verified = True
        user.premium_member = True
        user.save()
        return user


class AppUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False, primary_key=True
    )
    email = models.EmailField(max_length=50, unique=True)
    is_staff = models.BooleanField(max_length=1, default=False)
    is_email_verified = models.BooleanField(max_length=1, default=False)
    auth_provider = models.CharField(max_length=11, default="AppUser")
    first_name = models.CharField(max_length=20, null=True, blank=True)
    last_name = models.CharField(max_length=20, null=True, blank=True)
    date_joined = models.DateField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    objects = AppUserManager()

    bio = models.TextField(null=True, blank=True, max_length=999)
    premium_member = models.BooleanField(default=False)
    profile_pic = models.ImageField(
        upload_to="user_profile_pics",
        null=True,
        blank=True,
    )
    paystack_ref = models.CharField(null=True, blank=True, max_length=500)
    no_of_post = models.IntegerField(default=0)
