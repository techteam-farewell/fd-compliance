#!/bin/bash

cd /home/site/wwwroot

mkdir -p storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
chmod -R 755 public