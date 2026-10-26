#!/bin/bash
# Сборка лаборатории: assets/lab -> app/static/js/lab.js (Arduino и схемы), ftcsim.js (симулятор FTC),
# spikesim.js + spikeworker.js + static/spikesim/micropython.* (симулятор SPIKE Prime),
# satsim.js + satworker.js (CubeSat и CanSat для WSO, тот же MicroPython из static/spikesim),
# robotsim.js + robotworker.js + static/robots/mujoco.* (Unitree Go2 и G1 на MuJoCo, тот же MicroPython).
# Собранные файлы в гите.
set -e
cd "$(dirname "$0")/../assets/lab"
[ -d node_modules ] || npm install --no-audit --no-fund
node i18n/merge.mjs  # казахский словарь симуляторов -> app/static/lab/i18n/kk.json
npx esbuild lab.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/lab.js
npx esbuild ftc/sim.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/ftcsim.js
npx esbuild spike/ui.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/spikesim.js
npx esbuild spike/worker.js --bundle --minify --format=esm --target=es2020 --outfile=../../app/static/js/spikeworker.js
npx esbuild sat/ui.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/satsim.js
npx esbuild sat/worker.js --bundle --minify --format=esm --target=es2020 --outfile=../../app/static/js/satworker.js
npx esbuild robots/ui.js --bundle --minify --format=iife --target=es2020 --outfile=../../app/static/js/robotsim.js
npx esbuild robots/worker.js --bundle --minify --format=esm --target=es2020 --outfile=../../app/static/js/robotworker.js
mkdir -p ../../app/static/robots
cp node_modules/@mujoco/mujoco/mujoco.js node_modules/@mujoco/mujoco/mujoco.wasm ../../app/static/robots/
mkdir -p ../../app/static/spikesim
cp node_modules/@micropython/micropython-webassembly-pyscript/micropython.mjs node_modules/@micropython/micropython-webassembly-pyscript/micropython.wasm ../../app/static/spikesim/
