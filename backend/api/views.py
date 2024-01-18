from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from scapy.all import sniff, IP
from collections import Counter
from .models import IPAddress
def bonjour(request):
    return JsonResponse({'message': 'Bonjour'})


@csrf_exempt  # Ignorer la protection CSRF pour cette démo (à utiliser avec prudence en production)
def capture_packets(request):
    ip_counter = Counter()
    protocol_counter = Counter()

    def packet_callback(packet):
        
        if IP in packet:
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
            protocol = packet[IP].proto

            ip_counter.update([src_ip, dst_ip])

            if protocol == 6:
                protocol_counter.update(['TCP'])
            elif protocol == 17:
                protocol_counter.update(['UDP'])

            IPAddress.objects.create(
                source_ip=src_ip,
                destination_ip=dst_ip,
                protocol=protocol
            )
            print(f"IP Source: {src_ip}, IP Destination: {dst_ip}, Protocol: {protocol}")

            
            # response_data = {
            #     'ip_stats': src_ip,
            #     'protocol_stats': protocol
            # } 
            # return JsonResponse({'message': 'Bonjour'})
            # return JsonResponse(response_data)

    # Capturer les paquets pendant une courte période
    sniff(prn=packet_callback, store=0)
    # return JsonResponse(response_data)

    # Créer un dictionnaire avec les adresses IP les plus fréquemment contactées
    ip_stats = {ip: count for ip, count in ip_counter.most_common(5)}

    # Créer un dictionnaire avec les types de protocoles utilisés
    protocol_stats = {protocol: count for protocol, count in protocol_counter.items()}

    # Retourner les statistiques sous forme de réponse JSON
    response_data = {
        'ip_stats': ip_stats,
        'protocol_stats': protocol_stats
    }

    return JsonResponse(response_data)