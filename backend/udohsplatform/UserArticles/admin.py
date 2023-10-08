from django.contrib import admin
from .models import User_Articles


class UserArticleAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "title",
        "heroImage",
        "datePosted",
        "likes",
        "comments",
        "theMainArticle",
    )


admin.site.register(User_Articles, UserArticleAdmin)
