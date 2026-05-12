from django.urls import path
from .views import (
    DepartmentListView,
    DoctorListView,
    AppointmentListCreateView,
    AppointmentDetailView,
    TodayAppointmentsView,
)

urlpatterns = [
    path('departments/', DepartmentListView.as_view(), name='departments'),
    path('doctors/', DoctorListView.as_view(), name='doctors'),
    path('', AppointmentListCreateView.as_view(), name='appointment-list'),
    path('<uuid:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('today/', TodayAppointmentsView.as_view(), name='today-appointments'),
]