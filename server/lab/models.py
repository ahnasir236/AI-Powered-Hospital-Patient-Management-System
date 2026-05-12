from django.db import models
import uuid
from patients.models import Patient
from authentication.models import User
from appointments.models import Doctor


class LabTest(models.Model):
    """Available lab tests catalogue"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    turnaround_hours = models.PositiveIntegerField(default=24)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} — {self.name}"


class LabOrder(models.Model):
    STATUS_CHOICES = [
        ('ORDERED', 'Ordered'),
        ('SAMPLE_COLLECTED', 'Sample Collected'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='lab_orders')
    doctor = models.ForeignKey(Doctor, on_delete=models.PROTECT, related_name='lab_orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ORDERED')
    notes = models.TextField(blank=True)
    ordered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    ordered_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-ordered_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            from datetime import date
            year = date.today().year
            count = LabOrder.objects.filter(ordered_at__year=year).count() + 1
            self.order_number = f"LAB-{year}-{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_number} — {self.patient}"


class LabOrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(LabOrder, on_delete=models.CASCADE, related_name='items')
    test = models.ForeignKey(LabTest, on_delete=models.PROTECT)
    result = models.TextField(blank=True)
    result_file = models.CharField(max_length=500, blank=True)
    normal_range = models.CharField(max_length=200, blank=True)
    is_abnormal = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.test.name} — {self.order.order_number}"