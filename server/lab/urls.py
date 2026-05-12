from django.urls import path
from .views import LabTestListView, LabOrderListCreateView, LabOrderDetailView

urlpatterns = [
    path('tests/', LabTestListView.as_view(), name='lab-tests'),
    path('orders/', LabOrderListCreateView.as_view(), name='lab-orders'),
    path('orders/<uuid:pk>/', LabOrderDetailView.as_view(), name='lab-order-detail'),
]