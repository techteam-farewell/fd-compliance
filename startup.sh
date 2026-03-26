#!/bin/bash

cd /home/site/wwwroot

echo "Installing dependencies..."
composer install --no-dev --optimize-autoloader

echo "Setting permissions..."
chmod -R 775 storage
chmod -R 775 bootstrap/cache

echo "Running Laravel optimizations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Startup script completed!"