# Generated by Django 4.2.5 on 2023-10-07 05:40

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("UserArticles", "0003_alter_user_articles_comments_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="user_articles",
            old_name="theMainArticles",
            new_name="theMainArticle",
        ),
    ]
