from rest_framework import serializers
from .models import Prescription, PrescriptionItem


class PrescriptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionItem
        fields = ['id', 'medicine_name', 'dosage', 'frequency', 'duration', 'instructions']


class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'diagnosis', 'advice', 'follow_up_date',
            'items', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_patient_name(self, obj):
        return obj.patient.full_name

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        prescription = Prescription.objects.create(**validated_data)
        for item_data in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item_data)
        return prescription


class PrescriptionListSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = [
            'id', 'patient_name', 'doctor_name',
            'diagnosis', 'follow_up_date',
            'item_count', 'created_at',
        ]

    def get_patient_name(self, obj):
        return obj.patient.full_name

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"

    def get_item_count(self, obj):
        return obj.items.count()