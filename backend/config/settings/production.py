# config/settings/production.py

from .base import *  # noqa: F401,F403
from decouple import config  # noqa: F811
from datetime import timedelta  # noqa: F811
import dj_database_url

# =============================================================================
# Security — Production Hardening
# =============================================================================

DEBUG = False

SECRET_KEY = config("DJANGO_SECRET_KEY")

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="").split(",")

# HTTPS / TLS
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
# Whitenoise: don't crash collectstatic over a missing vendored .js.map
# source-map file — those are optional debugging aids, not required assets.
WHITENOISE_MANIFEST_STRICT = False

# Session cookies
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

# CSRF
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"

# =============================================================================
# Database
# =============================================================================

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": config("DB_NAME"),
#         "USER": config("DB_USER"),
#         "PASSWORD": config("DB_PASSWORD"),
#         "HOST": config("DB_HOST"),
#         "PORT": config("DB_PORT", default="5432"),
#         "OPTIONS": {
#             "sslmode": "require",
#         },
#         "CONN_MAX_AGE": 60,
#         "CONN_HEALTH_CHECKS": True,
#     }
# }
DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URL",
        conn_max_age=60,
        conn_health_checks=True,
        ssl_require=True,
    )
}

# =============================================================================
# CORS — only the production frontend
# =============================================================================

# =============================================================================
# LangChain / LangGraph — RAG vector store & checkpoint database
# =============================================================================

PGVECTOR_CONNECTION_STRING = config("PGVECTOR_CONNECTION_STRING")

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="").split(",")

CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", default="").split(",")

# =============================================================================
# REST Framework — production overrides
# =============================================================================

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "accounts.services.auth.CustomJWTCookieAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "50/minute",
        "user": "200/minute",
        "login": "10/minute",
    },
}

# =============================================================================
# SimpleJWT — production settings
# =============================================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    # Cookie settings — secure in production
    "AUTH_COOKIE": "access_token",
    "AUTH_COOKIE_REFRESH": "refresh_token",
    "AUTH_COOKIE_SECURE": True,  # HTTPS only
    "AUTH_COOKIE_HTTP_ONLY": True,
    "AUTH_COOKIE_SAMESITE": "Lax",
    "AUTH_COOKIE_ACCESS_MAX_AGE": 300,
    "AUTH_COOKIE_REFRESH_MAX_AGE": 86400,
}

# =============================================================================
# Admin
# =============================================================================

ADMIN_URL = config("DJANGO_ADMIN_URL", default="chatbot-admin/")

# =============================================================================
# Celery — production Redis
# =============================================================================

CELERY_BROKER_URL = config("CELERY_BROKER_URL")
CELERY_RESULT_BACKEND = config("CELERY_RESULT_BACKEND")

CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"

CELERY_BROKER_TRANSPORT_OPTIONS = {
    "visibility_timeout": 3600,
    "max_retries": 3,
}

CELERY_RESULT_BACKEND_TRANSPORT_OPTIONS = {
    "retry_policy": {
        "timeout": 5.0,
        "max_retries": 3,
    }
}
# =============================================================================
# Caching — Upstash only supports database 0, override base.py's db=1 setting
# =============================================================================

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": config("REDIS_URL"),
        "OPTIONS": {
            "socket_timeout": 5,
            "socket_connect_timeout": 5,
            "retry_on_timeout": True,
            "max_connections": 100,
        },
        "KEY_PREFIX": "nlp_playground",
    },
}
# =============================================================================
# Logging — production
# =============================================================================

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} [{name}] {message}",
            "style": "{",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
            "level": "WARNING",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        "accounts": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
    },
}
