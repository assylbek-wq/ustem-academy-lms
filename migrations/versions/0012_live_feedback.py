"""эфиры: отзывы участников (live_feedback) и скрытые авторы вопросов (live_viewers.muted)

Revision ID: 0012_live_feedback
Revises: 0011_live_deck
Create Date: 2026-10-28 19:00:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0012_live_feedback'
down_revision = '0011_live_deck'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('live_viewers', sa.Column('muted', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_table(
        'live_feedback',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('live_events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('liked', sa.JSON()),
        sa.Column('improve', sa.JSON()),
        sa.Column('comment', sa.Text()),
        sa.Column('topics', sa.Text()),
        sa.Column('created_at', sa.DateTime()),
        sa.Column('updated_at', sa.DateTime()),
    )
    op.create_index('ix_live_feedback_event_id', 'live_feedback', ['event_id'])
    op.create_index('uq_live_feedback', 'live_feedback', ['event_id', 'user_id'], unique=True)


def downgrade():
    op.drop_index('uq_live_feedback', table_name='live_feedback')
    op.drop_index('ix_live_feedback_event_id', table_name='live_feedback')
    op.drop_table('live_feedback')
    op.drop_column('live_viewers', 'muted')
