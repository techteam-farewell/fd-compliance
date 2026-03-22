#!/bin/bash

cd /home/site/wwwroot

# Fix permissions
mkdir -p storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
chmod -R 755 public

# Force correct document root by copying public contents to root
cp -r public/* /home/site/wwwroot/

echo "Startup script finished."