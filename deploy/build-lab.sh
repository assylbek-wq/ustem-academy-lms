#!/bin/bash
# Сборка лаборатории (симулятор Arduino и схем): assets/lab -> app/static/js/lab.js (собранный файл в гите).
set -e
cd "$(dirname "$0")/../assets/lab"
[ -d node_modules ] || npm install --no-audit --no-fund
npx esbuild lab.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/lab.js
