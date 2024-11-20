from django.db import models
import uuid
from .managers import UsersManager
from django.contrib.auth.hashers import make_password, check_password as django_check_password

# Create your models here.


class Users(models.Model):

    user_id = models.BigAutoField(auto_created=True, primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=200)
    role = models.CharField(max_length=50)
    pictureId = models.CharField(max_length=50, blank=True, null=True)
    pictureURL = models.URLField(max_length=200, blank=True, null=True)
    pictureThumbnail = models.URLField(max_length=200, blank=True, null=True)
    reset_token = models.CharField(
        max_length=32, blank=True, null=True)  # For password reset
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = 'email'  # Specify the unique field for authentication
    # Optional fields required for creating a superuser
    REQUIRED_FIELDS = ['first_name', 'last_name']
    is_anonymous = False
    is_staff = True
    objects = UsersManager()
    # Custom method to check if the user is authenticated

    @property
    def is_authenticated(self):
        # Indicates that this user is authenticated
        return True

    @property
    def is_superuser(self):
        # Indicates that this user is a superuser
        return True

    def has_perm(self, perm, obj=None):
        # Indicates that this user has all permissions
        return True

    def has_module_perms(self, app_label):
        # Indicates that this user has permissions to access all modules
        return True

    def __str__(self):
        return self.first_name + " " + self.last_name
    # Custom method to set password

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    # Custom method to check password
    def check_password(self, raw_password):
        return django_check_password(raw_password, self.password_hash)


class Lecturer(models.Model):
    lecturer_id = models.BigAutoField(auto_created=True, primary_key=True)
    user = models.OneToOneField(Users, on_delete=models.CASCADE)
    department = models.CharField(max_length=100, null=True, blank=True)
    office_number = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.user.first_name + " " + self.user.last_name


class Students(models.Model):
    student_id = models.BigAutoField(auto_created=True, primary_key=True)
    user = models.OneToOneField(Users, on_delete=models.CASCADE)
    student_number = models.UUIDField(default=uuid.uuid4, editable=False)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=50, null=True, blank=True)
    address = models.CharField(max_length=200, null=True, blank=True)
    phone_number = models.CharField(max_length=50, null=True, blank=True)
    guardian_name = models.CharField(max_length=100, null=True, blank=True)
    guardian_phone_number = models.CharField(
        max_length=50, null=True, blank=True)
    guardian_email = models.EmailField(null=True, blank=True)
    guardian_address = models.CharField(max_length=200, null=True, blank=True)
    enrollment_year = models.DateTimeField(auto_now_add=True)
    program_of_study = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.user.first_name + " " + self.user.last_name


class Courses(models.Model):
    course_id = models.BigAutoField(auto_created=True, primary_key=True)
    course_name = models.CharField(max_length=100)
    course_code = models.CharField(max_length=100, null=True, blank=True)
    course_description = models.TextField(null=True, blank=True)
    course_credit = models.IntegerField(null=True, blank=True)
    course_level = models.CharField(max_length=100, null=True, blank=True)
    course_department = models.CharField(max_length=100, null=True, blank=True)
    lecturer = models.ForeignKey(
        Lecturer, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.course_name}  ({self.course_code})"


class Chapter(models.Model):
    chapter_id = models.BigAutoField(auto_created=True, primary_key=True)
    chapter_name = models.CharField(max_length=100)
    chapter_description = models.TextField(null=True, blank=True)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.chapter_name}"


class Lecture(models.Model):
    lecture_id = models.BigAutoField(auto_created=True, primary_key=True)
    lecture_name = models.CharField(max_length=100)
    lecture_description = models.TextField(null=True, blank=True)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.lecture_name}"


class Course_Resources(models.Model):
    resource_id = models.BigAutoField(auto_created=True, primary_key=True)
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE)
    resource_name = models.CharField(max_length=100)
    resource_file = models.FileField(
        upload_to='course_resources/', null=True, blank=True)
    resource_link = models.URLField(max_length=200, null=True, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.resource_name}  ({self.lecture.lecture_name})"


class Enrollments(models.Model):
    enrollment_id = models.BigAutoField(auto_created=True, primary_key=True)
    student = models.ForeignKey(Students, on_delete=models.CASCADE)
    course_name = models.CharField(max_length=100, null=True, blank=True)
    semester = models.CharField(max_length=50, null=True, blank=True)
    year = models.CharField(max_length=50, null=True, blank=True)
    grade = models.CharField(max_length=50, null=True, blank=True)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE)

    def __str__(self):
        return self.student.user.first_name + " " + self.student.user.last_name + " - " + self.course


class Facial_Recognition(models.Model):
    log_id = models.BigAutoField(auto_created=True, primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='facial_recognition/')
    attempt_time = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)

    def __str__(self):
        return self.user.first_name + " " + self.user.last_name + " - " + str(self.attempt_time)


class Forum(models.Model):
    forum_id = models.BigAutoField(auto_created=True, primary_key=True)
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    thread_counts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(Users, on_delete=models.CASCADE)

    def __str__(self):
        return self.title + " - " + self.lecture.lecture_name


class Thread(models.Model):
    thread_id = models.BigAutoField(auto_created=True, primary_key=True)
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    title = models.CharField(max_length=100,  null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    chat_counts = models.IntegerField(default=0)
    upvotes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title + " - " + self.forum.title


class Chats(models.Model):

    chat_id = models.BigAutoField(auto_created=True, primary_key=True)
    sender = models.ForeignKey(
        Users, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(
        Users, on_delete=models.CASCADE, related_name='receiver', null=True, blank=True)
    thread = models.ForeignKey(
        Thread, on_delete=models.CASCADE, null=True, blank=True)
    upvotes = models.IntegerField(default=0)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sender.first_name + " " + self.sender.last_name + " - " + self.receiver.first_name + " " + self.receiver.last_name


class ThreadVote(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE)
    vote = models.BooleanField(default=False)

    def __str__(self):
        return self.user.first_name + " " + self.user.last_name + " - " + self.thread.title


class ChatVote(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    chat = models.ForeignKey(Chats, on_delete=models.CASCADE)
    vote = models.BooleanField(default=False)

    def __str__(self):
        return self.user.first_name + " " + self.user.last_name + " - " + self.chat.message


class Announcement(models.Model):
    announcement_id = models.BigAutoField(auto_created=True, primary_key=True)
    lecturer = models.ForeignKey(
        Lecturer, on_delete=models.CASCADE, related_name='announcements')
    # assuming a Course model exists
    course = models.ForeignKey(Courses, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Comment(models.Model):
    comment_id = models.BigAutoField(auto_created=True, primary_key=True)
    announcement = models.ForeignKey(
        Announcement, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user} on {self.announcement}"


class BlacklistedToken(models.Model):
    token = models.CharField(max_length=500, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
