from django.contrib import admin
from .models import PasswordEmailVerification


class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ("email", "code", "is_email_verified")


admin.site.register(PasswordEmailVerification, EmailVerificationAdmin)
