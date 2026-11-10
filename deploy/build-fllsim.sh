#!/bin/bash
# Сборка симулятора FLL BIOGLOW (github.com/AendeGitHub/fll-bioglow-sim): vendor/fllsim -> app/static/fllsim (в гите).
# Наши правки в исходниках: русские тексты без буквы "е с точками" и без длинного тире. Pyodide кладется рядом (pyodide/).
set -e
cd "$(dirname "$0")/../vendor/fllsim"
[ -d node_modules ] || npm ci --no-audit --no-fund --ignore-scripts
rm -rf ../../app/static/fllsim
npx vite build --outDir ../../app/static/fllsim --emptyOutDir
