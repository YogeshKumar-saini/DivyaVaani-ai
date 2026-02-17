"""Authentication routes."""

from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
import secrets
import string

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

class GoogleLoginRequest(BaseModel):
    token: str

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/google", response_model=Token)
async def google_login(
    login_data: GoogleLoginRequest,
    db: Session = Depends(get_db),
) -> Any:
    """Login with Google."""
    try:
        if not settings.google_client_id:
             raise HTTPException(
                status_code=500,
                detail="Google Client ID not configured",
            )

        # Verify the token
        id_info = id_token.verify_oauth2_token(
            login_data.token, 
            requests.Request(), 
            settings.google_client_id
        )

        email = id_info['email']
        name = id_info.get('name', '')
        google_id = id_info['sub']
        avatar_url = id_info.get('picture', '')

        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()

        if not user:
            # Create new user
            now = datetime.utcnow()
            # Generate a random password for Google users
            random_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for i in range(20))
            
            user = models.User(
                email=email,
                password_hash=get_password_hash(random_password),
                full_name=name,
                google_id=google_id,
                avatar_url=avatar_url,
                is_active=True,
                is_email_verified=True,  # Google emails are verified
                created_at=now,
                updated_at=now,
                email_verified_at=now
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update existing user's Google ID if not set
            if not user.google_id:
                user.google_id = google_id
                user.is_email_verified = True # Trust google verification
                if not user.avatar_url:
                    user.avatar_url = avatar_url
                db.commit()

        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


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

@router.post("/forgot-password", status_code=202)
async def forgot_password(
    request: models.PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request a password reset email."""
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        # Return 202 even if user doesn't exist to prevent enumeration
        return {"message": "If the email exists, a reset link has been sent."}
    
    # Generate token
    token = secrets.token_urlsafe(32)
    user.reset_pass_token = token
    user.reset_pass_token_expire = datetime.utcnow() + timedelta(minutes=30)
    db.commit()
    
    # Send email (background task would be better but simple await for now)
    from src.utils.email import send_password_reset_email
    await send_password_reset_email(request.email, token)
    
    return {"message": "If the email exists, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(
    request: models.PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Reset password using token."""
    user = db.query(models.User).filter(
        models.User.reset_pass_token == request.token,
        models.User.reset_pass_token_expire > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user.password_hash = get_password_hash(request.new_password)
    user.reset_pass_token = None
    user.reset_pass_token_expire = None
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.put("/users/me", response_model=User)
async def update_user_me(
    user_update: models.UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
        
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/users/password")
async def update_password(
    password_update: models.PasswordUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user password."""
    if not verify_password(password_update.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect old password")
        
    current_user.password_hash = get_password_hash(password_update.new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Password updated successfully"}
