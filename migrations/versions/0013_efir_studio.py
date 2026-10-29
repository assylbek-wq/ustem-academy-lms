"""студия эфиров /efir: копия таблиц эфиров (efir_*) + спикеры по ссылке и эфир в YouTube с видеосервера

Revision ID: 0013_efir_studio
Revises: 0012_live_feedback
Create Date: 2026-10-30 10:00:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0013_efir_studio'
down_revision = '0012_live_feedback'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'efir_events',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('slug', sa.String(64), nullable=False),
        sa.Column('title', sa.JSON(), nullable=False),
        sa.Column('subtitle', sa.JSON()),
        sa.Column('youtube_id', sa.String(32)),
        sa.Column('starts_at', sa.DateTime()),
        sa.Column('screen_key', sa.String(64), nullable=False),
        sa.Column('state', sa.JSON(), nullable=False),
        sa.Column('links', sa.JSON()),
        sa.Column('blocks', sa.JSON()),
        sa.Column('texts', sa.JSON()),
        sa.Column('deck', sa.JSON()),
        sa.Column('lang', sa.String(8), nullable=False, server_default='kk'),
        sa.Column('created_by', sa.Integer()),
        sa.Column('archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('guest_key', sa.String(64), nullable=False),
        sa.Column('stage', sa.JSON()),
        sa.Column('stream_url', sa.String(255)),
        sa.Column('stream_key', sa.String(255)),
        sa.Column('egress', sa.JSON()),
        sa.Column('created_at', sa.DateTime()),
        sa.UniqueConstraint('slug'),
    )
    op.create_table(
        'efir_questions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('efir_events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('key', sa.String(32), nullable=False),
        sa.Column('block', sa.Integer(), nullable=False),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('text', sa.JSON(), nullable=False),
        sa.Column('options', sa.JSON(), nullable=False),
        sa.Column('correct', sa.Integer(), nullable=False),
        sa.Column('note', sa.JSON()),
        sa.Column('seconds', sa.Integer(), nullable=False),
        sa.UniqueConstraint('event_id', 'key', name='uq_efir_question_key'),
    )
    op.create_index('ix_efir_questions_event_id', 'efir_questions', ['event_id'])
    op.create_table(
        'efir_viewers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('efir_events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('region', sa.String(64)),
        sa.Column('city', sa.String(128)),
        sa.Column('school', sa.String(255)),
        sa.Column('subjects', sa.JSON()),
        sa.Column('position', sa.String(32)),
        sa.Column('robotics', sa.String(32)),
        sa.Column('profile_at', sa.DateTime()),
        sa.Column('first_seen', sa.DateTime()),
        sa.Column('last_seen', sa.DateTime()),
        sa.Column('seconds', sa.Integer(), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('muted', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.UniqueConstraint('event_id', 'user_id', name='uq_efir_viewer'),
    )
    op.create_index('ix_efir_viewers_user_id', 'efir_viewers', ['user_id'])
    op.create_index('ix_efir_viewers_event_id', 'efir_viewers', ['event_id'])
    op.create_index('ix_efir_viewers_last_seen', 'efir_viewers', ['last_seen'])
    op.create_table(
        'efir_answers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('efir_events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_id', sa.Integer(), sa.ForeignKey('efir_questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('choice', sa.Integer(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.Column('ms', sa.Integer()),
        sa.Column('created_at', sa.DateTime()),
        sa.UniqueConstraint('question_id', 'user_id', name='uq_efir_answer'),
    )
    op.create_index('ix_efir_answers_event_id', 'efir_answers', ['event_id'])
    op.create_index('ix_efir_answers_question_id', 'efir_answers', ['question_id'])
    op.create_table(
        'efir_feedback',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('efir_events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('liked', sa.JSON()),
        sa.Column('improve', sa.JSON()),
        sa.Column('comment', sa.Text()),
        sa.Column('topics', sa.Text()),
        sa.Column('created_at', sa.DateTime()),
        sa.Column('updated_at', sa.DateTime()),
    )
    op.create_index('uq_efir_feedback', 'efir_feedback', ['event_id', 'user_id'], unique=True)
    op.create_index('ix_efir_feedback_event_id', 'efir_feedback', ['event_id'])
    op.create_table(
        'efir_asks',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('efir_events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('status', sa.String(16), nullable=False),
        sa.Column('created_at', sa.DateTime()),
    )
    op.create_index('ix_efir_asks_event_id', 'efir_asks', ['event_id'])


def downgrade():
    op.drop_table('efir_asks')
    op.drop_table('efir_feedback')
    op.drop_table('efir_answers')
    op.drop_table('efir_viewers')
    op.drop_table('efir_questions')
    op.drop_table('efir_events')
