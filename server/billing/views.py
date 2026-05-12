from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Invoice
from .serializers import InvoiceSerializer, InvoiceListSerializer


class InvoiceListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status', None)
        invoices = Invoice.objects.all()
        if status_filter:
            invoices = invoices.filter(status=status_filter)
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response({
            'count': invoices.count(),
            'results': serializer.data
        })

    def post(self, request):
        serializer = InvoiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response({
                'invoice': serializer.data,
                'message': 'Invoice created successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InvoiceDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return None

    def get(self, request, pk):
        invoice = self.get_object(pk)
        if not invoice:
            return Response({'error': 'Invoice not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)

    def put(self, request, pk):
        invoice = self.get_object(pk)
        if not invoice:
            return Response({'error': 'Invoice not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = InvoiceSerializer(invoice, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'invoice': serializer.data, 'message': 'Invoice updated.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CollectPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            invoice = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment_method = request.data.get('payment_method')
        paid_amount = request.data.get('paid_amount')
        transaction_id = request.data.get('transaction_id', '')

        if not payment_method or not paid_amount:
            return Response(
                {'error': 'payment_method and paid_amount are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        invoice.paid_amount = paid_amount
        invoice.payment_method = payment_method
        invoice.transaction_id = transaction_id

        if float(paid_amount) >= float(invoice.total):
            invoice.status = 'PAID'
            invoice.paid_at = timezone.now()
        else:
            invoice.status = 'PARTIAL'

        invoice.save()
        return Response({
            'message': f'Payment of ৳{paid_amount} collected via {payment_method}.',
            'status': invoice.status,
            'invoice_number': invoice.invoice_number,
        })