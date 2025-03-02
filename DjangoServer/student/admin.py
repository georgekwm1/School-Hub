from django.contrib import admin
from . import models

# Register your models here.


class UsersAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'role', 'first_name', 'last_name')


class StudentsAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'user')


class CourseResourcesAdmin(admin.ModelAdmin):
    list_display = ('resource_name', 'lecture')


class ForumAdmin(admin.ModelAdmin):
    list_display = ('forum_id', 'title', 'lecture')


class ThreadAdmin(admin.ModelAdmin):
    list_display = ('thread_id', 'forum', 'title')


class ChatsAdmin(admin.ModelAdmin):
    list_display = ('chat_id', 'thread')


class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('announcement_id', 'lecturer', 'course')


class CommentAdmin(admin.ModelAdmin):
    list_display = ('comment_id', 'announcement', 'user')


class BlacklistAdmin(admin.ModelAdmin):
    list_display = ('token',)


admin.site.register(models.Users, UsersAdmin)
admin.site.register(models.Students, StudentsAdmin)
admin.site.register(models.Course_Resources, CourseResourcesAdmin)
admin.site.register(models.Forum, ForumAdmin)
admin.site.register(models.Thread, ThreadAdmin)
admin.site.register(models.Chats, ChatsAdmin)
admin.site.register(models.Announcement, AnnouncementAdmin)
admin.site.register(models.Comment, CommentAdmin)
admin.site.register(models.BlacklistedToken, BlacklistAdmin)
