from channels.routing import ProtocolTypeRouter, URLRouter
from api.consumers import PacketConsumer
from django.urls import re_path
websocket_urlpatterns = [
    re_path(r'ws/packet_info/$', PacketConsumer.as_asgi()),
]