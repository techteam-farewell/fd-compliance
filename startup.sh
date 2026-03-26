#!/bin/bash

cd /home/site/wwwroot

echo "Installing dependencies..."
composer install --no-dev --optimize-autoloader

echo "Setting permissions..."
chmod -R 775 storage
chmod -R 775 bootstrap/cache

echo "Preparing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Moving public files to root..."
cp -r public/. /home/site/wwwroot/

echo "Done!"