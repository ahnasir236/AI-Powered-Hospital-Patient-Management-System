from rest_framework import serializers
from .models import Department, Doctor, Appointment
from patients.serializers import PatientListSerializer


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'is_active']


class DoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            'id', 'full_name', 'department', 'department_name',
            'specialization', 'qualification',
            'consultation_fee', 'available_days', 'is_active'
        ]

    def get_full_name(self, obj):
        return f"Dr. {obj.user.get_full_name() or obj.user.username}"

    def get_department_name(self, obj):
        return obj.department.name if obj.department else ''


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name',
            'doctor', 'doctor_name',
            'department', 'department_name',
            'scheduled_at', 'status', 'appointment_type',
            'symptoms', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_patient_name(self, obj):
        return obj.patient.full_name

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"

    def get_department_name(self, obj):
        return obj.department.name