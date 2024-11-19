from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),  # Home page URL
    # other URLs...


    # BASIC AUTHENTICATION, REGISTRATION AND LOGOUT
    path('register', views.register, name='api_register'),
    path('reset_password', views.reset_password, name='api_reset_password'),
    path('reset_token/<str:token>', views.reset_token, name='api_reset_token'),
    path('login', views.CustomTokenObtainPairView.as_view(), name='api_login'),
    path('logout', views.logout, name='api_logout'),

    # GET LIST OF ITEMS AND RESOURCES OR CREATE THEM
    path('users', views.UserListView.as_view(),
         name='api_users'),
    path('user/<int:user_id>', views.UserIdView.as_view(), name='api_user_by_id'),
    path('students', views.StudentListView.as_view(), name='api_students'),
    path('lecturers', views.LecturerListView.as_view(), name='api_lecturers'),

    # EDIT OR DELETE USER
    path('user', views.UserEditView.as_view(), name='api_edit_view'),
    # EDIT PROFILE IMAGE
    path('profileimage', views.edit_user_image, name='api_edit_user_image'),


    # -------------------------------GET-------------------------------------------
    # Course
    path('courses', views.CoursesListView.as_view(), name='api_courses'),

    path('available_courses', views.AvailableCoursesView.as_view(),
         name='api_available_courses'),

    # Lectures
    path("course/<int:course_id>/lectures",
         views.course_lectures, name="course_lectures"),
    path("course/<int:course_id>/lecture/<int:lecture_id>",
         views.course_lecture_by_id, name="course_lectures_byid"),

    # Lecture Resources
    path('course/<int:course_id>/lecture/<int:lecture_id>/resource/<int:resource_id>',  # GET:
         views.resource_by_lecture, name='api_resource_of_lecture'),
    path('course/<int:course_id>/lecture/<int:lecture_id>/resources',   # GET
         views.all_resources_by_lecture, name='api_resources_of_lecture'),

    # ------------------------------- POST-----------------------------------------------
    # Course
    path('courses/create', views.CoursesCreateView.as_view(),
         name='api_create_courses'),

    # Chapter
    path("course/<int:course_id>/chapter",
         views.create_chapter, name="create_course_chapter"),

    # Lectures
    path("course/<int:course_id>/chapter/<int:chapter_id>/lecture",
         views.create_lecture, name="create_course_lectures"),

    # Lecture Resources
    path('course/<int:course_id>/lecture/<int:lecture_id>/resource',   # GET
         views.create_resource_by_lecture, name='create_resources_of_lecture'),

    # -----------------------------------PUT-------------------------------------------
    # Course
    path('courses/<int:course_id>/edit',
         views.CoursesEditDeleteView.as_view(), name='api_create_courses'),

    # Chapter
    path("course/<int:course_id>/chapter/<int:chapter_id>",  # ✅
         views.edit_chapter, name="edit_course_chapter"),

    # Lectures
    path("course/<int:course_id>/chapter/<int:chapter_id>/lecture/<int:lecture_id>",  # ✅
         views.edit_lecture, name="edit_course_lectures"),

    # Lecture Resources
    path('course/<int:course_id>/chapter/<int:chapter_id>/lectures/<int:lecture_id>/resources/<int:resource_id>',  # ✅  # GET
         views.edit_resource_by_lecture, name='edit_resources_of_lecture'),

    # ----------------------------------DELETE-------------------------------------------------------
    # Course
    path('courses/<int:course_id>',
         views.CoursesEditDeleteView.as_view(), name='api_create_courses'),

    # Chapter
    path("course/<int:course_id>/chapter/<int:chapter_id>",  # ✅
         views.delete_chapter, name="delete_course_chapter"),


    # Lectures
    path("course/<int:course_id>/chapter/<int:chapter_id>/lecture/<int:lecture_id>",  # ✅
         views.delete_lecture, name="delete_course_lectures"),

    # Lecture Resources
    path('course/<int:course_id>/chapter/<int:chapter_id>/lecture/<int:lecture_id>/resource/<int:resource_id>',  # ✅  # GET
         views.delete_resource_by_lecture, name='delete_resources_of_lecture'),


    path('facial_recognitions',
         views.FacialRecognitionListView.as_view(), name='api_facial_recognitions'),
    #     path('chats/', views.ChatListView.as_view()),

    # ---------------------------------CREATE AND DELETE------------------------------
    # Enrollment Endpoints
    path('enrollments', views.EnrollmentListView.as_view(), name='api_enrollments'),
    path('enrollment/student/<int:course_id>',
         views.EnrollmentForStudentView.as_view(), name='api_student_enrollments'),  # ✅
    path('enrollment/lecturer/<int:course_id>/<int:student_id>',
         views.EnrollmentForLecturerView.as_view(), name='api_lecturer_enrollments'),  # ✅

    #     path("course/details/<int:course_id>",
    #          # GET: View details for a particular course
    #          views.course_detail_view, name="course_detail_view"),

    # CHATS, THREADS AND FORUMS ENDPOINTS. CREATE GET, OR DELETE THEM

    # -----------------------------------------------GET-----------------------------------------------
    # Forums
    path("course/<int:course_id>/lecture/<int:lecture_id>/forums",  # ✅
         # GET: View all forums for a particular course
         views.forums_by_lecture, name="forums_by_lecture"),
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>",  # ✅
         # GET: View a particular forum for a particular course
         views.forum_by_lecture, name="forum_by_lecture"),

    # Threads
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>/threads",
         # GET: threads for a forum of a course
         views.threads_in_forum_by_lecture, name="thread_in_forum_by_lecture"),  # ✅
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>/thread/<int:thread_id>",
         # GET: threads for a forum of a course
         views.thread_in_forum_by_lecture, name="thread_in_forum_by_lecture"),  # ✅

    # Chats in threads
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>",  # ✅
         # GET: View all forums for a particular lecture
         views.chats_in_forum_by_lecture, name="chats_in_forum_by_lecture"),
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>/chat/<int:chat_id>",  # ✅
         views.chat_in_forum_by_lecture, name="chat_in_forum_by_lecture"),

    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>/threads/<int:thread_id>/chats",  # ✅
         # GET: View all forums for a particular course
         views.chats_in_thread_by_forum, name="chats_in_thread_by_forum"),
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>/threads/<int:thread_id>/chat/<int:chat_id>",  # ✅
         views.chat_in_thread_by_forum, name="chat_in_thread_by_forum"),

    # Announcements and Comments in announcements
    path("course/<int:course_id>/announcements",
         views.announcements, name="announcements"),
    path("course/<int:course_id>/announcement/<int:announcement_id>",
         views.announcement_by_id, name="announcement_by_id"),
    path("course/<int:course_id>/announcement/<int:announcement_id>/comments",
         views.comments, name="comments"),
    path("course/<int:course_id>/announcement/<int:announcement_id>/comment/<int:comment_id>",
         views.comment_by_id, name="comment_by_id"),

    # Upvotes for Threads and Chats
    path("thread/<int:thread_id>/vote",
         views.thread_vote, name="thread_vote"),  # ✅
    path("thread/<int:thread_id>/chat/<int:chat_id>/vote",
         views.chat_vote, name="chat_vote"),  # ✅


    # -------------------------------------POST-----------------------------------------------
    # Forum
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum",  # ✅
         views.create_forum, name="create_forum"),  # ✅

    # Threads
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>/thread",
         views.create_thread, name="create_thread"),  # ✅

    # Chats in threads
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>/thread/<int:thread_id>/chat",
         views.create_chat, name="create_chat"),  # ✅

    # Announcements and Comments in announcements
    path("course/<int:course_id>/announcement",
         views.create_announcement, name="create_announcement"),
    path("course/<int:course_id>/announcement/<int:announcement_id>/comment",
         views.create_comment, name="create_comment"),


    # ------------------------------------PUT-------------------------------------------------------
    # Forum
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>",  # ✅
         views.edit_forum, name="edit_forum"),  # ✅

    # Threads
    path("course/<int:course_id>/forum/<int:forum_id>/thread/<int:thread_id>",
         views.edit_thread, name="edit_thread"),

    # Chats in threads
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>/thread/<int:thread_id>/chat/<int:chat_id>",
         views.edit_chat, name="edit_chat"),  # ✅

    # Announcements and Comments in announcements
    path("course/<int:course_id>/announcement/<int:announcement_id>/edit",
         views.edit_announcement, name="edit_announcement"),
    path("course/<int:course_id>/announcement/<int:announcement_id>/comment/<int:comment_id>/edit",
         views.edit_comment, name="edit_comment"),

    # --------------------------------------DELETE-----------------------------------------------------
    # Forum
    path("course/<int:course_id>/forum/<int:forum_id>",  # ✅
         views.delete_forum, name="delete_forum"),

    # Threads
    path("course/<int:course_id>/forum/<int:forum_id>/thread/<int:thread_id>",
         views.delete_thread, name="delete_thread"),  # ✅

    # Chats in threads
    path("course/<int:course_id>/lecture/<int:lecture_id>/forum/<int:forum_id>/thread/<int:thread_id>/chat/<int:chat_id>",
         views.delete_chat, name="delete_chat"),  # ✅

    # Announcements and Comments in announcements
    path("course/<int:course_id>/announcement/<int:announcement_id>/delete",
         views.delete_announcement, name="edit_announcement"),
    path("course/<int:course_id>/announcement/<int:announcement_id>/comment/<int:comment_id>/delete",
         views.delete_comment, name="delete_comment"),
]
