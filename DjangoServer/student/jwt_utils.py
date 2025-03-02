from rest_framework_simplejwt.settings import api_settings
from datetime import datetime, timedelta
from django.utils import timezone


def custom_jwt_payload_handler(user):
    # Create the payload with `user_id` as the identifier
    return {
        'user_id': user.user_id,
        'email': user.email,
        'exp': timezone.now() + api_settings.ACCESS_TOKEN_LIFETIME,
        'iat': timezone.now(),
    }
