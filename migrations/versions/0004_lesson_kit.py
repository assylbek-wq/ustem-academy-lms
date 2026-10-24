"""lesson kit: урок под ключ

Revision ID: 0004_lesson_kit
Revises: 0003_gamification
Create Date: 2026-10-24 17:40:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0004_lesson_kit'
down_revision = '0003_gamification'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('lessons', sa.Column('kit', sa.JSON(), nullable=True))


def downgrade():
    with op.batch_alter_table('lessons', schema=None) as batch_op:
        batch_op.drop_column('kit')
