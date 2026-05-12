from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Patient
from .serializers import PatientSerializer, PatientListSerializer


class PatientListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '')
        all_patients = request.query_params.get('all', False)

        if search:
            patients = Patient.objects.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(patient_id__icontains=search) |
                Q(phone__icontains=search) |
                Q(nid_number__icontains=search)
            )
        else:
            patients = Patient.objects.filter(is_active=True)

        serializer = PatientListSerializer(patients, many=True)

        # If all=true, return simple list without pagination wrapper
        if all_patients:
            return Response(serializer.data)

        return Response({
            'count': patients.count(),
            'results': serializer.data
        })

    def post(self, request):
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'patient': serializer.data,
                'message': 'Patient registered successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return Patient.objects.get(pk=pk)
        except Patient.DoesNotExist:
            return None

    def get(self, request, pk):
        patient = self.get_object(pk)
        if not patient:
            return Response(
                {'error': 'Patient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    def put(self, request, pk):
        patient = self.get_object(pk)
        if not patient:
            return Response(
                {'error': 'Patient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PatientSerializer(patient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'patient': serializer.data,
                'message': 'Patient updated successfully.'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        patient = self.get_object(pk)
        if not patient:
            return Response(
                {'error': 'Patient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        patient.is_active = False
        patient.save()
        return Response(
            {'message': 'Patient deactivated successfully.'},
            status=status.HTTP_200_OK
        )