"""студия эфиров: видео для сцены «Видео» (efir_events.videos)

Revision ID: 0015_efir_videos
Revises: 0014_live_links
Create Date: 2026-10-30 12:00:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0015_efir_videos'
down_revision = '0014_live_links'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('efir_events', sa.Column('videos', sa.JSON()))


def downgrade():
    op.drop_column('efir_events', 'videos')
