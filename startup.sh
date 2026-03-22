#!/bin/bash

cd /home/site/wwwroot

echo "Fixing Laravel structure..."

# Ensure required folders
mkdir -p storage bootstrap/cache

# Fix permissions
chmod -R 775 storage bootstrap/cache
chmod -R 755 public

# Remove default Azure page
rm -f hostingstart.html

# Copy Laravel public files to root (IMPORTANT)
cp -r public/* /home/site/wwwroot/

echo "Startup complete."