# Generated by Django 5.1.2 on 2024-11-13 01:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0024_alter_users_email'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlacklistedToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=500, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
