from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('delete/', views.delete, name='delete'),
    path('login/', views.login, name='login'),
    path('face/', views.face, name='face'),
    path('me/', views.me, name='me'),
    path('logout/', views.logout, name='logout'),
    path('forgot_password/', views.forgot_password, name='forgot_password'),
    path('reset-password/<str:token>',
         views.reset_password, name='reset_password'),
    path('password_reset_request/', views.password_reset_request,
         name='password_reset_request')

]
