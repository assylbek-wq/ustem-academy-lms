"""конструктор эфиров: программа (блоки), тексты экрана, язык, автор, архив

Revision ID: 0010_live_builder
Revises: 0009_email_verified
Create Date: 2026-10-27 18:00:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0010_live_builder'
down_revision = '0009_email_verified'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('live_events', sa.Column('blocks', sa.JSON(), nullable=True))
    op.add_column('live_events', sa.Column('texts', sa.JSON(), nullable=True))
    op.add_column('live_events', sa.Column('lang', sa.String(length=8), nullable=False, server_default='kk'))
    op.add_column('live_events', sa.Column('created_by', sa.Integer(), nullable=True))
    op.add_column('live_events', sa.Column('archived', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade():
    for c in ('archived', 'created_by', 'lang', 'texts', 'blocks'):
        op.drop_column('live_events', c)
