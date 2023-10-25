# Generated by Django 4.2.5 on 2023-10-06 15:07

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("UserArticles", "0002_user_articles_comments_user_articles_likes_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user_articles",
            name="heroImage",
            field=models.ImageField(blank=True, null=True, upload_to="heroImages"),
        ),
        migrations.AlterField(
            model_name="user_articles",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
