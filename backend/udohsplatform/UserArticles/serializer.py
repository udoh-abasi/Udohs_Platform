from rest_framework import serializers
from .models import User_Articles
from Likes.models import Likes
from Likes.serializers import LikesSerializer
from Comments.models import Comments


class UserArticleSerializer(serializers.ModelSerializer):
    # theMainArticle = serializers.DictField()  # NOTE: CHANGE THE DATA IN THIS FIELD

    # the_likes = serializers.SerializerMethodField()

    class Meta:
        model = User_Articles
        # fields = (
        #     "id",
        #     "pk",
        #     "title",
        #     "theMainArticle",
        #     # "the_likes",
        #     "user",
        #     "heroImage",
        #     "datePosted",
        #     "edited",
        # )
        fields = "__all__"

    # NOTE: this 'obj' is the product object we want to return values for. And it will be passed in when running this ProductSerializers (like so - ProductSerializers(singleProduct))
    # def get_the_likes(self, obj):
    #     print("The object in get_the_likes is", obj)

    #     # NOTE: Remember that 'ShoppingCartItem' has these two attributes ('product', and 'quantity')
    #     likes = Likes.objects.filter(user=obj)

    #     # NOTE: Notice the '.data' attribute, below, which will return all the fields in this serializer class, as key-value pairs
    #     return LikesSerializer(likes, many=True).data
