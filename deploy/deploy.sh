#!/usr/bin/env bash
# Обновление USTEM Academy на VPS до последнего коммита в main.
#   bash /opt/ustem-academy/app/deploy/deploy.sh
set -euo pipefail
APP_DIR=/opt/ustem-academy
cd "$APP_DIR/app"
sudo -u academy git pull --ff-only
"$APP_DIR/venv/bin/pip" install -q -r requirements.txt
systemctl restart ustem-academy
sleep 3
if curl -fsS -o /dev/null http://127.0.0.1:8010/healthz; then
  echo "OK: обновлено до $(git log --oneline -1)"
else
  echo "Приложение не отвечает после обновления:"
  journalctl -u ustem-academy -n 30 --no-pager
  exit 1
fi
