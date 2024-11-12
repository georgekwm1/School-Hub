from django.views.decorators.csrf import ensure_csrf_cookie
import requests
import secrets
import logging
from django.shortcuts import render, get_object_or_404, redirect
from rest_framework.decorators import action, api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.views import APIView
from django.db.models import Q
from django.http import JsonResponse, HttpResponseForbidden, HttpResponseRedirect
from django.contrib.auth.hashers import make_password, check_password
from social_django.utils import psa
from django.contrib.auth import login
from .models import *
from authentication.models import Auth
from django.utils.crypto import get_random_string
from social_django.utils import load_strategy, load_backend
from social_core.exceptions import AuthMissingParameter, AuthForbidden
from django.conf import settings
import logging
from django.views.decorators.csrf import csrf_exempt
from imagekitio import ImageKit
import requests
import base64
from schoolhub.passkeys import IMAGE_KIT_AUTH
logger = logging.getLogger(__name__)
# Create your views here.


def encode64(private_key):
    encoded_credentials = base64.b64encode(f"{private_key}:".encode()).decode()
    return encoded_credentials


def home_view(request):
    return JsonResponse({"message": "Welcome to School Hub Api page"})


class UserListView(APIView):
    def get(self, request):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        users = Users.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # def post(self, request):
    #     serializer = UserSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserIdView(APIView):
    def get(self, request, user_id):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            user = Users.objects.get(user_id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Users.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def register(request):
    serializer = UserPostSerializer(data=request.data)
    if serializer.is_valid():
        password = serializer.validated_data.get('password_hash')
        email = serializer.validated_data.get('email')
        user = Users.objects.filter(email=email).first()
        if user is not None:
            return Response({'message': 'User already exists'}, status=status.HTTP_409_CONFLICT)
        user = serializer.save(password_hash=make_password(password))
        user.save()

        if serializer.validated_data.get('role') == 'tutor':
            tutor = Lecturer.objects.create(user=user)
            tutor.save()
        elif serializer.validated_data.get('role') == 'student':
            student = Students.objects.create(user=user)
            student.save()
        response_data = {"message": "Registration successful"}
        user_response = {"user": serializer.data}
        response_data.update(user_response)
        request.session['user_id'] = user.user_id
        return Response(response_data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserEditView(APIView):
    def put(self, request):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        user = Users.objects.filter(user_id=session_id).first()
        if user:
            serializer = UserEditSerializer(
                user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                new_data = serializer.data.copy()
                # new_data.pop('pictureId')
                return Response(new_data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'You are not a user. Please register first.'}, status=status.HTTP_403_FORBIDDEN)

    def delete(self, request):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        user = Users.objects.filter(user_id=session_id).first()
        if user:
            url = f"https://api.imagekit.io/v1/files/{user.pictureId}"
            headers = {
                "Authorization": f"Basic {encode64(IMAGE_KIT_AUTH.get('private_key'))}",
                "Accept": "application/json"
            }
            response = requests.delete(url, headers=headers, timeout=200)
            print("Status Code:", response.status_code)
            print("Response Text:", response.text)
            user.delete()
            request.session.flush()
            return Response({"message": "Your account has been successfully deleted"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"message": "Cant find user, please register first"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['PUT'])
def edit_user_image(request):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.filter(user_id=session_id).first()
    if user:
        serializer = UserImageEditSerializer(
            user, data=request.data, partial=True)
        if serializer.is_valid():
            url = f"https://api.imagekit.io/v1/files/{user.pictureId}"
            headers = {
                "Authorization": f"Basic {encode64(IMAGE_KIT_AUTH.get('private_key'))}",
                "Accept": "application/json"
            }
            response = requests.delete(url, headers=headers)
            print("Status Code:", response.status_code)
            print("Response Text:", response.text)
            serializer.save()
            new_data = serializer.data.copy()
            new_data.pop('pictureId')
            return Response(new_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': 'You are not a user. Please register first.'}, status=status.HTTP_403_FORBIDDEN)

# @csrf_exempt
# @ensure_csrf_cookie


@api_view(['POST'])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password_hash')
        user = Users.objects.filter(email=email).first()
        if user and not check_password(password, user.password_hash):
            return Response({'message': 'Invalid password'}, status=status.HTTP_406_NOT_ACCEPTABLE)
        if user and check_password(password, user.password_hash):
            request.session['user_id'] = user.user_id
            request.session.save()
            print("Session ID:", request.session.session_key)
            dictList = {
                'userid': user.user_id,
                'firstname': user.first_name,
                'lastname': user.last_name,
                'email': user.email,
                'pictureURL': user.pictureURL if user.pictureURL else None,
                'pictureThumbnail': user.pictureThumbnail if user.pictureThumbnail else None
            }
            # Create a list and append dictList directly
            response_data = {'message': 'Login successful'}
            user_response = {"user": dictList}
            response_data.update(user_response)
            return Response(response_data, status=status.HTTP_200_OK)
        return Response({'message': 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': 'Input Not Valid'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
def logout(request):
    print("Session ID:", request.session.session_key)
    if request.session.get('user_id') is None:
        return Response({'message': 'You are already Logged out'}, status=status.HTTP_401_UNAUTHORIZED)
    print("Afer Session ID:", request.session.session_key)
    request.session.flush()
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def reset_password(request):
    auth = Auth()
    serializer = UserResetPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data.get('email')
        user = Users.objects.filter(email=email).first()
        if user:
            # Generate a password reset token and send it to the user's email
            token = auth.generate_token()
            reset_link = request.build_absolute_uri(
                f'/api/reset_token/{token}')
            auth.send_password_reset_email(user, reset_link)
            # Saves the token to the database
            user.reset_token = token
            user.save()
            return Response({'message': 'Password reset link sent to your email'}, status=status.HTTP_200_OK)
        return Response({'message': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def reset_token(request, token):
    if request.method == 'POST':
        # Gets the JSON format new password and confirmed password
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # If both passwords are not the same, returns a JSON error message with a 404 status
        if new_password != confirm_password:
            return Response({'message': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        # Gets user with corresponding reset token
        user = Users.objects.filter(reset_token=token).first()

        # Encrypts the input password, clean the reset token and saves it to the database
        user.password_hash = make_password(new_password)
        user.reset_token = None
        user.save()
        return Response({'message': 'New password created'}, status=status.HTTP_201_CREATED)
    # Gets user with corresponding reset token
    user = Users.objects.filter(reset_token=token).first()
    if user:
        # if user is valid serializes the user data and return a JSON response
        serializer = UserResetTokenSerializer(user, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response({'message': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

# def custom_redirect(backend, user, response, *args, **kwargs):
#     if backend.name == 'google-oauth2':
#         return redirect('google_login')


def google_login(request):
    """Initiates Google OAuth2 login"""
    # Redirect to the Google OAuth2 backend's start endpoint
    return HttpResponseRedirect('/oauth/login/google-oauth2/')


logger = logging.getLogger(__name__)


@api_view(['GET'])
def google_callback(request):

    code = request.GET.get('code')
    if not code:
        print(f'Token: {code}')
        return Response({'message': 'No code'}, status=status.HTTP_400_BAD_REQUEST)

     # Exchange authorization code for an access token
    token_response = requests.post(
        'https://oauth2.googleapis.com/token',
        data={
            'code': code,
            'client_id': f'{settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY}',
            'client_secret': f'{settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET}',
            # Must match your redirect URI
            'redirect_uri': 'http://127.0.0.1:8000/auth/google/callback/',
            'grant_type': 'authorization_code'
        }
    )
    token_json = token_response.json()
    print(f'Response: {token_json}')
    access_token = token_json.get('access_token')
    print(f'Acces Token: {access_token}')

    if access_token:
        # Now use the access token to fetch user info
        user_info_response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        user_info = user_info_response.json()
        email = user_info.get('email')
    if email:
        user = Users.objects.filter(email=email).first()
        request.session['user_id'] = user.user_id
        return redirect('me')
        # Now you can use the email for your application logic
        # return Response({'message': f'{email}'}, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Request Unsuccessfull'}, status=status.HTTP_403_FORBIDDEN)


class StudentListView(APIView):
    def get(self, request):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        students = Students.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LecturerListView(APIView):
    def get(self, request):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        lecturer = Lecturer.objects.all()
        serializer = LecturerSerializer(lecturer, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CoursesListView(APIView):
    def get(self, request):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'message': 'You are not logged in'}, status=status.HTTP_403_FORBIDDEN)
        courses = Courses.objects.all()
        serializer = CoursesSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CoursesListByLecturerView(APIView):
    def get(self, request, user_id):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'message': 'You are not logged in'}, status=status.HTTP_403_FORBIDDEN)
        user = get_object_or_404(Users, user_id=user_id)
        if user.role == 'tutor':
            lecturer = Lecturer.objects.filter(user=user).first()
            courses = Courses.objects.filter(lecturer=lecturer)
        serializer = CoursesSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CoursesCreateView(APIView):
    def post(self, request):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'message': 'You are not logged in'}, status=status.HTTP_403_FORBIDDEN)
        user = Users.objects.get(user_id=session_id)
        if user.role == 'tutor':
            serializer = CoursesSerializer(data=request.data)
            if serializer.is_valid():
                lecturer = get_object_or_404(Lecturer, user=user)
                course = serializer.save(lecturer=lecturer)
                course.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'You are not a tutor'}, status=status.HTTP_403_FORBIDDEN)


class CoursesEditDeleteView(APIView):
    def put(self, request, course_id):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'message': 'You are not logged in'}, status=status.HTTP_403_FORBIDDEN)
        user = Users.objects.get(user_id=session_id)
        if user.role == 'tutor':
            lecturer = get_object_or_404(Lecturer, user=user)
            course = get_object_or_404(
                Courses, lecturer=lecturer, course_id=course_id)
            serializer = CoursesSerializer(
                course, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'You are not a tutor'}, status=status.HTTP_403_FORBIDDEN)

    def delete(self, request, course_id):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'message': 'You are not logged in'}, status=status.HTTP_403_FORBIDDEN)
        user = Users.objects.get(user_id=session_id)
        if user.role == 'tutor':
            lecturer = get_object_or_404(Lecturer, user=user)  # get lecturer

            course = Courses.objects.filter(
                Q(lecturer=lecturer) & Q(course_id=course_id)).first()
            if course:
                course.delete()
                return Response({"message": "Course deleted"}, status=status.HTTP_200_OK)
            return Response({"message": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'You are not a tutor'}, status=status.HTTP_401_UNAUTHORIZED)


class CourseResourcesListView(APIView):
    def get(self, request):
        course_resources = Course_Resources.objects.all()
        serializer = CoursesResourcesSerializer(course_resources, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'message': 'You are not logged in'}, status=status.HTTP_403_FORBIDDEN)
        user = Users.objects.get(user=session_id)
        if user.role == 'tutor':
            serializer = CoursesResourcesSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'You are not a tutor'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
def course_lectures(request, course_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    course = get_object_or_404(Courses, course_id=course_id)
    lecture = Lecture.objects.filter(course=course)
    serializer = LectureSerializer(lecture, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def course_lecture_by_id(request, course_id, lecture_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    course = get_object_or_404(Courses, course_id=course_id)
    lecture = Lecture.objects.filter(
        Q(course=course) & Q(lecture_id=lecture_id)).first()
    serializer = LectureSerializer(lecture, many=False)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_lecture(request, course_id):
    session_id = request.session.get('user_id')
    if session_id is not None:
        user = Users.objects.get(user_id=session_id)
        if user.role == 'tutor':
            serializer = LectureSerializer(data=request.data)
            course = Courses.objects.filter(course_id=course_id).first()
            if course is None:
                return Response({"message": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
            if serializer.is_valid():
                serializer.save(course=course)
                # lecture.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "You are not a tutor"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({"message": "You must login first"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['PUT'])
def edit_lecture(request, course_id, lecture_id):
    session_id = request.session.get('user_id')
    if session_id is not None:
        user = Users.objects.get(user_id=session_id)
        if user.role == 'tutor':
            course = Courses.objects.filter(course_id=course_id).first()
            lecture = Lecture.objects.filter(
                Q(course=course) & Q(lecture_id=lecture_id)).first()
            serializer = LectureSerializer(
                lecture, data=request.data, partial=True)

            if serializer.is_valid():

                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "You are not a tutor"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({"message": "You must login first"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['DELETE'])
def delete_lecture(request, course_id, lecture_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    if user.role == 'tutor':
        course = Courses.objects.filter(course_id=course_id).first()
        lecture = Lecture.objects.filter(Q(course=course) & Q(
            lecture_id=lecture_id)).first()
        if not lecture:
            return Response({"message": "Lecture not found"}, status=status.HTTP_404_NOT_FOUND)
        lecture.delete()
        return Response({"message": "Lecture deleted successfully"}, status=status.HTTP_200_OK)
    return Response({"message": "You are not a tutor"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def all_resources_by_lecture(request, course_id, lecture_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    course = get_object_or_404(Courses, course_id=course_id)
    lecture = get_object_or_404(Lecture, course=course, lecture_id=lecture_id)
    resource = Course_Resources.objects.filter(lecture=lecture)
    serializer = CoursesResourcesSerializer(resource, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def resource_by_lecture(request, course_id, lecture_id, resource_id):
    course = get_object_or_404(Courses, course_id=course_id)
    lecture = get_object_or_404(Lecture, course=course, lecture_id=lecture_id)
    resource = Course_Resources.objects.filter(
        Q(lecture=lecture) & Q(resource_id=resource_id))
    serializer = CoursesResourcesSerializer(resource, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_resource_by_lecture(request, course_id, lecture_id):
    session_id = request.session.get('user_id')
    if session_id is not None:
        user = Users.objects.get(user_id=session_id)
        if user.role == 'tutor':
            serializer = CoursesResourcesSerializer(data=request.data)

            if serializer.is_valid():
                course = Courses.objects.filter(course_id=course_id).first()
                lecture = get_object_or_404(
                    Lecture, course=course, lecture_id=lecture_id)
                resource_name = serializer.validated_data.get('resource_name')
                resource_file = serializer.validated_data.get('resource_file')
                resource_link = serializer.validated_data.get('resource_link')
                resource = Course_Resources.objects.create(lecture=lecture,
                                                           resource_name=resource_name, resource_file=resource_file, resource_link=resource_link)
                resource.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "You are not a tutor"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({"message": "You must login first"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['PUT'])
def edit_resource_by_lecture(request, course_id, lecture_id, resource_id):
    session_id = request.session.get('user_id')
    if session_id is not None:
        user = Users.objects.get(user_id=session_id)
        if user.role == 'tutor':
            course = Courses.objects.filter(course_id=course_id).first()
            lecture = Lecture.objects.filter(Q(course=course) & Q(
                lecture_id=lecture_id)).first()
            resource = get_object_or_404(
                Course_Resources, lecture=lecture, resource_id=resource_id)
            serializer = CoursesResourcesSerializer(
                resource, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "You are not a tutor"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({"message": "You must login first"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['DELETE'])
def delete_resource_by_lecture(request, course_id, lecture_id, resource_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    if user.role == 'tutor':
        course = Courses.objects.filter(course_id=course_id).first()
        lecture = Lecture.objects.filter(Q(course=course) & Q(
            lecture_id=lecture_id)).first()
        resources = Course_Resources.objects.filter(
            Q(resource_id=resource_id) & Q(lecture=lecture)).first()
        if not resources:
            return Response({"message": "Resource not found"}, status=status.HTTP_404_NOT_FOUND)
        resources.delete()
        return Response({"message": "Resource deleted successfully"}, status=status.HTTP_200_OK)
    return Response({"message": "You are not a tutor"}, status=status.HTTP_401_UNAUTHORIZED)


class FacialRecognitionListView(APIView):
    def get(self, request):
        facial = Facial_Recognition.objects.all()
        serializer = FacialRecognitionsSerializer(facial, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = FacialRecognitionsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnrollmentListView(APIView):
    def get(self, request):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'message': 'You are not logged in'}, status=status.HTTP_403_FORBIDDEN)
        enrollments = Enrollments.objects.all()
        serializer = EnrollmentsSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EnrollmentForStudentView(APIView):
    def post(self, request, course_id):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'message': 'You are not logged in'}, status=status.HTTP_403_FORBIDDEN)
        user = get_object_or_404(Users, user_id=session_id)
        course = Courses.objects.filter(course_id=course_id).first()
        if user.role == 'student':
            student = Students.objects.filter(user=user).first()
            serializer = EnrollmentsSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(student=student, course=course)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'You can only enroll here as a student'}, status=status.HTTP_401_UNAUTHORIZED)


class EnrollmentForLecturerView(APIView):
    def post(self, request, course_id, student_id):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'message': 'You are not logged in'}, status=status.HTTP_403_FORBIDDEN)
        user = get_object_or_404(Users, user_id=session_id)

        if user.role == 'tutor':
            lecturer = Lecturer.objects.filter(user=user).first()
            student = Students.objects.filter(student_id=student_id).first()
            course = Courses.objects.filter(
                Q(course_id=course_id) & Q(lecturer=lecturer)).first()
            if course:
                serializer = EnrollmentsSerializer(data=request.data)
                if serializer.is_valid():
                    serializer.save(student=student, course=course)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({'message': 'No course matching the query found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'You can only enroll here as a student'}, status=status.HTTP_401_UNAUTHORIZED)

    def delete(self, request, course_id, student_id):
        session_id = request.session.get('user_id')
        if session_id is None:
            return Response({'message': 'You are not logged in'}, status=status.HTTP_403_FORBIDDEN)
        user = get_object_or_404(Users, user_id=session_id)
        if user.role == 'tutor':
            lecturer = Lecturer.objects.filter(user=user).first()
            student = Students.objects.filter(student_id=student_id).first()
            course = Courses.objects.filter(
                Q(course_id=course_id) & Q(lecturer=lecturer)).first()
            if not course:
                return Response({"message": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
            enrollment = Enrollments.objects.filter(
                Q(course=course) & Q(student=student)).first()
            if not enrollment:
                return Response({"message": "Student not Enrolled to this Course"}, status=status.HTTP_404_NOT_FOUND)
            enrollment.delete()
            student_name = f"{student.user.first_name} {student.user.last_name}'s"
            response_data = {
                "message": f"{student_name} enrollment to {course.course_name} has been deleted"}
            return Response(response_data, status=status.HTTP_204_NO_CONTENT)
        return Response({'message': 'Contact the tutor of this course to delete your enrollment'}, status=status.HTTP_403_FORBIDDEN)


# class ChatListView(APIView):
#     def get(self, request):
#         chats = Chats.objects.all()
#         serializer = ChatsSerializer(chats, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def post(self, request):
#         serializer = ChatsSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def forums_by_course(request, course_id):
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(course=course)
    serializer = ForumSerializer(forum, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def forum_by_course(request, course_id, forum_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    forum_of_course = Forum.objects.filter(
        Q(creator=user) & Q(course=course) & Q(forum_id=forum_id)).first()
    serializer = ForumSerializer(forum_of_course, many=False)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_forum(request, course_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)

    user = Users.objects.get(user_id=session_id)
    serializer = ForumSerializer(data=request.data)
    if serializer.is_valid():
        course = Courses.objects.filter(course_id=course_id).first()
        title = serializer.validated_data.get('title')
        description = serializer.validated_data.get('description')
        forum = Forum.objects.create(
            course=course, title=title, description=description, creator=user)
        forum.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def edit_forum(request, course_id, forum_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)

    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(Q(course=course) & Q(
        forum_id=forum_id) & Q(creator=user)).first()
    serializer = ForumSerializer(forum, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_forum(request, course_id, forum_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)

    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(Q(course=course) & Q(
        forum_id=forum_id) & Q(creator=user))
    if not forum:
        return Response({"message": "forum not found"}, status=status.HTTP_404_NOT_FOUND)
    forum.delete()
    return Response({"message": "forum deleted successfully"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def chats_in_forum_by_course(request, course_id, forum_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(course=course) & Q(forum_id=forum_id)).first()
    threads = Thread.objects.filter(forum=forum)
    new_data = []
    for thread in threads:
        comments = Chats.objects.filter(thread=thread)
        serializer = ChatsSerializer(comments, many=True)
        new_data.append(serializer.data)
    return Response(new_data, status=status.HTTP_200_OK)


@api_view(['GET'])
def chat_in_forum_by_course(request, course_id, forum_id, chat_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(course=course) & Q(forum_id=forum_id)).first()
    threads = Thread.objects.filter(forum=forum)
    new_data = []
    for thread in threads:
        comment = Chats.objects.filter(
            Q(thread=thread) & Q(chat_id=chat_id)).first()
        serializer = ChatsSerializer(comment, many=False)
        new_data.append(serializer.data)
    return Response(new_data, status=status.HTTP_200_OK)


@api_view(['GET'])
def chats_in_thread_by_forum(request, course_id, forum_id, thread_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(course=course) & Q(forum_id=forum_id)).first()
    thread = Thread.objects.filter(
        Q(forum=forum) & Q(thread_id=thread_id)).first()
    comment = Chats.objects.filter(thread=thread)
    new_data = []
    for comm in comment:
        serializer = ChatsSerializer(comm, many=False)
        new_data.append(serializer.data)

    return Response(new_data, status=status.HTTP_200_OK)


@api_view(['GET'])
def chat_in_thread_by_forum(request, course_id, forum_id, thread_id, chat_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(course=course) & Q(forum_id=forum_id)).first()
    thread = Thread.objects.filter(
        Q(forum=forum) & Q(thread_id=thread_id)).first()
    comment = Chats.objects.filter(
        Q(thread=thread) & Q(chat_id=chat_id)).first()
    serializer = ChatsSerializer(comment, many=False)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_chat(request, course_id, forum_id, thread_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(course=course) & Q(forum_id=forum_id)).first()
    thread = Thread.objects.filter(
        Q(thread_id=thread_id) & Q(forum=forum)).first()
    serializer = ChatsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(sender=user, thread=thread)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def edit_chat(request, course_id, forum_id, thread_id, chat_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(forum_id=forum_id) & Q(course=course)).first()
    thread = Thread.objects.filter(
        Q(thread_id=thread_id) & Q(forum=forum)).first()
    chat = Chats.objects.filter(Q(thread=thread) & Q(
        chat_id=chat_id) & Q(sender=user)).first()
    serializer = ChatsSerializer(chat, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_chat(request, course_id, forum_id, thread_id, chat_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(forum_id=forum_id) & Q(course=course)).first()
    thread = Thread.objects.filter(
        Q(thread_id=thread_id) & Q(forum=forum)).first()
    chat = Chats.objects.filter(Q(thread=thread) & Q(
        chat_id=chat_id) & Q(sender=user)).first()
    if not chat:
        return Response({"message": "Chat not found"}, status=status.HTTP_404_NOT_FOUND)
    chat.delete()
    return Response({"message": "Chat deleted successfully"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def threads_in_forum_by_course(request, course_id, forum_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(course=course) & Q(forum_id=forum_id)).first()
    threads = Thread.objects.filter(forum=forum)
    serializer = ThreadSerializer(threads, many=True)
    if threads:
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response({"message": "No threads found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def thread_in_forum_by_course(request, course_id, forum_id, thread_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(course=course) & Q(forum_id=forum_id)).first()
    threads = Thread.objects.filter(
        Q(forum=forum) & Q(thread_id=thread_id)).first()
    serializer = ThreadSerializer(threads, many=False)
    if threads:
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response({"message": "No threads found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def create_thread(request, course_id, forum_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(forum_id=forum_id) & Q(course=course)).first()
    serializer = ThreadSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(forum=forum, user=user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def edit_thread(request, course_id, forum_id, thread_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(
        Q(course=course) & Q(forum_id=forum_id)).first()
    thread = Thread.objects.filter(Q(forum=forum) & Q(
        user=user) & Q(thread_id=thread_id)).first()
    serializer = ThreadSerializer(thread, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_thread(request, course_id, forum_id, thread_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    forum = Forum.objects.filter(forum_id=forum_id).first()
    thread = Thread.objects.filter(
        Q(thread_id=thread_id) & Q(forum=forum) & Q(user=user)).first()
    if not thread:
        return Response({"message": "Thread not found"}, status=status.HTTP_404_NOT_FOUND)
    thread.delete()
    return Response({"message": "Thread deleted successfully"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def announcements(request, course_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    course = Courses.objects.filter(course_id=course_id).first()
    announcement = Announcement.objects.filter(course=course)
    serializer = AnnouncementSerializer(announcement, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def announcement_by_id(request, course_id, announcement_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    course = Courses.objects.filter(course_id=course_id).first()
    announcement = Announcement.objects.filter(
        Q(course=course) & Q(announcement_id=announcement_id)).first()
    serializer = AnnouncementSerializer(announcement, many=False)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_announcement(request, course_id):
    session_id = request.session.get('user_id')
    if session_id is not None:
        user = Users.objects.get(user_id=session_id)
        if user.role == 'tutor':
            serializer = AnnouncementSerializer(data=request.data)
            course = Courses.objects.filter(course_id=course_id).first()
            lecturer = Lecturer.objects.filter(user=user).first()
            if serializer.is_valid():
                serializer.save(course=course, lecturer=lecturer)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "You are not a tutor"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({"message": "You must login first"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['PUT'])
def edit_announcement(request, course_id, announcement_id):
    session_id = request.session.get('user_id')
    if session_id is not None:
        user = Users.objects.get(user_id=session_id)
        if user.role == 'tutor':
            course = Courses.objects.filter(course_id=course_id).first()
            lecturer = Lecturer.objects.filter(user=user).first()
            announcement = Announcement.objects.filter(Q(course=course) & Q(
                lecturer=lecturer) & Q(announcement_id=announcement_id)).first()
            serializer = AnnouncementSerializer(
                announcement, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "You are not a tutor"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({"message": "You must login first"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['DELETE'])
def delete_announcement(request, course_id, announcement_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    if user.role == 'tutor':
        course = Courses.objects.filter(course_id=course_id).first()
        lecturer = Lecturer.objects.filter(user=user).first()
        announcement = Announcement.objects.filter(Q(lecturer=lecturer) & Q(
            course=course) & Q(announcement_id=announcement_id)).first()
        if not announcement:
            return Response({"message": "Announcement not found"}, status=status.HTTP_404_NOT_FOUND)
        announcement.delete()
        return Response({"message": "Announcement deleted successfully"}, status=status.HTTP_200_OK)
    return Response({"message": "You are not a tutor"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def comments(request, course_id, announcement_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    announcement = Announcement.objects.filter(
        Q(course=course) & Q(announcement_id=announcement_id)).first()
    comment = Comment.objects.filter(
        Q(announcement=announcement) & Q(user=user))
    serializer = CommentSerializer(comment, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def comment_by_id(request, course_id, announcement_id, comment_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    course = Courses.objects.filter(course_id=course_id).first()
    announcement = Announcement.objects.filter(
        Q(course=course) & Q(announcement_id=announcement_id)).first()
    comment = Comment.objects.filter(Q(announcement=announcement) & Q(
        user=user) & Q(comment_id=comment_id)).first()
    serializer = CommentSerializer(comment, many=False)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_comment(request, course_id, announcement_id):
    session_id = request.session.get('user_id')
    if session_id is not None:
        user = Users.objects.get(user_id=session_id)

        serializer = CommentSerializer(data=request.data)
        course = Courses.objects.filter(course_id=course_id).first()
        announcement = Announcement.objects.filter(
            Q(announcement_id=announcement_id) & Q(course=course)).first()
        if serializer.is_valid():
            serializer.save(announcement=announcement, user=user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": "You must login first"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['PUT'])
def edit_comment(request, course_id, announcement_id,  comment_id):

    session_id = request.session.get('user_id')
    if session_id is not None:
        user = Users.objects.get(user_id=session_id)
        lecturer = Lecturer.objects.filter(user=user).first()
        course = Courses.objects.filter(course_id=course_id).first()
        announcement = Announcement.objects.filter(
            Q(announcement_id=announcement_id) & Q(course=course)).first()
        comment = Comment.objects.filter(Q(announcement=announcement) & Q(
            user=user) & Q(comment_id=comment_id)).first()
        serializer = CommentSerializer(
            comment, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": "You must login first"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['DELETE'])
def delete_comment(request, course_id, announcement_id, comment_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    user = Users.objects.get(user_id=session_id)
    if user.role == 'tutor':
        course = Courses.objects.filter(course_id=course_id).first()
        lecturer = Lecturer.objects.filter(user=user).first()
        announcement = Announcement.objects.filter(Q(lecturer=lecturer) & Q(
            course=course) & Q(announcement_id=announcement_id)).first()
        comment = Comment.objects.filter(
            Q(comment_id=comment_id) & Q(user=user) & Q(announcement=announcement)).first()
        if not comment:
            return Response({"message": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)
        comment.delete()
        return Response({"message": "Comment deleted successfully"}, status=status.HTTP_200_OK)
    return Response({"message": "You are not a tutor"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def thread_upvote(request, thread_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    thread = get_object_or_404(Thread, thread_id=thread_id)
    thread.upvotes += 1
    thread.save()
    return Response({"upvote total": f"{thread.upvotes}"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def chat_upvote(request, chat_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    chat = get_object_or_404(Chats, chat_id=chat_id)
    chat.upvotes += 1
    chat.save()
    return Response({"upvote total": f"{chat.upvotes}"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def thread_unvote(request, thread_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    thread = get_object_or_404(Thread, thread_id=thread_id)
    thread.upvotes -= 1 if thread.upvotes > 0 else 0
    thread.save()
    return Response({"upvote total": f"{thread.upvotes}"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def chat_unvote(request, chat_id):
    session_id = request.session.get('user_id')
    if session_id is None:
        return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    chat = get_object_or_404(Chats, chat_id=chat_id)
    chat.upvotes -= 1 if chat.upvotes > 0 else 0
    chat.save()
    return Response({"upvote total": f"{chat.upvotes}"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def course_detail_view(request, course_id):
    course = get_object_or_404(Courses, course_id=course_id)
    lecturer = {
        "lecturer_id": course.lecturer.lecturer_id,
        "name": f"{course.lecturer.user.first_name} {course.lecturer.user.last_name}",
        "department": course.lecturer.department
    }

    resources = [
        {
            "resource_id": resource.resource_id,
            "resource_name": resource.resource_name,
            "upload_date": resource.upload_date.strftime("%Y-%m-%d")
        }
        for resource in Course_Resources.objects.filter(course=course)
    ]

    enrollments = [
        {
            "student": {
                "student_id": enrollment.student.student_id,
                "name": f"{enrollment.student.user.first_name} {enrollment.student.user.last_name}",
                "student_number": str(enrollment.student.student_number)
            },
            "semester": enrollment.semester,
            "year": enrollment.year,
            "grade": enrollment.grade
        }
        for enrollment in Enrollments.objects.filter(course_id=course_id)
    ]

    response_data = {
        "course": {
            "course_id": course.course_id,
            "course_name": course.course_name,
            "course_code": course.course_code,
            "lecturer": lecturer,
            "resources": resources,
            "enrollments": enrollments
        }
    }

    return JsonResponse(response_data)
