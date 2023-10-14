from django.contrib import admin
from .models import User_Articles, DeletedData


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


class DeletedDataAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "model_id",
        "data",
    )


admin.site.register(User_Articles, UserArticleAdmin)
admin.site.register(DeletedData, DeletedDataAdmin)
