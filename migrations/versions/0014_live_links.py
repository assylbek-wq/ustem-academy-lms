"""постоянные ссылки эфиров: /live/<slug> переадресует на текущий эфир

Revision ID: 0014_live_links
Revises: 0013_efir_studio
Create Date: 2026-10-30 10:30:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0014_live_links'
down_revision = '0013_efir_studio'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'live_links',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('slug', sa.String(64), nullable=False),
        sa.Column('target', sa.String(500), nullable=False),
        sa.Column('updated_by', sa.Integer()),
        sa.Column('updated_at', sa.DateTime()),
    )
    op.create_index('uq_live_links_slug', 'live_links', ['slug'], unique=True)


def downgrade():
    op.drop_index('uq_live_links_slug', table_name='live_links')
    op.drop_table('live_links')
