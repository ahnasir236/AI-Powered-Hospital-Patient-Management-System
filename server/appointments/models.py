from django.db import models
import uuid
from patients.models import Patient
from authentication.models import User


class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Doctor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='doctors')
    specialization = models.CharField(max_length=200)
    qualification = models.CharField(max_length=200)
    license_number = models.CharField(max_length=50, unique=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    available_days = models.CharField(max_length=100, default='Mon,Tue,Wed,Thu,Fri')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} — {self.specialization}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('CONFIRMED', 'Confirmed'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('NO_SHOW', 'No Show'),
    ]
    TYPE_CHOICES = [
        ('OPD', 'Outpatient (OPD)'),
        ('FOLLOW_UP', 'Follow Up'),
        ('EMERGENCY', 'Emergency'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.PROTECT, related_name='appointments')
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='appointments')
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    appointment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='OPD')
    symptoms = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_appointments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"{self.patient} — Dr. {self.doctor.user.get_full_name()} — {self.scheduled_at.date()}"