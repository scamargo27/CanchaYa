from pathlib import Path
import os
import environ

# Inicializa variables de entorno
env = environ.Env()
environ.Env.read_env()

# BASE_DIR apunta a Backend/core (donde está settings.py)
BASE_DIR = Path(__file__).resolve().parent.parent

# Ruta hacia el build del frontend
# Si tu estructura es: SmartBooking/Backend/core/ y SmartBooking/Frontend/
FRONTEND_BUILD_DIR = BASE_DIR.parent / "Frontend" / "build"

# =============================
# Configuración general
# =============================

SECRET_KEY = os.environ.get('SECRET_KEY', 'unsafe-secret-key')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ["*"]

# =============================
# Aplicaciones instaladas
# =============================

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

PROJECT_APPS = [
    # tus apps aquí
]

THIRD_PARTY_APPS = [
    'corsheaders',
    'rest_framework',
    'ckeditor',
    'ckeditor_uploader',
]

INSTALLED_APPS = DJANGO_APPS + PROJECT_APPS + THIRD_PARTY_APPS

# =============================
# Configuración CKEditor
# =============================

CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'Custom',
        'toolbar_Custom': [
            ['Bold', 'Italic', 'Underline'],
            ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 
             'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
            ['Link', 'Unlink'],
            ['RemoveFormat', 'Source']
        ],
        'autoParagraph': False
    },
}
CKEDITOR_UPLOAD_PATH = "uploads/"
CKEDITOR_BASEPATH = "/static/ckeditor/ckeditor/"

# =============================
# Middleware
# =============================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Movido aquí (después de SecurityMiddleware)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'  # Corregido a 'core' en lugar de 'Ecomarket'

# =============================
# Templates
# =============================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [FRONTEND_BUILD_DIR] if FRONTEND_BUILD_DIR.exists() else [],  # Solo si existe
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'  # Corregido a 'core'

# =============================
# Base de datos
# =============================

DATABASES = {
    "default": env.db("DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}")
}
DATABASES["default"]["ATOMIC_REQUESTS"] = True

# =============================
# Validaciones de contraseña
# =============================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# =============================
# Internacionalización
# =============================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# =============================
# Archivos estáticos / media
# =============================

STATIC_URL = '/static/'

# Solo agregar STATICFILES_DIRS si la carpeta existe
STATICFILES_DIRS = []
if (FRONTEND_BUILD_DIR / "static").exists():
    STATICFILES_DIRS.append(FRONTEND_BUILD_DIR / "static")

STATIC_ROOT = BASE_DIR / "staticfiles"  # Para collectstatic

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / "media"

# WhiteNoise (sirve estáticos en producción)
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# =============================
# Configuración REST y CORS
# =============================

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly',
    ]
}

CORS_ORIGIN_WHITELIST = env.list('CORS_ORIGIN_WHITELIST_DEV', default=[])
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS_DEV', default=[])

# =============================
# Email
# =============================

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# =============================
# Clave primaria por defecto
# =============================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SILENCED_SYSTEM_CHECKS = ['ckeditor.W001']