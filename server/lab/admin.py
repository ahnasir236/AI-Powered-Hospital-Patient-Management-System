from django.contrib import admin
from .models import LabTest, LabOrder, LabOrderItem


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'price', 'turnaround_hours', 'is_active']
    search_fields = ['code', 'name']


class LabOrderItemInline(admin.TabularInline):
    model = LabOrderItem
    extra = 1


@admin.register(LabOrder)
class LabOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'patient', 'doctor', 'status', 'ordered_at']
    list_filter = ['status']
    inlines = [LabOrderItemInline]