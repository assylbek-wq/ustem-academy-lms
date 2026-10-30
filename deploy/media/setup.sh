#!/usr/bin/env bash
# Установка видеосервера студии на чистый Ubuntu 24.04 (ps.kz VPC): bash setup.sh media.ustem.kz
# Перед запуском: A-запись домена указывает на IP сервера; в фаерволе открыты 80, 443 (TCP), 7881 (TCP), 3478 (UDP), 50000-60000 (UDP).
set -euo pipefail
DOMAIN="${1:?домен, например media.ustem.kz}"
DIR=/opt/ustem-media
sudo mkdir -p "$DIR" && sudo chown "$USER" "$DIR"
cp "$(dirname "$0")/docker-compose.yml" "$DIR/"
cd "$DIR"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi
if [ ! -f .env.keys ]; then
  KEY="API$(openssl rand -hex 6)"; SECRET="$(openssl rand -hex 32)"
  printf 'LIVEKIT_API_KEY=%s\nLIVEKIT_API_SECRET=%s\n' "$KEY" "$SECRET" > .env.keys
  chmod 600 .env.keys
fi
. ./.env.keys
cat > livekit.yaml <<YAML
port: 7880
rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: true
redis:
  address: 127.0.0.1:6379
keys:
  ${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}
turn:
  enabled: true
  domain: ${DOMAIN}
  udp_port: 3478
room:
  empty_timeout: 600
  max_participants: 30
logging:
  level: info
YAML
cat > egress.yaml <<YAML
api_key: ${LIVEKIT_API_KEY}
api_secret: ${LIVEKIT_API_SECRET}
ws_url: ws://127.0.0.1:7880
redis:
  address: 127.0.0.1:6379
health_port: 8080
log_level: info
YAML
cat > Caddyfile <<CADDY
${DOMAIN} {
  reverse_proxy 127.0.0.1:7880
}
CADDY
chmod 600 livekit.yaml
chmod 644 egress.yaml   # Egress в контейнере работает не от root
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 443/udp
sudo ufw allow 7881/tcp && sudo ufw allow 3478/udp && sudo ufw allow 50000:60000/udp && sudo ufw allow 30000:40000/udp
sudo ufw --force enable   # 7880 (API без TLS) снаружи закрыт, к нему ходит только Caddy
sudo docker compose pull
sudo docker compose up -d
echo
echo "Готово. В .env Академии добавьте:"
echo "LIVEKIT_URL=wss://${DOMAIN}"
echo "LIVEKIT_API_KEY=${LIVEKIT_API_KEY}"
echo "LIVEKIT_API_SECRET=(в ${DIR}/.env.keys)"
