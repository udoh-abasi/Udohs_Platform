# Generated by Django 4.2.5 on 2023-10-14 16:02

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("UserArticles", "0004_rename_themainarticles_user_articles_themainarticle"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user_articles",
            name="heroImage",
            field=models.ImageField(default=1, upload_to="heroImages"),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="user_articles",
            name="user",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name="DeletedData",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("model_id", models.IntegerField()),
                ("data", models.TextField()),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]