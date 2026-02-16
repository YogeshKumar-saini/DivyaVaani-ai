"""Authentication routes."""

from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.models import Token, User, UserCreate
from src.security.auth import (
    create_access_token,
    get_current_active_user,
    get_password_hash,
    verify_password,
)
from src.settings import settings
from src.storage.database import get_db
from src.storage import models

# Login request model
class LoginRequest(BaseModel):
    email: str
    password: str

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=User)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """Create new user."""
    try:
        user = db.query(models.User).filter(models.User.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
        
        now = datetime.utcnow()
        db_user = models.User(
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            created_at=now,
            updated_at=now,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/token", response_model=Token)
async def login_access_token(
    login_data: LoginRequest,
    db: Session = Depends(get_db), 
) -> Any:
    """Login endpoint to get access token."""
    # Try to authenticate with email 
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=User)
async def read_users_me(
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """Get current user."""
    return current_user
