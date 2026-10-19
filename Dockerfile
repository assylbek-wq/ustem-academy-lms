FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 TZ=Asia/Almaty
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -r -m -u 1001 academy && mkdir -p /data/uploads && chown -R academy /data
USER academy
EXPOSE 8010
CMD ["gunicorn", "wsgi:app", "--bind", "0.0.0.0:8010", "--workers", "3", "--threads", "4", "--timeout", "300", "--forwarded-allow-ips", "*", "--preload"]
