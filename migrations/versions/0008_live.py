"""прямой эфир: события, вопросы викторины, зрители, ответы, вопросы спикеру

Revision ID: 0008_live
Revises: 0007_wso_cansat_path
Create Date: 2026-10-27 06:00:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0008_live'
down_revision = '0007_wso_cansat_path'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'live_events',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('slug', sa.String(64), nullable=False, unique=True),
        sa.Column('title', sa.JSON(), nullable=False),
        sa.Column('subtitle', sa.JSON()),
        sa.Column('youtube_id', sa.String(32)),
        sa.Column('starts_at', sa.DateTime()),
        sa.Column('screen_key', sa.String(64), nullable=False),
        sa.Column('state', sa.JSON(), nullable=False),
        sa.Column('links', sa.JSON()),
        sa.Column('created_at', sa.DateTime()),
    )
    op.create_table(
        'live_questions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('live_events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('key', sa.String(32), nullable=False),
        sa.Column('block', sa.Integer(), nullable=False),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('text', sa.JSON(), nullable=False),
        sa.Column('options', sa.JSON(), nullable=False),
        sa.Column('correct', sa.Integer(), nullable=False),
        sa.Column('note', sa.JSON()),
        sa.Column('seconds', sa.Integer(), nullable=False),
        sa.UniqueConstraint('event_id', 'key', name='uq_live_question_key'),
    )
    op.create_index('ix_live_questions_event_id', 'live_questions', ['event_id'])
    op.create_table(
        'live_viewers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('live_events.id', ondelete='CASCADE'), nullable=False),
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
        sa.Column('seconds', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('score', sa.Integer(), nullable=False, server_default='0'),
        sa.UniqueConstraint('event_id', 'user_id', name='uq_live_viewer'),
    )
    op.create_index('ix_live_viewers_event_id', 'live_viewers', ['event_id'])
    op.create_index('ix_live_viewers_user_id', 'live_viewers', ['user_id'])
    op.create_index('ix_live_viewers_last_seen', 'live_viewers', ['last_seen'])
    op.create_table(
        'live_answers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('live_events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_id', sa.Integer(), sa.ForeignKey('live_questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('choice', sa.Integer(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('points', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('ms', sa.Integer()),
        sa.Column('created_at', sa.DateTime()),
        sa.UniqueConstraint('question_id', 'user_id', name='uq_live_answer'),
    )
    op.create_index('ix_live_answers_event_id', 'live_answers', ['event_id'])
    op.create_index('ix_live_answers_question_id', 'live_answers', ['question_id'])
    op.create_table(
        'live_asks',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('live_events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('status', sa.String(16), nullable=False, server_default='new'),
        sa.Column('created_at', sa.DateTime()),
    )
    op.create_index('ix_live_asks_event_id', 'live_asks', ['event_id'])


def downgrade():
    for name in ('live_asks', 'live_answers', 'live_viewers', 'live_questions', 'live_events'):
        op.drop_table(name)
