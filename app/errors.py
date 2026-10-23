from flask import flash, redirect, render_template, request
from werkzeug.exceptions import HTTPException

from .core import safe_next
from .i18n import t
from .models import db


def register_errors(app):
    @app.errorhandler(HTTPException)
    def http_error(e: HTTPException):
        if request.path.startswith("/api/"):
            return {"ok": False, "error": e.name, "code": e.code}, e.code
        if e.code == 413 and request.method == "POST":
            # слишком большой файл в обычной форме: вернуть на ту же страницу с понятным сообщением
            flash(t("upload.err_too_big"), "error")
            return redirect(safe_next(request.path, "/"))
        return render_template("error.html", code=e.code), e.code

    @app.errorhandler(Exception)
    def server_error(e: Exception):
        app.logger.exception("Unhandled error")
        db.session.rollback()
        if app.config.get("TESTING"):
            raise e
        if request.path.startswith("/api/"):
            return {"ok": False, "error": "server"}, 500
        return render_template("error.html", code=500), 500
