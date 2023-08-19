from django.contrib import admin
from .models import AppUser


class UserAdmin(admin.ModelAdmin):
    list_display = (
        "email",
        "is_active",
        "is_superuser",
        "is_staff",
        "is_email_verified",
        "auth_provider",
    )


admin.site.register(AppUser, UserAdmin)
