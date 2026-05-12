from rest_framework import serializers
from .models import LabTest, LabOrder, LabOrderItem


class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = ['id', 'name', 'code', 'description', 'price', 'turnaround_hours', 'is_active']


class LabOrderItemSerializer(serializers.ModelSerializer):
    test_name = serializers.SerializerMethodField()
    test_code = serializers.SerializerMethodField()
    test_price = serializers.SerializerMethodField()

    class Meta:
        model = LabOrderItem
        fields = ['id', 'test', 'test_name', 'test_code', 'test_price',
                  'result', 'normal_range', 'is_abnormal', 'completed_at']

    def get_test_name(self, obj): return obj.test.name
    def get_test_code(self, obj): return obj.test.code
    def get_test_price(self, obj): return str(obj.test.price)


class LabOrderSerializer(serializers.ModelSerializer):
    items = LabOrderItemSerializer(many=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = LabOrder
        fields = ['id', 'order_number', 'patient', 'patient_name',
                  'doctor', 'doctor_name', 'status', 'notes',
                  'items', 'ordered_at', 'completed_at']
        read_only_fields = ['id', 'order_number', 'ordered_at']

    def get_patient_name(self, obj): return obj.patient.full_name
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = LabOrder.objects.create(**validated_data)
        for item_data in items_data:
            LabOrderItem.objects.create(order=order, **item_data)
        return order


class LabOrderListSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    test_count = serializers.SerializerMethodField()

    class Meta:
        model = LabOrder
        fields = ['id', 'order_number', 'patient_name', 'doctor_name',
                  'status', 'test_count', 'ordered_at']

    def get_patient_name(self, obj): return obj.patient.full_name
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"
    def get_test_count(self, obj): return obj.items.count()