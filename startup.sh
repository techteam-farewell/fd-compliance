#!/bin/bash

cd /home/site/wwwroot

echo "Running composer install..."
composer install --no-dev --optimize-autoloader

echo "Running Laravel optimizations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Fixing permissions..."
chmod -R 775 storage
chmod -R 775 bootstrap/cache

echo "Moving public files..."
cp -r public/* /home/site/wwwroot/

echo "Startup script completed!"