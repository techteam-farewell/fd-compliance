#!/bin/bash

cd /home/site/wwwroot

# Ensure required folders exist
mkdir -p storage bootstrap/cache

# Set correct permissions
chmod -R 775 storage bootstrap/cache
chmod -R 755 public

echo "Startup script finished."