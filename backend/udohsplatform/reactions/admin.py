from django.contrib import admin
from .models import Reactions


class ReactionsAdmin(admin.ModelAdmin):
    list_display = ("user", "article", "reaction_type")


admin.site.register(Reactions, ReactionsAdmin)
