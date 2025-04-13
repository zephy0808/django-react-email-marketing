from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'clientes', views.ClienteViewSet)
router.register(r'grupos', views.GrupoClienteViewSet)
router.register(r'campanhas', views.CampanhaViewSet)
router.register(r'anexos', views.AnexoViewSet)
router.register(r'emails', views.EmailViewSet)
router.register(r'relatorios', views.RelatorioViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 