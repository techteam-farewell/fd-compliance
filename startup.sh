#!/bin/bash

echo "Starting Laravel setup..."

cd /home/site/wwwroot

# Ensure storage and bootstrap/cache folders exist
mkdir -p storage bootstrap/cache

# Fix permissions
chmod -R 775 storage bootstrap/cache
chmod -R 755 public

# Install dependencies if missing
if [ ! -d "vendor" ]; then
    composer install --no-dev --optimize-autoloader
fi

# Ensure .env exists
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# Generate APP_KEY
php artisan key:generate --force

# Clear and cache configs
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Laravel setup complete. Starting server..."

# Start Laravel on PHP built-in server
php -S 0.0.0.0:8080 -t public