"""презентация эфира: слайды с окном камеры и QR (live_events.deck)

Revision ID: 0011_live_deck
Revises: 0010_live_builder
Create Date: 2026-10-28 06:00:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0011_live_deck'
down_revision = '0010_live_builder'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('live_events', sa.Column('deck', sa.JSON(), nullable=True))


def downgrade():
    op.drop_column('live_events', 'deck')
