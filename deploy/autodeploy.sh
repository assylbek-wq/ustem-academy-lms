#!/usr/bin/env bash
# Автовыкладка USTEM Academy без доступа к серверу: выкладывается то, что отправлено в ветку production на GitHub.
# Запускается раз в минуту таймером ustem-autodeploy.timer (deploy/systemd/), работает копия /opt/ustem-academy/autodeploy.sh.
# Каждая выкладка: копия базы -> код из production -> пересборка контейнеров -> проверка /healthz (версия = коммит).
# Журнал: /opt/ustem-academy/autodeploy.log. Выложить: git push origin main:production (или нужный коммит).
set -uo pipefail
ROOT=/opt/ustem-academy
APP=$ROOT/app
STATE=$ROOT/.deployed
LOG=$ROOT/autodeploy.log
exec 9>"$ROOT/.autodeploy.lock"
flock -n 9 || exit 0
cd "$APP" || exit 1
git fetch -q origin production 2>>"$LOG" || exit 0
NEW=$(git rev-parse origin/production 2>/dev/null) || exit 0
OLD=$(cat "$STATE" 2>/dev/null || true)
[ "$NEW" = "$OLD" ] && exit 0

log() { echo "$(date '+%F %T') $*" >> "$LOG"; }
log "=== выкладка ${OLD:0:7} -> ${NEW:0:7} ($(git log -1 --format=%s "$NEW" | cut -c1-100))"
echo "$NEW" > "$STATE"   # повторно ту же версию не пробуем, даже если не вышло

T=$(date +%Y%m%d-%H%M%S)
B="$ROOT/backups/academy-auto-$T.sql.gz"
if ! sudo docker exec ustem-academy-db-1 pg_dump -U academy academy | gzip > "$B" || [ "$(stat -c%s "$B")" -lt 10000 ]; then
  log "ОШИБКА: копия базы не сделана, выкладка отменена"; exit 1
fi
log "копия базы: $(basename "$B") ($(du -h "$B" | cut -f1))"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  log "ОШИБКА: в $APP есть локальные правки, выкладка отменена"; exit 1
fi
git checkout -q -B main "$NEW" || { log "ОШИБКА: git checkout"; exit 1; }
echo "$NEW" > "$APP/REVISION"
cp "$APP/deploy/docker/compose.yml" "$ROOT/compose.yml"
cd "$ROOT"
sudo docker compose up -d --build >> "$LOG" 2>&1 || { log "ОШИБКА: сборка"; exit 1; }

for i in $(seq 1 40); do
  sleep 3
  V=$(curl -fsS https://academy.ustem.kz/healthz 2>/dev/null | python3 -c 'import sys,json;print(json.load(sys.stdin).get("version",""))' 2>/dev/null)
  if [ "$V" = "$NEW" ]; then
    log "OK: выложено ${NEW:0:7}"
    sudo docker image prune -f > /dev/null 2>&1
    ls -1t "$ROOT"/backups/academy-auto-*.sql.gz 2>/dev/null | tail -n +41 | xargs -r rm -f
    exit 0
  fi
done
log "ОШИБКА: сайт не ответил новой версией за 2 минуты"
sudo docker compose ps >> "$LOG" 2>&1
exit 1
