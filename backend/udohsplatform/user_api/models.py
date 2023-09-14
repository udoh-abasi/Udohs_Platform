from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin


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
        user.save()
        return user


class AppUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=40, unique=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    auth_provider = models.CharField(max_length=10, default="AppUser")
    first_name = models.CharField(max_length=20, null=True, blank=True)
    last_name = models.CharField(max_length=20, null=True, blank=True)
    date_joined = models.DateField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    objects = AppUserManager()

    bio = models.TextField(null=True, blank=True, max_length=999)
    premium_member = models.BooleanField(default=False)
    profile_pic = models.ImageField(
        upload_to="user_profile_pics", null=True, blank=True
    )


""" 
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile

class Profile(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    publish_status = models.BooleanField(max_length=1, null=True, default=False)
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=0, null=True)
    first_name = models.CharField(max_length=30, null=True)
    last_name = models.CharField(max_length=30, null=True)
    address = models.CharField(max_length=100, null=True)
    birth_date = models.DateField(null=True, blank=True)
    bio = models.TextField(validators=[MaxLengthValidator(1200)])
    location = models.CharField(max_length=100, null=True)
    country = models.CharField(max_length=30, null=True)
    affiliation = models.CharField(max_length=100, null=True, blank=True)
    profile_image = models.ImageField(blank=False, upload_to='profile_images/', default='profile_images/avatar.png')
    cover_image = ResizedImageField(upload_to='cover_images/', size=[768, 432], crop=['middle', 'center'], quality=60,
                                    blank=False, default='cover_images/default_cover_image_1080.jpeg')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)

    def save(self, *args, **kwargs):
        # Opening the uploaded image
        im = Image.open(self.profile_image)

        if im.mode == "JPEG":
            pass
        elif im.mode in ["RGBA", "P"]:
            im = im.convert("RGB")

        output = BytesIO()
        # Resize/modify the image - desired short edge of 200 pixels
        original_width, original_height = im.size

        if original_width > original_height:  # landscape image
            aspect_ratio = round(original_width / original_height, 2)
            desired_height = 200
            desired_width = round(desired_height * aspect_ratio)
            im = im.resize((desired_width, desired_height), Image.ANTIALIAS)

        elif original_height > original_width:  # portrait image
            aspect_ratio = round(original_height / original_width, 2)
            desired_width = 200
            desired_height = round(desired_width * aspect_ratio)
            im = im.resize((desired_width, desired_height), Image.ANTIALIAS)

        elif original_height == original_width:  # square image
            desired_width = 200
            desired_height = 200
            # Resize the image
            im = im.resize((desired_width, desired_height), Image.ANTIALIAS)

        # after modifications, save it to the output
        im.save(output, format='JPEG', subsampling=0, quality=95)
        output.seek(0)

        # change the imagefield value to be the newly modified image value
        self.profile_image = InMemoryUploadedFile(output, 'ImageField',
                                                  "%s.jpg" % self.profile_image.name.split('.')[0], 'image/jpeg',
                                                  sys.getsizeof(output), None)
        super(Profile, self).save()
"""
