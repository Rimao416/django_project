from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from scapy.all import sniff, IP
from collections import Counter
def bonjour(request):
    return JsonResponse({'message': 'Bonjour'})


import asyncio
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from scapy.all import sniff, IP
from collections import Counter

def bonjour(request):
    return JsonResponse({'message': 'Bonjour'})

@csrf_exempt
def capture_packets(request):
    ip_counter = Counter()
    protocol_counter = Counter()

    def packet_callback(packet):
        nonlocal ip_counter, protocol_counter

        if IP in packet:
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
            protocol = packet[IP].proto

            ip_counter.update([src_ip, dst_ip])

            if protocol == 6:
                protocol_counter.update(['TCP'])
            elif protocol == 17:
                protocol_counter.update(['UDP'])

            # Envoyer les informations du paquet via WebSocket
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'packet_group',
                {
                    'type': 'send.packet_info',
                    'packet_info': f"IP Source: {src_ip}, IP Destination: {dst_ip}, Protocol: {protocol}",
                }
            )

    # Capturer les paquets pendant une courte période
    asyncio.create_task(sniff_async(packet_callback))

    # Retourner une réponse JSON (tu peux ajuster cela en fonction de tes besoins)
    return JsonResponse({'message': 'Capture en cours'})

async def sniff_async(callback):
    # Capturer les paquets pendant une courte période
    sniff(prn=callback, store=0)