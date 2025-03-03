from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.db.models import Q
from django.contrib.auth.hashers import make_password, check_password
from django.utils.crypto import get_random_string
from student.models import *
from authentication.models import Auth


def resources(request, course_id):
    pass


def resources_upload(request, course_id):
    pass


def students(request):
    pass


def courses(request):
    pass


def chat(request):
    all_users = Users.objects.all()
    current_user = request.session.get('user_id')
    return render(request, 'student/chat_display.html', {'all_users': all_users, 'current_user': current_user})


def message(request, user_id):
    receiver = get_object_or_404(Users, user_id=user_id)
    session = request.session.get('user_id')
    sender = Users.objects.filter(user_id=session).first()
    if request.method == 'POST':
        content = request.POST['message']
        if content:
            Chats.objects.create(
                sender=sender, receiver=receiver, message=content)
            messages = Chats.objects.filter((Q(sender=sender) & Q(receiver=receiver))
                                            | (Q(sender=receiver) & Q(receiver=sender))).order_by('timestamp')
            return render(request, 'student/chat.html', {'messages': messages, 'receiver': receiver})
    return render(request, 'student/chat.html', {'receiver': receiver})


def enrollment(request):
    session_id = request.session.get('user_id')
    user = Users.objects.get(user_id=session_id)
    if user.role == 'tutor':
        lecturer = Lecturer.objects.filter(user_id=session_id).first()
        assigned_courses = Courses.objects.filter(
            lecturer_id=lecturer.lecturer_id)
        return render(request, 'student/enrollment.html', {'assigned_courses': assigned_courses})
    else:
        student = Students.objects.filter(user_id=session_id).first()
        enrolled_courses = Enrollments.objects.filter(
            student_id=student.student_id)
        return render(request, 'student/enrollment.html', {'enrolled_courses': enrolled_courses})


def select_career(request, user_id):
    current_user = request.session.get('user_id')
    student = Students.objects.filter(user_id=current_user).first()
    student_id = student.student_id
    if request.method == 'POST':
        career = request.POST.get('career')
        if career:
            courses = Courses.objects.filter(course_department=career)
            for course in courses:
                Enrollments.objects.create(
                    student_id=student_id, course_id=course.course_id)
