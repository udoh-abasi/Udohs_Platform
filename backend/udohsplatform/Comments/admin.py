from django.contrib import admin
from .models import Comments


class CommentsAdmin(admin.ModelAdmin):
    list_display = ("user", "comment", "dateCommented")


admin.site.register(Comments, CommentsAdmin)
