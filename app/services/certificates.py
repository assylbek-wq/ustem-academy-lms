"""Сертификаты: выдача со снапшотом данных и PDF с QR-кодом проверки."""
from __future__ import annotations

import io
import math
from pathlib import Path

import segno
from fpdf import FPDF

from ..core import loc
from ..i18n import t
from ..models import Certificate, Enrollment, db

STATIC = Path(__file__).resolve().parent.parent / "static"
BRAND = (0, 133, 255)
INK = (17, 24, 28)
MUTED = (100, 116, 139)


ASSIGNMENT_MINUTES = 60  # практическое задание с разбором наставника


def course_hours(enr: Enrollment) -> int:
    level = enr.cohort.level
    minutes = sum(l.duration_min or 0 for l in level.lessons)
    minutes += ASSIGNMENT_MINUTES * len(level.assignments)
    for s in enr.cohort.sessions:
        if s.kind == "intensive" and s.ends_at and s.starts_at:
            minutes += max(0, int((s.ends_at - s.starts_at).total_seconds() // 60))
    return max(1, math.ceil(minutes / 60))


def _completed_key(cert: Certificate) -> str:
    """Текст сертификата по формату уровня: с очным интенсивом или полностью онлайн."""
    enr = db.session.get(Enrollment, cert.enrollment_id) if cert.enrollment_id else None
    if enr is None:
        return "cert.pdf.completed_generic"
    had_intensive = enr.cohort.level.require_attendance and any(s.kind == "intensive" for s in enr.cohort.sessions)
    has_practice = bool(enr.cohort.level.assignments)
    if had_intensive:
        return "cert.pdf.completed"
    return "cert.pdf.completed_online" if has_practice else "cert.pdf.completed_generic"


def issue_for_enrollment(enr: Enrollment, issued_by: int | None = None) -> Certificate:
    existing = Certificate.query.filter_by(enrollment_id=enr.id, status="valid").first()
    if existing:
        return existing
    c = enr.cohort
    cert = Certificate(
        user_id=enr.user_id, enrollment_id=enr.id, recipient_name=enr.user.full_name,
        program_title=dict(c.program.title or {}), level_title=dict(c.level.title or {}),
        level_number=c.level.number, cohort_name=c.name, hours=course_hours(enr), issued_by=issued_by,
    )
    db.session.add(cert)
    db.session.flush()
    return cert


def _qr_png(data: str) -> bytes:
    buf = io.BytesIO()
    segno.make(data, error="m").save(buf, kind="png", scale=8, border=1, dark="#11181c")
    return buf.getvalue()


def render_pdf(cert: Certificate, verify_url: str, locale: str = "ru") -> bytes:
    pdf = FPDF(orientation="L", unit="mm", format="A4")
    pdf.set_auto_page_break(False)
    pdf.add_font("Ustem", "", str(STATIC / "fonts" / "UstemSans.ttf"))
    pdf.add_font("Ustem", "B", str(STATIC / "fonts" / "UstemSans-Bold.ttf"))
    pdf.add_page()
    W, H = 297, 210

    # рамка и фирменная полоса
    pdf.set_fill_color(*BRAND)
    pdf.rect(0, 0, 12, H, "F")
    pdf.set_fill_color(240, 247, 255)
    pdf.rect(12, 0, W - 12, 34, "F")
    pdf.set_draw_color(225, 239, 255)
    pdf.set_line_width(0.6)
    pdf.rect(20, 42, W - 32, H - 54)

    logo = STATIC / "img" / "ustem-logo.png"
    if logo.exists():
        pdf.image(str(logo), x=24, y=8, h=18)
    pdf.set_font("Ustem", "B", 12)
    pdf.set_text_color(*BRAND)
    pdf.set_xy(W - 120, 12)
    pdf.cell(108, 10, "USTEM ACADEMY", align="R")

    pdf.set_text_color(*INK)
    pdf.set_font("Ustem", "B", 30)
    pdf.set_xy(30, 52)
    pdf.cell(W - 60, 14, t("cert.pdf.title", locale=locale).upper())

    pdf.set_font("Ustem", "", 12)
    pdf.set_text_color(*MUTED)
    pdf.set_xy(30, 70)
    pdf.cell(W - 60, 8, t("cert.pdf.awarded", locale=locale))

    pdf.set_text_color(*INK)
    pdf.set_font("Ustem", "B", 26)
    pdf.set_xy(30, 80)
    pdf.cell(W - 100, 14, cert.recipient_name)

    pdf.set_font("Ustem", "", 13)
    pdf.set_xy(30, 100)
    level = loc(cert.level_title, locale)
    program = loc(cert.program_title, locale)
    text = t(_completed_key(cert), locale=locale).format(level=level, number=cert.level_number, program=program)
    pdf.multi_cell(W - 110, 7, text)

    pdf.set_font("Ustem", "", 10.5)
    pdf.set_text_color(*MUTED)
    y = 132
    meta = [
        (t("cert.pdf.cohort", locale=locale), cert.cohort_name or "-"),
        (t("cert.pdf.hours", locale=locale), str(cert.hours or "-")),
        (t("cert.pdf.date", locale=locale), cert.issued_at.strftime("%d.%m.%Y")),
        (t("cert.pdf.number", locale=locale), cert.code),
    ]
    for label, value in meta:
        pdf.set_xy(30, y)
        pdf.set_text_color(*MUTED)
        pdf.cell(46, 6, label)
        pdf.set_text_color(*INK)
        pdf.cell(120, 6, value)
        y += 7

    # QR и подсказка
    qr = _qr_png(verify_url)
    pdf.image(io.BytesIO(qr), x=W - 72, y=96, w=44, h=44)
    pdf.set_font("Ustem", "", 8.5)
    pdf.set_text_color(*MUTED)
    pdf.set_xy(W - 80, 142)
    pdf.multi_cell(60, 4.2, t("cert.pdf.verify", locale=locale), align="C")

    pdf.set_draw_color(*INK)
    pdf.set_line_width(0.3)
    pdf.line(30, 182, 100, 182)
    pdf.set_xy(30, 184)
    pdf.set_font("Ustem", "", 9)
    pdf.cell(80, 5, t("cert.pdf.signature", locale=locale))

    if cert.status == "revoked":
        pdf.set_text_color(225, 29, 72)
        pdf.set_font("Ustem", "B", 40)
        pdf.set_xy(0, 92)
        pdf.cell(W, 20, t("cert.revoked", locale=locale).upper(), align="C")

    return bytes(pdf.output())
