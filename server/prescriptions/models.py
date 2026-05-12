from django.db import models
import uuid
from patients.models import Patient
from authentication.models import User
from appointments.models import Doctor


class Prescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.PROTECT, related_name='prescriptions')
    diagnosis = models.TextField()
    advice = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Rx — {self.patient} — {self.created_at.date()}"


class PrescriptionItem(models.Model):
    FREQUENCY_CHOICES = [
        ('OD', 'Once daily'),
        ('BD', 'Twice daily'),
        ('TDS', 'Three times daily'),
        ('QDS', 'Four times daily'),
        ('SOS', 'When needed'),
        ('STAT', 'Immediately'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    medicine_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    duration = models.CharField(max_length=100)
    instructions = models.TextField(blank=True)

    def __str__(self):
        return f"{self.medicine_name} {self.dosage}"