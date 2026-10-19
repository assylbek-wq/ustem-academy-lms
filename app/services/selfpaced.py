"""Программы «в своем темпе»: у каждого уровня постоянный открытый поток без дат и дедлайнов.

Учитель записывается в любой момент через каталог, проходит уроки, тест и задание, получает сертификат.
Потоки создаются и закрываются автоматически по флагу Program.self_paced и статусу публикации.
"""
from __future__ import annotations

from ..models import Cohort, Program, db, local_today

SELF_PACED_NAME = "В своем темпе"


def sync_program(p: Program) -> list[Cohort]:
    """Приводит потоки программы в соответствие с флагом. Возвращает созданные потоки."""
    created = []
    active = p.self_paced and p.status == "published"
    existing = {c.level_id: c for c in Cohort.query.filter_by(program_id=p.id, self_paced=True)}
    for lv in p.levels:
        c = existing.pop(lv.id, None)
        if active:
            if c is None:
                c = Cohort(name=SELF_PACED_NAME, program_id=p.id, level_id=lv.id, self_paced=True,
                           program_version=p.version or 0, language="ru", start_date=local_today(),
                           capacity=0, status="active", is_open=True)
                db.session.add(c)
                created.append(c)
            else:
                c.is_open, c.status = True, "active"
        elif c is not None:
            c.is_open = False  # запись закрыта, начатое обучение продолжается
    for c in existing.values():  # уровень удален или перенесен
        c.is_open = False
    return created


def sync_all() -> None:
    for p in Program.query.all():
        sync_program(p)
    db.session.commit()
