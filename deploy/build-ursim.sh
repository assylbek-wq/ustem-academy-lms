#!/bin/bash
# Сборка UrSim (симулятор FTC BIOBUZZ команды URAN92, MIT): vendor/ursim -> app/static/ursim (в гите).
# Казахский перевод интерфейса - vendor/ursim/src/ui/i18n.kk.json, язык задает ?lang= в адресе.
set -e
cd "$(dirname "$0")/../vendor/ursim"
[ -d node_modules ] || npm ci --no-audit --no-fund
npx tsc --noEmit
rm -rf ../../app/static/ursim
npx vite build --outDir ../../app/static/ursim --emptyOutDir
cp LICENSE ../../app/static/ursim/LICENSE.txt
