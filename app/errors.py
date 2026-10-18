from flask import render_template, request
from werkzeug.exceptions import HTTPException

from .models import db


def register_errors(app):
    @app.errorhandler(HTTPException)
    def http_error(e: HTTPException):
        if request.path.startswith("/api/"):
            return {"ok": False, "error": e.name, "code": e.code}, e.code
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
