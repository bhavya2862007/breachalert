from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User


async def get_current_user(
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Temporary authentication dependency.

    Right now it simply returns the first user in the database so we can
    finish building the backend.

    We'll replace this later with proper JWT authentication.
    """

    user = await db.get(User, 1)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication not configured yet.",
        )

    return user