#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# USTEM Academy - установка на VPS (Ubuntu 22.04/24.04, root), например в ps.kz.
#
#   bash setup-vps.sh academy.ustem.kz [admin-email] [git-репозиторий]
#
# Ставит: PostgreSQL, Python + venv, Caddy (авто-HTTPS), systemd-сервис gunicorn,
# ежедневный бэкап базы. Можно ставить на тот же сервер, что и USTEM Connect:
# приложение слушает порт 8010, а Caddy получает отдельный файл сайта.
# Данные и видео: /var/lib/ustem-academy/ - переживают обновления.
# Повторный запуск безопасен.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="${1:?Использование: bash setup-vps.sh <домен> [admin-email] [git-репозиторий]}"
ADMIN_EMAIL="${2:-assylbek@ustemfoundation.org}"
REPO="${3:-https://github.com/assylbek-wq/ustem-academy-lms.git}"

APP_DIR=/opt/ustem-academy
DATA_DIR=/var/lib/ustem-academy
ENV_FILE=/etc/ustem-academy.env
PORT=8010

echo "── [1/8] Системные пакеты ──"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -yq python3-venv python3-pip git ufw curl openssl postgresql \
  debian-keyring debian-archive-keyring apt-transport-https gnupg

echo "── [2/8] Caddy ──"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -q && apt-get install -yq caddy
fi

echo "── [3/8] PostgreSQL ──"
DB_PASS_FILE=/root/.ustem-academy-dbpass
if [ ! -f "$DB_PASS_FILE" ]; then
  openssl rand -hex 16 > "$DB_PASS_FILE"; chmod 600 "$DB_PASS_FILE"
fi
DB_PASS=$(cat "$DB_PASS_FILE")
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='academy'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE ROLE academy LOGIN PASSWORD '$DB_PASS'"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='academy'" | grep -q 1 \
  || sudo -u postgres createdb -O academy academy

echo "── [4/8] Пользователь и код ──"
id -u academy >/dev/null 2>&1 || useradd -r -m -d "$APP_DIR" -s /usr/sbin/nologin academy
mkdir -p "$DATA_DIR/uploads" "$DATA_DIR/backups"
if [ -d "$APP_DIR/app/.git" ]; then
  git -C "$APP_DIR/app" pull --ff-only
else
  git clone "$REPO" "$APP_DIR/app"
fi
python3 -m venv "$APP_DIR/venv"
"$APP_DIR/venv/bin/pip" install -q --upgrade pip
"$APP_DIR/venv/bin/pip" install -q -r "$APP_DIR/app/requirements.txt"
chown -R academy:academy "$APP_DIR" "$DATA_DIR"

echo "── [5/8] Конфигурация (${ENV_FILE}) ──"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<EOV
SECRET_KEY=$(openssl rand -hex 32)
DATABASE_URL=postgresql+psycopg://academy:$DB_PASS@127.0.0.1/academy
UPLOAD_DIR=$DATA_DIR/uploads
PUBLIC_BASE_URL=https://$DOMAIN
SESSION_COOKIE_SECURE=1
SEED_CONTENT=1
SEED_DEMO=0
# Почта для приглашений и уведомлений (без нее ссылки видны админу в интерфейсе)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM="USTEM Academy <academy@ustem.kz>"
# ИИ-помощник слушателя (API Claude). Пусто = помощник скрыт.
ANTHROPIC_API_KEY=
AI_MODEL=claude-sonnet-5-5
AI_DAILY_LIMIT=40
MAX_UPLOAD_MB=2048
EOV
  chmod 600 "$ENV_FILE"
else
  echo "  $ENV_FILE уже существует - не трогаю."
fi

echo "── [6/8] systemd-сервис и бэкапы ──"
cat > /etc/systemd/system/ustem-academy.service <<EOV
[Unit]
Description=USTEM Academy (Flask via gunicorn)
After=network.target postgresql.service

[Service]
User=academy
Group=academy
WorkingDirectory=$APP_DIR/app
EnvironmentFile=$ENV_FILE
ExecStart=$APP_DIR/venv/bin/gunicorn wsgi:app --bind 127.0.0.1:$PORT --workers 2 --threads 4 --timeout 300
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOV
cat > /etc/cron.daily/ustem-academy-backup <<EOV
#!/bin/sh
# Ежедневный дамп базы, хранится 14 дней. Видео лежат в $DATA_DIR/uploads (копируйте отдельно).
sudo -u postgres pg_dump -Fc academy > $DATA_DIR/backups/academy-\$(date +%F).dump
find $DATA_DIR/backups -name 'academy-*.dump' -mtime +14 -delete
EOV
chmod +x /etc/cron.daily/ustem-academy-backup
systemctl daemon-reload
systemctl enable --now ustem-academy
systemctl restart ustem-academy

echo "── [7/8] Caddy -> $DOMAIN ──"
mkdir -p /etc/caddy/sites
cat > /etc/caddy/sites/ustem-academy.caddy <<EOV
$DOMAIN {
    reverse_proxy 127.0.0.1:$PORT
    encode gzip
}
EOV
touch /etc/caddy/Caddyfile
grep -q "import sites/\*.caddy" /etc/caddy/Caddyfile || echo "import sites/*.caddy" >> /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile >/dev/null && (systemctl reload caddy || systemctl restart caddy)

echo "── [8/8] Файрвол и администратор ──"
ufw allow OpenSSH >/dev/null
ufw allow 80,443/tcp >/dev/null
ufw --force enable >/dev/null
sleep 3
ADMIN_PW=""
cd "$APP_DIR/app"
flask_cli() { (set -a; . "$ENV_FILE"; set +a; "$APP_DIR/venv/bin/flask" --app wsgi "$@"); }
if ! flask_cli admin-exists --email "$ADMIN_EMAIL" >/dev/null 2>&1; then
  ADMIN_PW=$(openssl rand -base64 12 | tr -d '/+=' | head -c 14)
  flask_cli create-admin --email "$ADMIN_EMAIL" --name "Администратор Академии" --password "$ADMIN_PW"
fi

echo
echo "═══════════════════════════════════════════════════════"
if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/healthz"; then
  echo "OK: приложение работает."
else
  echo "Приложение не отвечает - смотрите: journalctl -u ustem-academy -n 50"
fi
echo "Сайт:   https://$DOMAIN  (HTTPS включится, когда DNS укажет на этот сервер)"
[ -n "$ADMIN_PW" ] && echo "Вход:   $ADMIN_EMAIL / $ADMIN_PW  <- сохраните и смените после входа"
echo "Почта и ИИ: впишите SMTP_* и ANTHROPIC_API_KEY в $ENV_FILE, затем systemctl restart ustem-academy"
echo "Бэкапы: $DATA_DIR/backups/ (ежедневно)"
echo "Обновление: bash $APP_DIR/app/deploy/deploy.sh"
echo "═══════════════════════════════════════════════════════"
