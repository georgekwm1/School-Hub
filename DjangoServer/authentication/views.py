from django.shortcuts import render, redirect
from django.http import JsonResponse
# from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.hashers import make_password, check_password
from django.utils.crypto import get_random_string
from student.models import *
from .models import Auth
import bcrypt

# Create your views here.


def hash_password(password: str) -> bytes:
    """Hashes a password"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())


def home(request):
    """Home page"""
    return render(request, 'authentication/index.html')


def register(request):
    """Registers a user"""
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        role = request.POST.get('role')
        profile_image = request.FILES.get('image')

        # Check in all neccessary fields are filled
        if not all([first_name, last_name, email, password, role]):
            return render(request, 'authentication/register.html', {'Info': 'All fields required'})

        # Check if email is already registered
        if Users.objects.filter(email=email):
            return render(request, 'authentication/register.html', {'Info': 'Email already exists'})

        # Hash the password
        password_hash = make_password(password)

        # Create the new user
        new_user = Users.objects.create(first_name=first_name,
                                        last_name=last_name,
                                        email=email,
                                        password_hash=password_hash,
                                        role=role,
                                        profile_image=profile_image)
        # Save user to the database
        new_user.save()

        if role == 'tutor':
            tutor = Lecturer.objects.create(user=new_user)
            tutor.save()
        elif role == 'student':
            student = Students.objects.create(user=new_user)
            student.save()
        return render(request, 'authentication/register.html', {'Info': 'User registration successfull'})
    return render(request, 'authentication/register.html')


def login(request):
    """Login a user"""
    # Check if user is already logged in
    current_session = request.session.get('user_id')
    if current_session:
        return redirect('me')  # Redirect if user is already logged in
    # Check if it is a POST request
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Check if both email and password are provided
        if not email or not password:
            return render(request, 'authentication/login.html', {'error': 'Please enter both email and password'})

        # Retrieve the user by email
        user = Users.objects.filter(email=email).first()
        if not user:
            return render(request, 'authentication/login.html', {'Info': 'Email not found, please register'})

        # Check if the password is correct
        if check_password(password, user.password_hash):
            # Set the session and redirect to the user profile
            request.session['user_id'] = user.user_id
            return redirect('me')
        else:
            return render(request, 'authentication/login.html', {'Info': 'Invalid email or password'})

    # Render login page if request is GET
    return render(request, 'authentication/login.html')


def logout(request):
    """Logout the user"""
    # Clears the session to logout the user
    request.session.flush()

    # Redirects to login page
    return redirect('login')


def delete(request):
    """Deletes user's account"""
    if request.session.get('user_id') is not None:
        user = Users.objects.filter(
            user_id=request.session.get('user_id')).first()
        if user:
            user.delete()
            request.session.flush()
            return render(request, 'authentication/login.html',
                          {'Info': f'The account of {user.first_name} {user.last_name} is deleted'})
    return redirect('login')


def forgot_password(request):
    return render(request, 'authentication/forgot_password.html')


def password_reset_request(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        user = Users.objects.filter(email=email).first()
        auth = Auth()

        if user:
            # Generate a unique reset token
            reset_token = auth.generate_token()

            # Save the reset token to the user
            user.reset_token = reset_token
            user.save()

            # Send the email with the reset link
            reset_link = request.build_absolute_uri(
                f'/auth/reset-password/{reset_token}')

            # Send the reset link to the user's email
            auth.send_password_reset_email(user, reset_link)

            return render(request, 'authentication/password_reset_sent.html')
    return render(request, 'authentication/password_reset_request.html', {'Info': 'Email not registered'})


def reset_password(request, token):
    """Reset password"""
    if request.method == 'POST':
        user = Users.objects.filter(reset_token=token).first()

        if user is None:
            # Token invalid
            return render(request, 'authentication/invalid_token.html')

        if request.method == 'POST':
            new_password = request.POST.get('new_password')
            confirm_password = request.POST.get('confirm_password')

            if new_password == confirm_password:
                password_hash = make_password(
                    new_password)  # Set the new password
                user.password_hash = password_hash
                user.reset_token = None  # Invalidate the reset token after use
                user.save()

                # Redirect to login after successful reset
                return redirect('login')

    return render(request, 'authentication/reset_password.html', {'token': token})


def face(request):
    pass


def me(request):
    if request.session.get('user_id') is None:
        return redirect('login')
    try:
        user = Users.objects.filter(
            user_id=request.session.get('user_id')).first()
    except Users.DoesNotExist:
        request.session.flush()
        return redirect('login')

    # name = f"{user.first_name}  {user.last_name}"
    # if name is None:
    #     return redirect('login')
    return render(request, 'authentication/dashboard.html')
