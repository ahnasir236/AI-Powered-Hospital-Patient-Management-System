from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Department, Doctor, Appointment
from .serializers import DepartmentSerializer, DoctorSerializer, AppointmentSerializer


class DepartmentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        departments = Department.objects.filter(is_active=True)
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DoctorListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        department_id = request.query_params.get('department', None)
        if department_id:
            doctors = Doctor.objects.filter(
                department_id=department_id,
                is_active=True
            )
        else:
            doctors = Doctor.objects.filter(is_active=True)
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data)

    def post(self, request):
        from authentication.models import User
        user_id = request.data.get('user_id')
        department_id = request.data.get('department_id')
        try:
            user = User.objects.get(id=user_id)
            department = Department.objects.get(id=department_id)
        except (User.DoesNotExist, Department.DoesNotExist):
            return Response(
                {'error': 'User or Department not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        doctor = Doctor.objects.create(
            user=user,
            department=department,
            specialization=request.data.get('specialization', ''),
            qualification=request.data.get('qualification', ''),
            license_number=request.data.get('license_number', ''),
            consultation_fee=request.data.get('consultation_fee', 0),
            available_days=request.data.get('available_days', 'Mon,Tue,Wed,Thu,Fri'),
        )
        serializer = DoctorSerializer(doctor)
        return Response({
            'doctor': serializer.data,
            'message': 'Doctor created successfully.'
        }, status=status.HTTP_201_CREATED)


class AppointmentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Filter by date if provided
        date = request.query_params.get('date', None)
        doctor_id = request.query_params.get('doctor', None)
        status_filter = request.query_params.get('status', None)

        appointments = Appointment.objects.all()

        if date:
            appointments = appointments.filter(scheduled_at__date=date)
        if doctor_id:
            appointments = appointments.filter(doctor_id=doctor_id)
        if status_filter:
            appointments = appointments.filter(status=status_filter)

        serializer = AppointmentSerializer(appointments, many=True)
        return Response({
            'count': appointments.count(),
            'results': serializer.data
        })

    def post(self, request):
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response({
                'appointment': serializer.data,
                'message': 'Appointment booked successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AppointmentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return None

    def get(self, request, pk):
        appointment = self.get_object(pk)
        if not appointment:
            return Response(
                {'error': 'Appointment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)

    def put(self, request, pk):
        appointment = self.get_object(pk)
        if not appointment:
            return Response(
                {'error': 'Appointment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = AppointmentSerializer(
            appointment, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'appointment': serializer.data,
                'message': 'Appointment updated successfully.'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TodayAppointmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        appointments = Appointment.objects.filter(
            scheduled_at__date=today
        )
        serializer = AppointmentSerializer(appointments, many=True)
        return Response({
            'date': today,
            'count': appointments.count(),
            'results': serializer.data
        })