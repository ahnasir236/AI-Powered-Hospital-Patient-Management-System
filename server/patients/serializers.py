from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()

    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'first_name', 'last_name',
            'full_name', 'age', 'date_of_birth', 'gender',
            'blood_group', 'nid_number', 'phone',
            'emergency_contact', 'address', 'district',
            'allergies', 'chronic_conditions',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'patient_id', 'created_at', 'updated_at']


class PatientListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()

    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'full_name',
            'age', 'gender', 'blood_group',
            'phone', 'district', 'is_active',
        ]