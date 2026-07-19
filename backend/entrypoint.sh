# #!/bin/bash

# # Exit on error
# set -e

# echo "🚀 Starting Django backend setup..."

# # Wait for PostgreSQL to be ready
# echo "⏳ Waiting for PostgreSQL to be ready..."
# while ! nc -z $DB_HOST $DB_PORT; do
#   sleep 0.5
# done
# echo "✅ PostgreSQL is ready!"

# # Create migrations if they don't exist
# echo "🔧 Creating migrations..."
# python manage.py makemigrations --noinput || echo "ℹ️  No new migrations to create"

# # Run migrations
# echo "📦 Running database migrations..."
# python manage.py migrate --noinput

# # Create superuser if it doesn't exist
# echo "👤 Checking for superuser..."
# python manage.py shell << END
# from django.contrib.auth import get_user_model
# User = get_user_model()
# if not User.objects.filter(username='admin').exists():
#     User.objects.create_superuser(
#         username='admin',
#         email='admin@aparsoft.com',
#         password='admin123'
#     )
#     print('✅ Superuser created: admin / admin123')
# else:
#     print('ℹ️  Superuser already exists')
# END

# # Collect static files (without input)
# echo "📁 Collecting static files..."
# python manage.py collectstatic --noinput --clear || echo "⚠️  Static files collection skipped"

# echo "🎉 Setup complete! Starting Django server..."
# echo ""
# echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# echo "  Django Admin: http://localhost:8000/chatbot-admin/"
# echo "  Username: admin"
# echo "  Password: admin123"
# echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# echo ""

# # Execute the main command (from Dockerfile CMD or docker-compose command)
# exec "$@"
#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Django backend setup..."

# Wait for PostgreSQL to be ready (pure Python, no 'nc' dependency)
echo "⏳ Waiting for PostgreSQL to be ready..."
python <<'PYEOF'
import os, socket, time
host = os.environ["DB_HOST"]
port = int(os.environ.get("DB_PORT", 5432))
for _ in range(60):
    try:
        with socket.create_connection((host, port), timeout=2):
            break
    except OSError:
        time.sleep(1)
else:
    raise SystemExit("Could not reach database, giving up.")
PYEOF
echo "✅ PostgreSQL is ready!"

# Run migrations (migrations should already be committed to git —
# we do NOT run makemigrations here, only apply what's committed)
echo "📦 Running database migrations..."
python manage.py migrate --noinput

# Optional: create a superuser ONLY if you explicitly provide credentials
# via Railway env vars. Nothing happens if they're unset — no default
# admin/admin123 account gets created on a public deploy.
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ]; then
  echo "👤 Ensuring configured superuser exists..."
  python manage.py shell <<'PYEOF'
from django.contrib.auth import get_user_model
import os
User = get_user_model()
username = os.environ["DJANGO_SUPERUSER_USERNAME"]
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(
        username=username,
        email=os.environ["DJANGO_SUPERUSER_EMAIL"],
        password=os.environ["DJANGO_SUPERUSER_PASSWORD"],
    )
    print(f"✅ Superuser created: {username}")
else:
    print("ℹ️  Superuser already exists")
PYEOF
else
  echo "ℹ️  Skipping superuser creation (DJANGO_SUPERUSER_* env vars not set)"
fi

# Collect static files (without input)
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear || echo "⚠️  Static files collection skipped"

echo "🎉 Setup complete! Starting Django server..."

# Start gunicorn directly — Railway sets $PORT dynamically
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 3 \
    --timeout 120 \
    --log-file -