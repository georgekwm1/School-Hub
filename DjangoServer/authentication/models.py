from django.db import models
from uuid import uuid4
from django.core.mail import send_mail
from django.utils.crypto import get_random_string

# Create your models here.


class Auth:
    """Auth class to interact with the authentication database."""

    def __init__(self):
        pass

    def create_user(self, username, password):
        """Creates a new user in the database."""
        pass

    def authenticate_user(self, username, password):
        """Authenticates a user in the database."""
        pass

    def get_user(self, username):
        """Gets a user from the database."""
        pass

    def update_user(self, username, password):
        """Updates a user in the database."""
        pass

    def delete_user(self, user):
        """Deletes a user from the database."""
        user.objects.filter(user_id=request.get('user_id')).delete()

    def send_password_reset_email(self, user, reset_link):
        """Sends a password reset email to a user."""
        subject = "Password Reset Request"
        message = f"Hi {user.first_name},\n \
            \nClick the link below to reset your password:\n{reset_link}"
        send_mail(subject, message, 'georgekwm1@gmail.com', [user.email])

    def generate_token(self):
        """Generates the reset token"""
        return get_random_string(length=32)
