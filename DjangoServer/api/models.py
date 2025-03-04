from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import authenticate

# Create your models here.
from rest_framework import serializers
from student.models import *


class UserSerializer(serializers.ModelSerializer):
    pictureURL = serializers.URLField(required=False)

    class Meta:
        model = Users
        exclude = ['password_hash', 'reset_token']
        # fields = ['user_id', 'first_name', 'last_name', 'email', 'role']


class UserPostSerializer(serializers.ModelSerializer):
    # profile_image = serializers.ImageField(required=False)
    # pictureURL = serializers.URLField(required=False)

    class Meta:
        model = Users
        exclude = ['reset_token', 'pictureId']  # , 'password_hash']


class UserLoginSerializer(serializers.ModelSerializer):
    # profile_image = serializers.ImageField(required=False)
    # pictureURL = serializers.URLField(required=False)

    class Meta:
        model = Users
        fields = ['email', 'password_hash', 'pictureURL']


class UserResetPasswordSerializer(serializers.ModelSerializer):
    # profile_image = serializers.ImageField(required=False)
    # pictureURL = serializers.URLField(required=False)

    class Meta:
        model = Users
        fields = ['email']


class UserResetTokenSerializer(serializers.ModelSerializer):
    # profile_image = serializers.ImageField(required=False)
    # pictureURL = serializers.URLField(required=False)

    class Meta:
        model = Users
        fields = ['reset_token']


class UserEditSerializer(serializers.ModelSerializer):
    # pictureURL = serializers.URLField(required=False)

    class Meta:
        model = Users
        fields = ['first_name', 'last_name']


class UserImageEditSerializer(serializers.ModelSerializer):
    # profile_image = serializers.ImageField(required=False)
    # pictureURL = serializers.URLField(required=False)

    class Meta:
        model = Users
        fields = ['pictureId', 'pictureURL', 'pictureThumbnail']


class StudentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Students
        fields = '__all__'


class LecturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecturer
        fields = '__all__'


class CoursesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Courses
        fields = '__all__'


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = '__all__'
        read_only_fields = ['course']


class CoursesResourcesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course_Resources
        fields = '__all__'
        read_only_fields = ['lecture']


class LectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecture
        fields = '__all__'
        read_only_fields = ['chapter']


class FacialRecognitionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facial_Recognition
        fields = '__all__'


class ChatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chats
        fields = '__all__'
        read_only_fields = ['sender', 'thread']


class EnrollmentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollments
        fields = '__all__'
        read_only_fields = ['student', 'course']


class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = '__all__'
        read_only_fields = ['lecture', 'creator']


class ThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = '__all__'
        read_only_fields = ['forum', 'user', 'chat_counts']


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['course', 'lecturer']


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['announcement', 'user']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add additional user information to the response data
        email = attrs.get('email')
        password = attrs.get('password')

        # Use custom authentication backend
        user = authenticate(email=email, password=password)
        print(f"User: {user}")

        if user is None:
            raise serializers.ValidationError(
                "No active account found with the given credentials")
        refresh = self.get_token(self.user)
        access_token = refresh.access_token

        # Add custom claims
        refresh['user_id'] = self.user.user_id
        refresh['first_name'] = self.user.first_name
        refresh['last_name'] = self.user.last_name
        refresh['email'] = self.user.email
        refresh['role'] = self.user.role
        data = {'user_id': self.user.user_id, 'first_name': self.user.first_name,
                'last_name': self.user.last_name, 'email': self.user.email,
                'role': self.user.role}
        return {
            'refresh': str(refresh),
            'access': str(access_token),
            'user': data
        }


class CustomAuthenticationBackend(BaseBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = Users.objects.get(email=email)
            print(f"User: {user}")
            print(f"Password: {password}")

            # Validate the password with password_hash
            if check_password(password, user.password_hash):
                return user
        except Users.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return Users.objects.get(user_id=user_id)
        except Users.DoesNotExist:
            return None
