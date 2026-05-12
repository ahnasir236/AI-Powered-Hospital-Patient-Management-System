from django.contrib import admin
from .models import Department, Doctor, Appointment

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active']
    search_fields = ['name', 'code']

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'department', 'consultation_fee', 'is_active']
    list_filter = ['department', 'is_active']

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'department', 'scheduled_at', 'status']
    list_filter = ['status', 'appointment_type', 'department']
    search_fields = ['patient__first_name', 'patient__last_name']