"""Точка входа: gunicorn wsgi:app  |  python wsgi.py (локально, порт 5080)."""
import os

from werkzeug.middleware.proxy_fix import ProxyFix

from app import create_app

app = create_app()
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5080)), debug=os.environ.get("FLASK_DEBUG") == "1")
