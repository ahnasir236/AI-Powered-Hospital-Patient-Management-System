from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Prescription
from .serializers import PrescriptionSerializer, PrescriptionListSerializer


class PrescriptionListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        patient_id = request.query_params.get('patient', None)
        prescriptions = Prescription.objects.all()
        if patient_id:
            prescriptions = prescriptions.filter(patient_id=patient_id)
        serializer = PrescriptionListSerializer(prescriptions, many=True)
        return Response({
            'count': prescriptions.count(),
            'results': serializer.data
        })

    def post(self, request):
        serializer = PrescriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'prescription': serializer.data,
                'message': 'Prescription created successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PrescriptionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return Prescription.objects.get(pk=pk)
        except Prescription.DoesNotExist:
            return None

    def get(self, request, pk):
        prescription = self.get_object(pk)
        if not prescription:
            return Response(
                {'error': 'Prescription not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PrescriptionSerializer(prescription)
        return Response(serializer.data)