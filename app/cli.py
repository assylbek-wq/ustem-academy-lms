"""Команды: flask --app wsgi create-admin / seed-demo."""
import click

from .models import User, UserRole, db


def register_cli(app):
    @app.cli.command("create-admin")
    @click.option("--email", prompt=True)
    @click.option("--name", prompt="ФИО")
    @click.password_option()
    def create_admin(email, name, password):
        email = email.strip().lower()
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(email=email, full_name=name)
            db.session.add(user)
        user.set_password(password)
        if "admin" not in user.role_names:
            user.roles.append(UserRole(role="admin"))
        db.session.commit()
        click.echo(f"OK: {email} - администратор")

    @app.cli.command("admin-exists")
    @click.option("--email", required=True)
    def admin_exists(email):
        u = User.query.filter_by(email=email.strip().lower()).first()
        if not (u and u.is_admin):
            raise SystemExit(1)
        click.echo("yes")

    @app.cli.command("load-course")
    @click.argument("slug")
    @click.option("--replace", is_flag=True, help="Пересоздать, даже если есть группы (прогресс будет потерян)")
    @click.option("--no-cohorts", is_flag=True, help="Не создавать открытые онлайн-потоки")
    def load_course_cmd(slug, replace, no_cohorts):
        """Загрузить готовый курс из app/content (например, canopy-2026)."""
        from .content import CourseError, load
        try:
            p = load(slug, replace=replace, cohorts=not no_cohorts)
        except CourseError as e:
            raise click.ClickException(str(e))
        click.echo(f"OK: {p.slug}, уровней: {len(p.levels)}")

    @app.cli.command("seed-demo")
    def seed_demo_cmd():
        from .seed import seed_demo
        seed_demo(force=True)
        click.echo("OK: демо-данные загружены")
