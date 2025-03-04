# forms.py
from django import forms
from student.models import Courses, Course_Resources, Chats, Thread


class CourseForm(forms.ModelForm):
    class Meta:
        model = Courses
        exclude = ['lecturer', 'course_id']


class CourseResourceForm(forms.ModelForm):
    class Meta:
        model = Course_Resources
        exclude = ['resource_id', 'course', 'upload_date']


class ThreadForm(forms.ModelForm):
    class Meta:
        model = Thread
        exclude = ['title']


class ChatsForm(forms.ModelForm):
    class Meta:
        model = Chats
        exclude = ['message']
