#!/bin/bash

echo "STARTUP SCRIPT IS RUNNING" > /home/site/wwwroot/tester.txt

cd /home/site/wwwroot

cp -r public/. /home/site/wwwroot/