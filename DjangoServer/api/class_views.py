from django.views.decorators.csrf import ensure_csrf_cookie
import requests
import secrets
import logging
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.backends import ModelBackend
from rest_framework.decorators import action, api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q
from .models import *
from schoolhub.passkeys import IMAGE_KIT_AUTH


class CustomJWTAuthentication(JWTAuthentication):
    def has_permission(
            self, request, view):
        return request.user.is_authenticated
    # has_permission = True

    def authenticate(self, request):
        # Get token from request header (Authorization: Bearer <token>)
        token = self.get_header(request)
        print(f"Auth Access Token: {token}")
        # Decodes the token from bytes format to string format
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        print(f"Decoded Auth Access Token: {token}")
        if not token:
            raise AuthenticationFailed("No token provided")

        # Removes the "Bearer " prefix from the token
        token = token.split(' ')[-1]
        print(f"New Token: {token}")
        # Check if token is blacklisted
        if BlacklistedToken.objects.filter(token=token).exists():
            raise AuthenticationFailed("Token is blacklisted")

        # Proceed with standard JWT authentication
        return super().authenticate(request)


class UserListView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        user = request.user
        if not user:
            return Response({"detail": "User not authenticated."}, status=401)
        users = Users.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CustomAuthenticationBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = Users.objects.get(email=username)  # Authenticate by email
            if user and user.check_password(password):
                return user
        except Users.DoesNotExist:
            return None


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserIdView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, user_id):
        try:
            user = request.user
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Users.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class UserEditView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def put(self, request):
        user = request.user
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


class CustomLoginTokenObtainPairView(APIView):

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            password = serializer.validated_data.get('password_hash')
            user = Users.objects.filter(email=email).first()
            if user and not check_password(password, user.password_hash):
                return Response({'message': 'Invalid password'}, status=status.HTTP_406_NOT_ACCEPTABLE)
            if user and check_password(password, user.password_hash):
                refresh = RefreshToken.for_user(user)
                # Add custom claims to the token
                refresh['user_id'] = user.user_id
                refresh['first_name'] = user.first_name
                refresh['last_name'] = user.last_name
                refresh['email'] = user.email
                refresh['role'] = user.role
                access_token = str(refresh.access_token)
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
                response_data = {'message': 'Login successful',
                                 'access_token': access_token,
                                 'refresh_token': str(refresh), }
                user_response = {"user": dictList}
                response_data.update(user_response)
                return Response(response_data, status=status.HTTP_200_OK)
            return Response({'message': 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Input Not Valid'}, status=status.HTTP_403_FORBIDDEN)


class StudentListView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        students = Students.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LecturerListView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        lecturer = Lecturer.objects.all()
        serializer = LecturerSerializer(lecturer, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CoursesListView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        courses = Courses.objects.all()
        serializer = CoursesSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CoursesCreateView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request):
        user = request.user
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
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def put(self, request, course_id):
        user = request.user
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
        user = request.user
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
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        course_resources = Course_Resources.objects.all()
        serializer = CoursesResourcesSerializer(course_resources, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        if user.role == 'tutor':
            serializer = CoursesResourcesSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'You are not a tutor'}, status=status.HTTP_403_FORBIDDEN)


class FacialRecognitionListView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

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
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        enrollments = Enrollments.objects.all()
        serializer = EnrollmentsSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EnrollmentForStudentView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, course_id):
        user = request.user
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
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, course_id, student_id):
        user = request.user

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
            student_name = f"{student.user.first_name} {
                student.user.last_name}'s"
            response_data = {
                "message": f"{student_name} enrollment to {course.course_name} has been deleted"}
            return Response(response_data, status=status.HTTP_204_NO_CONTENT)
        return Response({'message': 'Contact the tutor of this course to delete your enrollment'}, status=status.HTTP_403_FORBIDDEN)


class AvailableCoursesView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        user = request.user
        if user.role == 'student':
            student = Students.objects.filter(user=user).first()
            enrollments = Enrollments.objects.filter(student=student)
            course_list = []
            for enrollment in enrollments:
                courses = Courses.objects.filter(
                    course_id=enrollment.course.course_id).first()
                serializer = CoursesSerializer(courses, many=False)
                course_list.append(serializer.data)
            return Response(course_list, status=status.HTTP_200_OK)
        elif user.role == 'tutor':
            lecturer = Lecturer.objects.filter(user=user).first()
            courses = Courses.objects.filter(lecturer=lecturer)
            course_list = []
            for course in courses:
                serializer = CoursesSerializer(course, many=False)
                course_list.append(serializer.data)
            return Response(course_list, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'You are not authorized to view this page'}, status=status.HTTP_403_FORBIDDEN)
