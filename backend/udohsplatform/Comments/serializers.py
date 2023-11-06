from rest_framework import serializers
from .models import Comments
from django.contrib.auth import get_user_model

User = get_user_model()


# This is the serializer for creating a new comment
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comments
        fields = ("article", "comment", "dateCommented", "id", "user")


# This is the serializer to get details of the person that commented on the article
class CommenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "profile_pic", "email")
