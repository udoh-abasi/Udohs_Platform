from rest_framework import serializers
from .models import User_Articles

from Comments.models import Comments
from django.contrib.auth import get_user_model


User = get_user_model()


class UserArticleSerializer(serializers.ModelSerializer):
    # theMainArticle = serializers.DictField()  # NOTE: CHANGE THE DATA IN THIS FIELD

    # the_likes = serializers.SerializerMethodField()

    class Meta:
        model = User_Articles
        fields = (
            "id",
            "title",
            "theMainArticle",
            "user",
            "heroImage",
            "datePosted",
            "edited",
            # "the_likes"
        )
        # fields = "__all__"

    # NOTE: this 'obj' is the product object we want to return values for. And it will be passed in when running this ProductSerializers (like so - ProductSerializers(singleProduct))
    # def get_the_likes(self, obj):
    #     print("The object in get_the_likes is", obj)

    #     # NOTE: Remember that 'ShoppingCartItem' has these two attributes ('product', and 'quantity')
    #     likes = User_Articles.objects.filter(user=obj.user)

    #     # NOTE: Notice the '.data' attribute, below, which will return all the fields in this serializer class, as key-value pairs
    #     return LikesSerializer(likes, many=True).data


# This serializer is used when we want to return other-articles that were posted by the same user.
# The model query uses the .only() to make sure only these fields are fetched, thereby increasing the server response time
class OtherArticlesFromSamePosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Articles
        fields = ("id", "title", "heroImage", "datePosted", "theMainArticle")


class ArticlePosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "profile_pic")


# This serializer is used to make sure that, even though its data is a list, it returns the data
class AllArticleSerializer(serializers.Serializer):
    post = serializers.DictField()
    poster = serializers.DictField()

    class Meta:
        fields = ["post", "poster"]


class TopPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Articles
        fields = ("id", "title", "user", "datePosted")


class SearchArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Articles
        fields = ("id", "title", "heroImage", "datePosted", "theMainArticle", "user")
