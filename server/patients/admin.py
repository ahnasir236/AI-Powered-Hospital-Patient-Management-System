from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = [
        'patient_id', 'full_name', 'age',
        'gender', 'phone', 'district', 'is_active'
    ]
    list_filter = ['gender', 'blood_group', 'district', 'is_active']
    search_fields = ['first_name', 'last_name', 'patient_id', 'phone', 'nid_number']
    readonly_fields = ['patient_id', 'created_at', 'updated_at']