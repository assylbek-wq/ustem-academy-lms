"""подтверждение email: users.email_verified_at (у уже зарегистрированных - считаем подтвержденным)

Revision ID: 0009_email_verified
Revises: 0008_live
Create Date: 2026-10-27 05:00:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0009_email_verified'
down_revision = '0008_live'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(), nullable=True))
    op.execute("UPDATE users SET email_verified_at = COALESCE(created_at, CURRENT_TIMESTAMP)")


def downgrade():
    op.drop_column('users', 'email_verified_at')
