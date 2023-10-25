# Generated by Django 4.2.5 on 2023-10-25 14:37

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('UserArticles', '0006_user_articles_no_of_views'),
    ]

    operations = [
        migrations.CreateModel(
            name='Reactions',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reaction_type', models.CharField(max_length=5)),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='UserArticles.user_articles')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name='reactions',
            constraint=models.UniqueConstraint(fields=('user', 'article'), name='unique_user_reacting_on_an_article'),
        ),
    ]