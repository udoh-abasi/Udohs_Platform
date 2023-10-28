from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Reactions


User = get_user_model()


class UsersThatReactedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "profile_pic", "first_name", "last_name", "bio")


class ReactionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reactions
        fields = ("user", "reaction_type")
