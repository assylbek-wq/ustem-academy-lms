"""journey paths: пути сезонов из Студии, выбор путей тренером

Revision ID: 0005_journey_paths
Revises: 0004_lesson_kit
Create Date: 2026-10-24 23:40:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0005_journey_paths'
down_revision = '0004_lesson_kit'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('journey_paths',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=40), nullable=False),
    sa.Column('kind', sa.String(length=16), nullable=False),
    sa.Column('title', sa.JSON(), nullable=False),
    sa.Column('subtitle', sa.JSON(), nullable=True),
    sa.Column('color', sa.String(length=16), nullable=True),
    sa.Column('programs', sa.JSON(), nullable=True),
    sa.Column('stages', sa.JSON(), nullable=False),
    sa.Column('status', sa.String(length=16), nullable=False),
    sa.Column('position', sa.Integer(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('slug')
    )
    op.create_table('user_paths',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('key', sa.String(length=80), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'key', name='uq_user_path')
    )
    op.create_index('ix_user_paths_user_id', 'user_paths', ['user_id'], unique=False)
    # без batch_alter_table: см. CLAUDE.md (каскадное удаление в SQLite)
    op.add_column('users', sa.Column('journey_setup_at', sa.DateTime(), nullable=True))


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('journey_setup_at')
    op.drop_index('ix_user_paths_user_id', table_name='user_paths')
    op.drop_table('user_paths')
    op.drop_table('journey_paths')
