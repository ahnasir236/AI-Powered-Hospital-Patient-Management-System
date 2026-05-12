from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/prescriptions/', include('prescriptions.urls')),
    path('api/lab/', include('lab.urls')),
]