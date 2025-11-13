from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    # path('api/', include('tu_app.urls')),  # Agrega tus rutas de API aquí
]


if settings.TEMPLATES[0]['DIRS']:
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='frontend'),
    ]

# Servir media y estáticos en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    if settings.STATICFILES_DIRS:
        urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])