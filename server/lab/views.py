from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import LabTest, LabOrder
from .serializers import LabTestSerializer, LabOrderSerializer, LabOrderListSerializer


class LabTestListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tests = LabTest.objects.filter(is_active=True)
        serializer = LabTestSerializer(tests, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = LabTestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LabOrderListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status', None)
        orders = LabOrder.objects.all()
        if status_filter:
            orders = orders.filter(status=status_filter)
        serializer = LabOrderListSerializer(orders, many=True)
        return Response({'count': orders.count(), 'results': serializer.data})

    def post(self, request):
        serializer = LabOrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(ordered_by=request.user)
            return Response({
                'order': serializer.data,
                'message': 'Lab order created successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LabOrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return LabOrder.objects.get(pk=pk)
        except LabOrder.DoesNotExist:
            return None

    def get(self, request, pk):
        order = self.get_object(pk)
        if not order:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = LabOrderSerializer(order)
        return Response(serializer.data)

    def put(self, request, pk):
        order = self.get_object(pk)
        if not order:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            if new_status == 'COMPLETED':
                order.completed_at = timezone.now()
            order.save()
        return Response({'message': f'Order status updated to {new_status}.', 'status': order.status})