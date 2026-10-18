"""Прогресс слушателя и правила завершения уровня.

Уровень считается пройденным, когда:
  1) все уроки отмечены пройденными (тесты - с баллом не ниже level.min_quiz_score),
  2) все задания приняты наставником,
  3) слушатель был на всех очных интенсивах когорты (если level.require_attendance).
Тогда запись в когорте завершается и автоматически выдается сертификат.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

from ..models import Attendance, Enrollment, Evidence, Lesson, LessonProgress, db, utcnow


@dataclass
class AssignmentState:
    assignment: object
    status: str  # todo | submitted | returned | accepted
    evidence: Evidence | None
    due: date | None
    overdue: bool


@dataclass
class EnrollmentState:
    lessons_total: int = 0
    lessons_done: int = 0
    done_lesson_ids: set = field(default_factory=set)
    scores: dict = field(default_factory=dict)
    assignments: list = field(default_factory=list)
    sessions_required: int = 0
    sessions_attended: int = 0
    next_lesson: Lesson | None = None

    @property
    def assignments_total(self) -> int:
        return len(self.assignments)

    @property
    def assignments_accepted(self) -> int:
        return sum(1 for a in self.assignments if a.status == "accepted")

    @property
    def attendance_ok(self) -> bool:
        return self.sessions_attended >= self.sessions_required

    @property
    def steps_total(self) -> int:
        return self.lessons_total + self.assignments_total + self.sessions_required

    @property
    def steps_done(self) -> int:
        return self.lessons_done + self.assignments_accepted + min(self.sessions_attended, self.sessions_required)

    @property
    def percent(self) -> int:
        return round(100 * self.steps_done / self.steps_total) if self.steps_total else 0

    @property
    def complete(self) -> bool:
        return (self.steps_total > 0 and self.lessons_done == self.lessons_total
                and self.assignments_accepted == self.assignments_total and self.attendance_ok)

    @property
    def next_assignment(self):
        for a in self.assignments:
            if a.status in ("todo", "returned"):
                return a
        return None


def latest_evidence(enr: Enrollment, assignment_id: int) -> Evidence | None:
    rows = [e for e in enr.evidence if e.assignment_id == assignment_id]
    return max(rows, key=lambda e: e.attempt) if rows else None


def lesson_done(level, lp: LessonProgress | None) -> bool:
    if not lp or not lp.completed_at:
        return False
    if lp.lesson.kind == "quiz":
        return (lp.quiz_score or 0) >= level.min_quiz_score
    return True


def state(enr: Enrollment) -> EnrollmentState:
    cohort = enr.cohort
    level = cohort.level
    st = EnrollmentState()
    by_lesson = {p.lesson_id: p for p in enr.progress}
    for lesson in level.lessons:
        st.lessons_total += 1
        lp = by_lesson.get(lesson.id)
        if lp and lp.quiz_score is not None:
            st.scores[lesson.id] = lp.quiz_score
        if lesson_done(level, lp):
            st.lessons_done += 1
            st.done_lesson_ids.add(lesson.id)
        elif st.next_lesson is None:
            st.next_lesson = lesson
    today = date.today()
    for a in level.assignments:
        ev = latest_evidence(enr, a.id)
        status = ev.status if ev else "todo"
        due = cohort.due_date(a)
        st.assignments.append(AssignmentState(
            assignment=a, status=status, evidence=ev, due=due,
            overdue=bool(due and due < today and status in ("todo", "returned"))))
    if level.require_attendance:
        intensive = [s for s in cohort.sessions if s.kind == "intensive"]
        st.sessions_required = len(intensive)
        if intensive:
            ids = {s.id for s in intensive}
            st.sessions_attended = Attendance.query.filter(
                Attendance.enrollment_id == enr.id, Attendance.present.is_(True),
                Attendance.session_id.in_(ids)).count()
    return st


def maybe_complete(enr: Enrollment, issued_by: int | None = None):
    """Завершает уровень и выдает сертификат, если все условия выполнены. Возвращает сертификат или None."""
    if enr.status != "active":
        return None
    st = state(enr)
    if not st.complete:
        return None
    from .certificates import issue_for_enrollment
    from ..core import notify
    from ..i18n import t
    enr.status = "completed"
    enr.completed_at = utcnow()
    cert = issue_for_enrollment(enr, issued_by=issued_by)
    notify(enr.user_id, "certificate", t("notify.certificate", locale=enr.user.locale),
           url=f"/my/certificates")
    db.session.flush()
    return cert


def cohort_summary(cohort) -> dict:
    """Сводка по когорте для тренера, админа и заказчика."""
    rows = []
    for enr in sorted(cohort.enrollments, key=lambda e: (e.user.full_name or "").lower()):
        if enr.status == "dropped":
            continue
        rows.append((enr, state(enr)))
    n = len(rows)
    completed = sum(1 for e, _ in rows if e.status == "completed")
    avg = round(sum(s.percent for _, s in rows) / n) if n else 0
    pending_reviews = sum(1 for _, s in rows for a in s.assignments if a.status == "submitted")
    sessions = [s for s in cohort.sessions]
    att_total = att_present = 0
    for s in sessions:
        if s.starts_at <= utcnow():
            att_total += n
            att_present += sum(1 for a in s.attendance if a.present and a.enrollment.status != "dropped")
    return {
        "rows": rows, "count": n, "completed": completed, "avg_percent": avg,
        "pending_reviews": pending_reviews,
        "attendance_percent": round(100 * att_present / att_total) if att_total else None,
    }
