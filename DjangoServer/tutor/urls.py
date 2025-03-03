from django.urls import path
from . import views

''' Lecturer's app urls '''

urlpatterns = [
    path('course/add/', views.add_course, name='add_course'),
    path('course/<int:course_id>/edit/', views.edit_course, name='edit_course'),
    path("course/<int:course_id>/add_resource/",
         views.add_resource, name="add_resource"),
    path("resource/<int:resource_id>/edit/",
         views.edit_resource, name="edit_resource"),
    path("course/<int:course_id>/enroll_student/",
         views.enroll_student, name="enroll_student"),
]
