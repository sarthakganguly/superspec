"""update_project_member_unique_role

Revision ID: 42efab078fdd
Revises: 861ef2acdb73
Create Date: 2026-10-31 13:28:28.216932

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '42efab078fdd'
down_revision: Union[str, None] = '861ef2acdb73'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('uq_project_member', 'project_members', type_='unique')
    op.create_unique_constraint('uq_project_member_role', 'project_members', ['project_id', 'user_id', 'role'])


def downgrade() -> None:
    op.drop_constraint('uq_project_member_role', 'project_members', type_='unique')
    op.create_unique_constraint('uq_project_member', 'project_members', ['project_id', 'user_id'])
