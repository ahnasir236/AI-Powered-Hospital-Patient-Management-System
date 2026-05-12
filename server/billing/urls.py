from django.urls import path
from .views import InvoiceListCreateView, InvoiceDetailView, CollectPaymentView

urlpatterns = [
    path('', InvoiceListCreateView.as_view(), name='invoice-list'),
    path('<uuid:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('<uuid:pk>/pay/', CollectPaymentView.as_view(), name='collect-payment'),
]