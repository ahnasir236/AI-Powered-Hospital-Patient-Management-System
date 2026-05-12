from django.db import models
import uuid
from datetime import date


class Patient(models.Model):
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('O+', 'O+'), ('O-', 'O-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
    ]
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.CharField(max_length=20, unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True)
    nid_number = models.CharField(max_length=20, blank=True, db_index=True)
    phone = models.CharField(max_length=15)
    emergency_contact = models.CharField(max_length=15, blank=True)
    address = models.TextField()
    district = models.CharField(max_length=100)
    allergies = models.TextField(blank=True)
    chronic_conditions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.patient_id:
            year = date.today().year
            count = Patient.objects.filter(
                created_at__year=year
            ).count() + 1
            self.patient_id = f"P-{year}-{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient_id} — {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        today = date.today()
        born = self.date_of_birth
        return today.year - born.year - (
                (today.month, today.day) < (born.month, born.day)
        )