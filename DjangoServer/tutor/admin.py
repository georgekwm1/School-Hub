from django.contrib import admin
from student import models

# Register your models here.


class LecturerAdmin(admin.ModelAdmin):
    list_display = ('lecturer_id', 'user')


class CoursesAdmin(admin.ModelAdmin):
    list_display = ('course_id', 'course_name')


class LectureAdmin(admin.ModelAdmin):
    list_display = ('lecture_id', 'lecture_name')


admin.site.register(models.Lecturer, LecturerAdmin)
admin.site.register(models.Courses, CoursesAdmin)
admin.site.register(models.Lecture, LectureAdmin)
