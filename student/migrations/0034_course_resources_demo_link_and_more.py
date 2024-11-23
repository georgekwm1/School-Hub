# Generated by Django 5.1.2 on 2024-11-23 22:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0033_remove_course_resources_demo_link_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='course_resources',
            name='demo_link',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='course_resources',
            name='demo_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
