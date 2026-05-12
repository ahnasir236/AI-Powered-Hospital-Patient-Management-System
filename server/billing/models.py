from django.db import models
from patients.models import Patient
from authentication.models import User
import uuid
from datetime import date


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('PARTIAL', 'Partially Paid'),
        ('CANCELLED', 'Cancelled'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('BKASH', 'bKash'),
        ('NAGAD', 'Nagad'),
        ('ROCKET', 'Rocket'),
        ('CARD', 'Card'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='invoices')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            year = date.today().year
            count = Invoice.objects.filter(
                created_at__year=year
            ).count() + 1
            self.invoice_number = f"INV-{year}-{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} — {self.patient}"


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} x{self.quantity}"