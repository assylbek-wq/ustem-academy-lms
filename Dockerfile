FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 TZ=Asia/Almaty
WORKDIR /app
# avr-gcc для лаборатории Arduino (компиляция скетчей Uno); ffmpeg готовит загруженные видео уроков для всех браузеров
RUN apt-get update && apt-get install -y --no-install-recommends gcc-avr avr-libc binutils-avr ffmpeg \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -r -m -u 1001 academy && mkdir -p /data/uploads && chown -R academy /data
USER academy
# Ядро Arduino собираем заранее, чтобы первая компиляция в лаборатории была быстрой
RUN python -c "from app.services import arduino; arduino.compile_sketch('void setup(){} void loop(){}')"
EXPOSE 8010
CMD ["gunicorn", "wsgi:app", "--bind", "0.0.0.0:8010", "--workers", "3", "--threads", "4", "--timeout", "300", "--forwarded-allow-ips", "*", "--preload"]
