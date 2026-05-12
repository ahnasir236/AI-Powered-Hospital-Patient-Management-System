from rest_framework import serializers
from .models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['total_price']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'patient', 'patient_name',
            'status', 'subtotal', 'discount', 'tax', 'total',
            'paid_amount', 'payment_method', 'transaction_id',
            'notes', 'items', 'created_at', 'paid_at',
        ]
        read_only_fields = ['id', 'invoice_number', 'created_at']

    def get_patient_name(self, obj):
        return obj.patient.full_name

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = Invoice.objects.create(**validated_data)
        subtotal = 0
        for item_data in items_data:
            item = InvoiceItem.objects.create(invoice=invoice, **item_data)
            subtotal += item.total_price
        invoice.subtotal = subtotal
        invoice.total = subtotal - invoice.discount + invoice.tax
        invoice.save()
        return invoice


class InvoiceListSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'patient_name',
            'status', 'total', 'paid_amount',
            'payment_method', 'created_at',
        ]

    def get_patient_name(self, obj):
        return obj.patient.full_name