#!/bin/bash

echo "STARTUP SCRIPT IS RUNNING" > /home/site/wwwroot/test.txt

cd /home/site/wwwroot

cp -r public/. /home/site/wwwroot/