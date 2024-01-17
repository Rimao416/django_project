from django.urls import path
from .views import bonjour
from .views import capture_packets

urlpatterns = [
    path('bonjour/', bonjour, name='bonjour'),
     path('capture_packets/', capture_packets, name='capture_packets'),
]