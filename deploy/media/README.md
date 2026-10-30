# Видеосервер студии эфиров

Студия `/efir` работает и без него (экран, пульт, викторина). Видеосервер добавляет спикеров по ссылке и трансляцию
в YouTube без OBS.

## Сервер
Работает: `ustem-media`, 77.243.81.119, `media.ustem.kz` (ps.kz, облако eta-plutonium, Алматы), установлен 30.10.2026.

- ps.kz, облако (VPC): 4 vCPU, 8 ГБ RAM, 40 ГБ NVMe, Ubuntu 24.04, публичный IP.
- DNS: `media.ustem.kz` (A-запись) -> IP сервера.
- Фаервол: TCP 80, 443, 7881; UDP 3478, 50000-60000.

## Установка
```
git clone ... && bash ustem-academy-lms/deploy/media/setup.sh media.ustem.kz
```
Скрипт ставит Docker, создает ключи (`/opt/ustem-media/.env.keys`), конфиги LiveKit и Egress и запускает
LiveKit, Egress, Redis и Caddy (сертификат HTTPS получает сам).

## Академия
В `.env` Академии:
```
LIVEKIT_URL=wss://media.ustem.kz
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
```
и перезапуск контейнера. Проверка: пульт эфира показывает «видеосервер» зеленым.

## Как это работает
- Спикер открывает ссылку из конструктора (`/efir/<slug>/guest?k=...`) и публикует камеру и микрофон в комнату `efir-<id>`.
- Экран эфира и пульт входят в комнату невидимыми, видят камеры. Кто в эфире, решает пульт (`EfirEvent.stage`).
- «Начать эфир в YouTube»: Академия вызывает `StartWebEgress`, Chrome на видеосервере открывает
  `/efir/<slug>/screen?key=...&egress=1`, экран пишет в консоль `START_RECORDING`, видео 1080p30 идет по RTMP в YouTube.
