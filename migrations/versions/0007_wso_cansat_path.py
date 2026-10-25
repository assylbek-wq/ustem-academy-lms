"""путь WSO CanSat: добавить в уже заполненную таблицу journey_paths (новые базы получают его из SEED_PATHS)

Revision ID: 0007_wso_cansat_path
Revises: 0006_wso_cubesat_path
Create Date: 2026-10-25 18:00:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0007_wso_cansat_path'
down_revision = '0006_wso_cubesat_path'
branch_labels = None
depends_on = None

paths = sa.table('journey_paths', sa.column('id', sa.Integer), sa.column('slug', sa.String), sa.column('kind', sa.String),
                 sa.column('title', sa.JSON), sa.column('subtitle', sa.JSON), sa.column('color', sa.String),
                 sa.column('programs', sa.JSON), sa.column('stages', sa.JSON), sa.column('status', sa.String),
                 sa.column('position', sa.Integer))


def upgrade():
    from app.game.tracks import WSO_CANSAT as p
    conn = op.get_bind()
    if not conn.execute(sa.select(sa.func.count()).select_from(paths)).scalar():
        return  # пустая база: seed() создаст все пути сам
    if conn.execute(sa.select(paths.c.id).where(paths.c.slug == p["code"])).first():
        return
    pos = conn.execute(sa.select(sa.func.max(paths.c.position))).scalar() or 0
    op.bulk_insert(paths, [{"slug": p["code"], "kind": "season", "title": p["title"], "subtitle": p["season"], "color": p["color"],
                            "programs": p["programs"], "stages": p["stages"], "status": "published", "position": pos + 1}])


def downgrade():
    op.execute(paths.delete().where(paths.c.slug == "wso-cansat"))
