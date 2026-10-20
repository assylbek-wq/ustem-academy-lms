#!/bin/bash
# Сборка лаборатории: assets/lab -> app/static/js/lab.js (Arduino и схемы), ftcsim.js (симулятор FTC),
# spikesim.js + spikeworker.js + static/spikesim/micropython.* (симулятор SPIKE Prime).
# Собранные файлы в гите.
set -e
cd "$(dirname "$0")/../assets/lab"
[ -d node_modules ] || npm install --no-audit --no-fund
npx esbuild lab.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/lab.js
npx esbuild ftc/sim.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/ftcsim.js
npx esbuild spike/ui.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/spikesim.js
npx esbuild spike/worker.js --bundle --minify --format=esm --target=es2020 --outfile=../../app/static/js/spikeworker.js
mkdir -p ../../app/static/spikesim
cp node_modules/@micropython/micropython-webassembly-pyscript/micropython.mjs node_modules/@micropython/micropython-webassembly-pyscript/micropython.wasm ../../app/static/spikesim/
