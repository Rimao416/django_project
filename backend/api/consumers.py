import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PacketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def send_packet_info(self, event):
        packet_info = event['packet_info']

        # Envoie les informations du paquet au client via WebSocket
        await self.send(text_data=json.dumps({'packet_info': packet_info}))