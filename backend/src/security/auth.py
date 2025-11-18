"""Authentication and authorization management."""

import hashlib
import secrets
import time
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import jwt
import logging

logger = logging.getLogger(__name__)

class AuthenticationManager:
    """Handle user authentication and session management."""

    def __init__(self, secret_key: str, token_expiry: int = 3600):
        self.secret_key = secret_key
        self.token_expiry = token_expiry
        self.users = {}  # In production, use a database
        self.sessions = {}

    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256."""
        return hashlib.sha256(password.encode()).hexdigest()

    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash."""
        return self.hash_password(password) == hashed

    def create_user(self, username: str, password: str, email: str = "") -> Dict[str, Any]:
        """Create a new user account."""
        if username in self.users:
            raise ValueError("User already exists")

        user = {
            "username": username,
            "password_hash": self.hash_password(password),
            "email": email,
            "created_at": datetime.now(),
            "is_active": True,
            "role": "user"
        }

        self.users[username] = user
        logger.info(f"Created user: {username}")
        return {"username": username, "created": True}

    def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user credentials."""
        user = self.users.get(username)
        if not user or not user.get("is_active"):
            return None

        if not self.verify_password(password, user["password_hash"]):
            return None

        # Create session token
        token = self._create_token(username)
        session_id = secrets.token_urlsafe(32)

        self.sessions[session_id] = {
            "username": username,
            "token": token,
            "created_at": datetime.now(),
            "expires_at": datetime.now() + timedelta(seconds=self.token_expiry)
        }

        return {
            "username": username,
            "token": token,
            "session_id": session_id,
            "expires_in": self.token_expiry
        }

    def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate JWT token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])

            # Check expiry
            if datetime.fromtimestamp(payload["exp"]) < datetime.now():
                return None

            username = payload["username"]
            user = self.users.get(username)

            if not user or not user.get("is_active"):
                return None

            return {
                "username": username,
                "role": user.get("role", "user"),
                "valid": True
            }

        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def validate_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Validate session."""
        session = self.sessions.get(session_id)
        if not session:
            return None

        if session["expires_at"] < datetime.now():
            # Clean up expired session
            del self.sessions[session_id]
            return None

        return self.validate_token(session["token"])

    def logout_user(self, session_id: str) -> bool:
        """Logout user by invalidating session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def _create_token(self, username: str) -> str:
        """Create JWT token."""
        payload = {
            "username": username,
            "exp": int((datetime.now() + timedelta(seconds=self.token_expiry)).timestamp()),
            "iat": int(datetime.now().timestamp())
        }

        return jwt.encode(payload, self.secret_key, algorithm="HS256")

    def get_user_permissions(self, username: str) -> list:
        """Get user permissions based on role."""
        user = self.users.get(username)
        if not user:
            return []

        role = user.get("role", "user")
        permissions = {
            "admin": ["read", "write", "delete", "admin"],
            "moderator": ["read", "write", "moderate"],
            "user": ["read", "write"]
        }

        return permissions.get(role, ["read"])

    def change_password(self, username: str, old_password: str, new_password: str) -> bool:
        """Change user password."""
        user = self.users.get(username)
        if not user:
            return False

        if not self.verify_password(old_password, user["password_hash"]):
            return False

        user["password_hash"] = self.hash_password(new_password)
        logger.info(f"Password changed for user: {username}")
        return True

    def cleanup_expired_sessions(self):
        """Clean up expired sessions."""
        expired = []
        for session_id, session in self.sessions.items():
            if session["expires_at"] < datetime.now():
                expired.append(session_id)

        for session_id in expired:
            del self.sessions[session_id]

        if expired:
            logger.info(f"Cleaned up {len(expired)} expired sessions")

    def get_auth_stats(self) -> Dict[str, Any]:
        """Get authentication statistics."""
        self.cleanup_expired_sessions()

        return {
            "total_users": len(self.users),
            "active_users": len([u for u in self.users.values() if u.get("is_active")]),
            "active_sessions": len(self.sessions),
            "session_expiry_seconds": self.token_expiry
        }
