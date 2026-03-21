#!/bin/bash

cd /home/site/wwwroot

# Install dependencies
composer install --no-dev --optimize-autoloader

# Laravel setup
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Fix permissions
chmod -R 775 storage bootstrap/cache

# Move into public folder
cd public

# Start server manually
php -S 0.0.0.0:8000 index.php