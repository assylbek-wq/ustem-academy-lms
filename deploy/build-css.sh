#!/usr/bin/env bash
# Пересборка app/static/css/app.css после изменения классов в шаблонах.
# Скачивает Tailwind standalone CLI при первом запуске (~40 МБ).
set -euo pipefail
cd "$(dirname "$0")/.."
BIN=.tools/tailwindcss
if [ ! -x "$BIN" ]; then
  mkdir -p .tools
  case "$(uname -s)-$(uname -m)" in
    Darwin-arm64) SUFFIX=macos-arm64 ;;
    Darwin-x86_64) SUFFIX=macos-x64 ;;
    Linux-x86_64) SUFFIX=linux-x64 ;;
    Linux-aarch64) SUFFIX=linux-arm64 ;;
    *) echo "Неизвестная платформа"; exit 1 ;;
  esac
  curl -sL -o "$BIN" "https://github.com/tailwindlabs/tailwindcss/releases/download/v3.4.17/tailwindcss-$SUFFIX"
  chmod +x "$BIN"
fi
"$BIN" -c tailwind.config.js -i assets/app.css -o app/static/css/app.css --minify
echo "OK: app/static/css/app.css -> $(wc -c < app/static/css/app.css) байт"
