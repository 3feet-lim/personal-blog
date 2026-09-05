"""rename member role to viewer

Introduces the admin/maintainer/viewer taxonomy. Existing `member` users
become `viewer` (least privilege); `admin` is unchanged. Writers are granted
`maintainer` individually afterwards.

Revision ID: a1b2c3d4e5f6
Revises: 4165665984d6
Create Date: 2026-08-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '4165665984d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE users SET role = 'viewer' WHERE role = 'member'")


def downgrade() -> None:
    op.execute("UPDATE users SET role = 'member' WHERE role = 'viewer'")
