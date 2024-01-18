# Create your models here.
from django.db import models

class IPAddress(models.Model):
    source_ip = models.GenericIPAddressField()
    destination_ip = models.GenericIPAddressField()
    protocol = models.PositiveIntegerField()