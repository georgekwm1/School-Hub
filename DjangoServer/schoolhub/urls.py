"""
URL configuration for schoolhub project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from .views import main_home_view
from api import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', main_home_view, name='main_home'),  # HTML homepage

    # Authentication Endpoints
    path('auth/', include('authentication.urls')),
    path('lecturer/', include('tutor.urls', )),
    path('student/', include('student.urls', )),
    path('api/', include('api.urls')),
    path('oauth/', include('social_django.urls', namespace='social')),
    path('auth/google/login/', views.google_login, name='google_login'),
    path('auth/google/callback/',
         views.google_callback, name='google_login')
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)\
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
