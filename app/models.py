"""Модель данных USTEM Academy.

Цепочка: Program -> Level -> Module -> Lesson; Level -> Assignment -> RubricCriterion.
Обучение идет в когортах: Cohort -> Enrollment (слушатель) -> LessonProgress / Evidence -> Review -> Certificate.
Тексты контента хранятся как JSON {"ru": ..., "kk": ..., "en": ...}.
"""
from __future__ import annotations

import secrets
import uuid
from datetime import date, datetime, timedelta, timezone

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON, UniqueConstraint
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def local_now() -> datetime:
    """Текущее время в часовом поясе Академии (без tzinfo), для сравнения с временем занятий."""
    from zoneinfo import ZoneInfo
    try:
        from flask import current_app
        tz = current_app.config.get("TIMEZONE", "Asia/Almaty")
    except RuntimeError:
        tz = "Asia/Almaty"
    return datetime.now(ZoneInfo(tz)).replace(tzinfo=None)


def local_today() -> date:
    return local_now().date()


def new_token(n: int = 24) -> str:
    return secrets.token_urlsafe(n)


# ─── Роли ────────────────────────────────────────────────────────────────
# Слушатель (учитель) - не отдельная роль: любой пользователь с записью в когорту.
ROLES = ("admin", "methodist", "trainer", "mentor", "customer")


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255))
    full_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(64))
    organization = db.Column(db.String(255))
    city = db.Column(db.String(128))
    country = db.Column(db.String(64), default="KZ")
    locale = db.Column(db.String(8), default="ru")
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    consent_at = db.Column(db.DateTime)  # согласие на обработку персональных данных
    portfolio_public = db.Column(db.Boolean, default=False, nullable=False)
    portfolio_token = db.Column(db.String(64), unique=True, default=lambda: new_token(12))
    invite_token = db.Column(db.String(64), unique=True, index=True)
    invite_expires_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=utcnow)
    last_login_at = db.Column(db.DateTime)
    # Геймификация и связь с USTEM Connect (services/game.py, services/connect.py)
    region = db.Column(db.String(128))  # для рейтинга; пусто - берется регион команды из Connect
    leaderboard_hidden = db.Column(db.Boolean, default=False, nullable=False, server_default=db.false())
    connect_person_id = db.Column(db.String(64), unique=True)
    connect_linked_at = db.Column(db.DateTime)
    connect_synced_at = db.Column(db.DateTime)
    connect_snapshot = db.Column(JSON)

    roles = db.relationship("UserRole", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, pw: str) -> None:
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw: str) -> bool:
        return bool(self.password_hash) and check_password_hash(self.password_hash, pw)

    @property
    def role_names(self) -> set[str]:
        return {r.role for r in self.roles}

    def has_role(self, *names: str) -> bool:
        rn = self.role_names
        return "admin" in rn or any(n in rn for n in names)

    @property
    def is_admin(self) -> bool:
        return "admin" in self.role_names

    @property
    def customer_ids(self) -> set[int]:
        return {r.customer_id for r in self.roles if r.role == "customer" and r.customer_id}

    def issue_invite(self, days: int = 14) -> str:
        self.invite_token = new_token(24)
        self.invite_expires_at = utcnow() + timedelta(days=days)
        return self.invite_token

    @property
    def initials(self) -> str:
        parts = (self.full_name or "?").split()
        return "".join(p[0] for p in parts[:2]).upper()


class UserRole(db.Model):
    __tablename__ = "user_roles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = db.Column(db.String(32), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id", ondelete="CASCADE"))
    user = db.relationship("User", back_populates="roles")
    customer = db.relationship("Customer")
    __table_args__ = (UniqueConstraint("user_id", "role", "customer_id", name="uq_user_role"),)


class Customer(db.Model):
    """Заказчик обучения: акимат, управление образования, школа, фонд."""
    __tablename__ = "customers"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    kind = db.Column(db.String(32), default="other")  # akimat | edu_dept | school | fund | company | other
    contact_name = db.Column(db.String(255))
    contact_email = db.Column(db.String(255))
    contact_phone = db.Column(db.String(64))
    created_at = db.Column(db.DateTime, default=utcnow)
    cohorts = db.relationship("Cohort", back_populates="customer")


# ─── Контент ─────────────────────────────────────────────────────────────
DIRECTIONS = (
    "base", "fll-future", "ftc", "battle-bots", "physical-ai", "drones",
    "wso", "future-race", "fll-challenge", "fll-explore", "ai-teacher", "first-season", "electronics", "other",
)


class Program(db.Model):
    __tablename__ = "programs"
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(120), unique=True, nullable=False)
    direction = db.Column(db.String(32), default="other")
    title = db.Column(JSON, nullable=False, default=dict)
    summary = db.Column(JSON, default=dict)
    description = db.Column(JSON, default=dict)
    audience = db.Column(JSON, default=dict)      # для кого программа
    equipment = db.Column(JSON, default=dict)     # оборудование и софт
    color = db.Column(db.String(16), default="#0085ff")
    status = db.Column(db.String(16), default="draft")  # draft | published | archived
    # в своем темпе: у каждого уровня постоянный открытый поток без дат и дедлайнов
    self_paced = db.Column(db.Boolean, default=False, nullable=False, server_default=db.false())
    version = db.Column(db.Integer, default=0, nullable=False)
    published_at = db.Column(db.DateTime)
    position = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    levels = db.relationship("Level", back_populates="program", order_by="Level.number",
                             cascade="all, delete-orphan")


class Level(db.Model):
    __tablename__ = "levels"
    id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey("programs.id", ondelete="CASCADE"), nullable=False)
    number = db.Column(db.Integer, nullable=False, default=1)
    title = db.Column(JSON, nullable=False, default=dict)
    description = db.Column(JSON, default=dict)
    outcomes = db.Column(JSON, default=dict)   # что умеет учитель после уровня
    duration = db.Column(JSON, default=dict)   # ориентир по сроку, текстом
    min_quiz_score = db.Column(db.Integer, default=70, nullable=False)
    require_attendance = db.Column(db.Boolean, default=True, nullable=False)

    program = db.relationship("Program", back_populates="levels")
    modules = db.relationship("Module", back_populates="level", order_by="Module.position",
                              cascade="all, delete-orphan")
    assignments = db.relationship("Assignment", back_populates="level", order_by="Assignment.position",
                                  cascade="all, delete-orphan")

    @property
    def lessons(self) -> list["Lesson"]:
        return [l for m in self.modules for l in m.lessons]


class Module(db.Model):
    __tablename__ = "modules"
    id = db.Column(db.Integer, primary_key=True)
    level_id = db.Column(db.Integer, db.ForeignKey("levels.id", ondelete="CASCADE"), nullable=False)
    position = db.Column(db.Integer, default=0, nullable=False)
    title = db.Column(JSON, nullable=False, default=dict)
    level = db.relationship("Level", back_populates="modules")
    lessons = db.relationship("Lesson", back_populates="module", order_by="Lesson.position",
                              cascade="all, delete-orphan")


LESSON_KINDS = ("video", "text", "quiz")


class Lesson(db.Model):
    __tablename__ = "lessons"
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    position = db.Column(db.Integer, default=0, nullable=False)
    kind = db.Column(db.String(16), default="text", nullable=False)
    title = db.Column(JSON, nullable=False, default=dict)
    body = db.Column(JSON, default=dict)        # Markdown по языкам
    video_url = db.Column(JSON, default=dict)   # YouTube / Vimeo / прямой mp4, по языкам
    kit = db.Column(JSON)  # «урок под ключ»: план занятия с учениками, слайды (по языкам), см. learn/_kit.html
    duration_min = db.Column(db.Integer, default=10)
    module = db.relationship("Module", back_populates="lessons")
    questions = db.relationship("QuizQuestion", back_populates="lesson", order_by="QuizQuestion.position",
                                cascade="all, delete-orphan")
    materials = db.relationship("LessonMaterial", back_populates="lesson", cascade="all, delete-orphan")


class QuizQuestion(db.Model):
    __tablename__ = "quiz_questions"
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    position = db.Column(db.Integer, default=0, nullable=False)
    prompt = db.Column(JSON, nullable=False, default=dict)
    options = db.Column(JSON, nullable=False, default=list)   # [{"ru":..,"kk":..,"en":..}, ...]
    correct = db.Column(JSON, nullable=False, default=list)   # индексы правильных вариантов
    explanation = db.Column(JSON, default=dict)
    lesson = db.relationship("Lesson", back_populates="questions")

    @property
    def multiple(self) -> bool:
        return len(self.correct or []) > 1


class LessonMaterial(db.Model):
    __tablename__ = "lesson_materials"
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    stored_name = db.Column(db.String(255), nullable=False)
    size = db.Column(db.BigInteger, default=0)
    lesson = db.relationship("Lesson", back_populates="materials")


EVIDENCE_KINDS = ("video", "files", "text")


class Assignment(db.Model):
    """Задание с доказательством: видео урока, фото работ учеников, проект."""
    __tablename__ = "assignments"
    id = db.Column(db.Integer, primary_key=True)
    level_id = db.Column(db.Integer, db.ForeignKey("levels.id", ondelete="CASCADE"), nullable=False)
    position = db.Column(db.Integer, default=0, nullable=False)
    title = db.Column(JSON, nullable=False, default=dict)
    description = db.Column(JSON, default=dict)
    evidence_kind = db.Column(db.String(16), default="video", nullable=False)
    due_days = db.Column(db.Integer, default=21)  # дедлайн = старт когорты + N дней
    pass_min_level = db.Column(db.Integer, default=2, nullable=False)  # минимум по каждому критерию (1..4)
    level = db.relationship("Level", back_populates="assignments")
    criteria = db.relationship("RubricCriterion", back_populates="assignment",
                               order_by="RubricCriterion.position", cascade="all, delete-orphan")


class RubricCriterion(db.Model):
    __tablename__ = "rubric_criteria"
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    position = db.Column(db.Integer, default=0, nullable=False)
    title = db.Column(JSON, nullable=False, default=dict)
    # 4 уровня: [{"ru": "1 - ...", ...}, ...]
    descriptors = db.Column(JSON, nullable=False, default=list)
    assignment = db.relationship("Assignment", back_populates="criteria")


# ─── Когорты ─────────────────────────────────────────────────────────────
class Cohort(db.Model):
    __tablename__ = "cohorts"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey("programs.id"), nullable=False)
    level_id = db.Column(db.Integer, db.ForeignKey("levels.id"), nullable=False)
    program_version = db.Column(db.Integer, default=0)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id", ondelete="SET NULL"))
    trainer_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    language = db.Column(db.String(8), default="ru")
    city = db.Column(db.String(128))
    start_date = db.Column(db.Date, default=date.today)
    end_date = db.Column(db.Date)
    capacity = db.Column(db.Integer, default=25)
    status = db.Column(db.String(16), default="planned")  # planned | active | finished
    is_open = db.Column(db.Boolean, default=False, nullable=False)  # самозапись по ссылке
    self_paced = db.Column(db.Boolean, default=False, nullable=False, server_default=db.false())
    invite_code = db.Column(db.String(32), unique=True, default=lambda: secrets.token_hex(4))
    created_at = db.Column(db.DateTime, default=utcnow)

    program = db.relationship("Program")
    level = db.relationship("Level")
    customer = db.relationship("Customer", back_populates="cohorts")
    trainer = db.relationship("User", foreign_keys=[trainer_id])
    enrollments = db.relationship("Enrollment", back_populates="cohort", cascade="all, delete-orphan")
    sessions = db.relationship("Session", back_populates="cohort", order_by="Session.starts_at",
                               cascade="all, delete-orphan")

    def due_date(self, assignment: Assignment) -> date | None:
        if self.self_paced or not self.start_date or assignment.due_days is None:
            return None
        return self.start_date + timedelta(days=assignment.due_days)


class Enrollment(db.Model):
    __tablename__ = "enrollments"
    id = db.Column(db.Integer, primary_key=True)
    cohort_id = db.Column(db.Integer, db.ForeignKey("cohorts.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    status = db.Column(db.String(16), default="active")  # active | completed | dropped
    enrolled_at = db.Column(db.DateTime, default=utcnow)
    completed_at = db.Column(db.DateTime)

    cohort = db.relationship("Cohort", back_populates="enrollments")
    user = db.relationship("User", foreign_keys=[user_id])
    mentor = db.relationship("User", foreign_keys=[mentor_id])
    progress = db.relationship("LessonProgress", back_populates="enrollment", cascade="all, delete-orphan")
    evidence = db.relationship("Evidence", back_populates="enrollment", cascade="all, delete-orphan")
    __table_args__ = (UniqueConstraint("cohort_id", "user_id", name="uq_enrollment"),)


class Session(db.Model):
    """Очное занятие (интенсив) или онлайн-встреча когорты."""
    __tablename__ = "sessions"
    id = db.Column(db.Integer, primary_key=True)
    cohort_id = db.Column(db.Integer, db.ForeignKey("cohorts.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    kind = db.Column(db.String(16), default="intensive")  # intensive | online
    starts_at = db.Column(db.DateTime, nullable=False)
    ends_at = db.Column(db.DateTime)
    location = db.Column(db.String(255))
    notes = db.Column(db.Text)  # что взять с собой
    cohort = db.relationship("Cohort", back_populates="sessions")
    attendance = db.relationship("Attendance", back_populates="session", cascade="all, delete-orphan")


class Attendance(db.Model):
    __tablename__ = "attendance"
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id", ondelete="CASCADE"), nullable=False)
    present = db.Column(db.Boolean, default=False, nullable=False)
    marked_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    marked_at = db.Column(db.DateTime, default=utcnow)
    session = db.relationship("Session", back_populates="attendance")
    enrollment = db.relationship("Enrollment")
    __table_args__ = (UniqueConstraint("session_id", "enrollment_id", name="uq_attendance"),)


class LessonProgress(db.Model):
    __tablename__ = "lesson_progress"
    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id", ondelete="CASCADE"), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    completed_at = db.Column(db.DateTime)
    quiz_score = db.Column(db.Integer)  # %, лучший результат
    attempts = db.Column(db.Integer, default=0, nullable=False)
    enrollment = db.relationship("Enrollment", back_populates="progress")
    lesson = db.relationship("Lesson")
    __table_args__ = (UniqueConstraint("enrollment_id", "lesson_id", name="uq_progress"),)


# ─── Доказательства и проверка ───────────────────────────────────────────
class Evidence(db.Model):
    """Одна попытка сдачи задания. Пересдача = новая запись с attempt+1."""
    __tablename__ = "evidence"
    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id", ondelete="CASCADE"), nullable=False)
    assignment_id = db.Column(db.Integer, db.ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    attempt = db.Column(db.Integer, default=1, nullable=False)
    status = db.Column(db.String(16), default="submitted")  # submitted | returned | accepted
    text = db.Column(db.Text)
    consent_children = db.Column(db.Boolean, default=False, nullable=False)
    submitted_at = db.Column(db.DateTime, default=utcnow)

    enrollment = db.relationship("Enrollment", back_populates="evidence")
    assignment = db.relationship("Assignment")
    files = db.relationship("EvidenceFile", back_populates="evidence", cascade="all, delete-orphan")
    reviews = db.relationship("Review", back_populates="evidence", order_by="Review.created_at",
                              cascade="all, delete-orphan")

    @property
    def last_review(self) -> "Review | None":
        return self.reviews[-1] if self.reviews else None


class EvidenceFile(db.Model):
    __tablename__ = "evidence_files"
    id = db.Column(db.Integer, primary_key=True)
    evidence_id = db.Column(db.Integer, db.ForeignKey("evidence.id", ondelete="CASCADE"))
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    kind = db.Column(db.String(16), default="file")  # video | image | file
    original_name = db.Column(db.String(255), nullable=False)
    stored_name = db.Column(db.String(255), nullable=False)
    mime = db.Column(db.String(128))
    size = db.Column(db.BigInteger, default=0)
    created_at = db.Column(db.DateTime, default=utcnow)
    evidence = db.relationship("Evidence", back_populates="files")
    comments = db.relationship("TimecodeComment", back_populates="file", order_by="TimecodeComment.seconds",
                               cascade="all, delete-orphan")


class TimecodeComment(db.Model):
    __tablename__ = "timecode_comments"
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey("evidence_files.id", ondelete="CASCADE"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    seconds = db.Column(db.Float, default=0, nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)
    file = db.relationship("EvidenceFile", back_populates="comments")
    author = db.relationship("User")


class Review(db.Model):
    __tablename__ = "reviews"
    id = db.Column(db.Integer, primary_key=True)
    evidence_id = db.Column(db.Integer, db.ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    decision = db.Column(db.String(16), nullable=False)  # accepted | returned
    scores = db.Column(JSON, default=dict)  # {criterion_id: 1..4}
    summary = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=utcnow)
    evidence = db.relationship("Evidence", back_populates="reviews")
    reviewer = db.relationship("User")


# ─── Сертификаты ─────────────────────────────────────────────────────────
class Certificate(db.Model):
    __tablename__ = "certificates"
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(32), unique=True, nullable=False,
                     default=lambda: uuid.uuid4().hex[:16].upper())
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id", ondelete="SET NULL"))
    # снапшот на момент выдачи: сертификат проверяется по QR даже после правок программы
    recipient_name = db.Column(db.String(255), nullable=False)
    program_title = db.Column(JSON, nullable=False, default=dict)
    level_title = db.Column(JSON, nullable=False, default=dict)
    level_number = db.Column(db.Integer, default=1)
    cohort_name = db.Column(db.String(255))
    hours = db.Column(db.Integer)
    status = db.Column(db.String(16), default="valid")  # valid | revoked
    issued_at = db.Column(db.DateTime, default=utcnow)
    issued_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    user = db.relationship("User", foreign_keys=[user_id])
    enrollment = db.relationship("Enrollment")


# ─── Служебное ───────────────────────────────────────────────────────────
class Upload(db.Model):
    """Незавершенная загрузка частями (докачка при обрыве связи)."""
    __tablename__ = "uploads"
    id = db.Column(db.String(64), primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    mime = db.Column(db.String(128))
    total_size = db.Column(db.BigInteger, nullable=False)
    received = db.Column(db.BigInteger, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)
    file_id = db.Column(db.Integer, db.ForeignKey("evidence_files.id", ondelete="SET NULL"))


class AiMessage(db.Model):
    __tablename__ = "ai_messages"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id", ondelete="SET NULL"))
    role = db.Column(db.String(16), nullable=False)  # user | assistant
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)


class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    kind = db.Column(db.String(32), nullable=False)
    text = db.Column(db.String(500), nullable=False)
    url = db.Column(db.String(500))
    read_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=utcnow)


class Lead(db.Model):
    """Заявка на обучение от школы, акимата или фонда с публичной страницы."""
    __tablename__ = "leads"
    id = db.Column(db.Integer, primary_key=True)
    org_name = db.Column(db.String(255), nullable=False)
    contact_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255))
    phone = db.Column(db.String(64))
    teachers_count = db.Column(db.Integer)
    program_id = db.Column(db.Integer, db.ForeignKey("programs.id", ondelete="SET NULL"))
    message = db.Column(db.Text)
    status = db.Column(db.String(16), default="new")  # new | in_progress | done
    created_at = db.Column(db.DateTime, default=utcnow)
    program = db.relationship("Program")


class AuditLog(db.Model):
    __tablename__ = "audit_log"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    action = db.Column(db.String(64), nullable=False)
    entity = db.Column(db.String(64))
    entity_id = db.Column(db.Integer)
    details = db.Column(JSON, default=dict)
    created_at = db.Column(db.DateTime, default=utcnow, index=True)
    user = db.relationship("User")


# ─── Геймификация: опыт, значки, путь сезона ─────────────────────────────
class XpEvent(db.Model):
    """Начисление опыта. ref - уникальный ключ факта у пользователя (lesson:12, sim:spike-line, step:fll:approved)."""
    __tablename__ = "xp_events"
    __table_args__ = (db.UniqueConstraint("user_id", "ref", name="uq_xp_user_ref"),)
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ref = db.Column(db.String(120), nullable=False)
    kind = db.Column(db.String(32), nullable=False)  # lesson | quiz | level | evidence | sim | step | streak
    xp = db.Column(db.Integer, nullable=False, default=0)
    title = db.Column(JSON, default=dict)
    created_at = db.Column(db.DateTime, default=utcnow, index=True)


class UserBadge(db.Model):
    __tablename__ = "user_badges"
    __table_args__ = (db.UniqueConstraint("user_id", "code", name="uq_badge_user_code"),)
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    code = db.Column(db.String(64), nullable=False)
    earned_at = db.Column(db.DateTime, default=utcnow)


class JourneyMark(db.Model):
    """Шаг пути сезона, отмеченный самим тренером (купили набор, собрали базу), с фото по желанию."""
    __tablename__ = "journey_marks"
    __table_args__ = (db.UniqueConstraint("user_id", "track", "step", name="uq_mark_user_step"),)
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    track = db.Column(db.String(32), nullable=False)
    step = db.Column(db.String(64), nullable=False)
    note = db.Column(db.Text)
    photo_id = db.Column(db.Integer, db.ForeignKey("evidence_files.id", ondelete="SET NULL"))
    created_at = db.Column(db.DateTime, default=utcnow)
    photo = db.relationship("EvidenceFile")


class SimSolve(db.Model):
    """Задание симулятора (SPIKE, FTC, Arduino), прошедшее автопроверку."""
    __tablename__ = "sim_solves"
    __table_args__ = (db.UniqueConstraint("user_id", "preset", name="uq_sim_user_preset"),)
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    preset = db.Column(db.String(64), nullable=False)
    solved_at = db.Column(db.DateTime, default=utcnow)
