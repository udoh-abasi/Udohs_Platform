from django.contrib import admin
from .models import Likes


class LikesAdmin(admin.ModelAdmin):
    list_display = ("user",)


admin.site.register(Likes, LikesAdmin)
