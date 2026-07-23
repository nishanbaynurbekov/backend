from django.urls import path
from .views import register_user, login_user

urlpatterns = [
    path('auth/register', register_user),
    path('auth/login', login_user),
]