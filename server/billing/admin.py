from django.contrib import admin
from .models import Invoice, InvoiceItem


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'patient', 'total', 'status', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['invoice_number', 'patient__first_name', 'patient__last_name']
    inlines = [InvoiceItemInline]