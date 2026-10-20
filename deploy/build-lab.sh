#!/bin/bash
# Сборка лаборатории: assets/lab -> app/static/js/lab.js (Arduino и схемы) и app/static/js/ftcsim.js (симулятор FTC).
# Собранные файлы в гите.
set -e
cd "$(dirname "$0")/../assets/lab"
[ -d node_modules ] || npm install --no-audit --no-fund
npx esbuild lab.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/lab.js
npx esbuild ftc/sim.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/ftcsim.js
