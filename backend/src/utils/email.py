from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from src.settings import settings
import logging

logger = logging.getLogger(__name__)

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username or "user",
    MAIL_PASSWORD=settings.mail_password or "password",
    MAIL_FROM=settings.mail_from or "noreply@divyavaani.ai",
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server or "localhost",
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=settings.use_credentials,
    VALIDATE_CERTS=settings.validate_certs
)

async def send_password_reset_email(email: EmailStr, token: str):
    """Send password reset email."""
    if not settings.mail_server or settings.mail_server == "localhost":
        logger.warning(f"Mocking email to {email}. Token: {token}")
        return

    reset_link = f"{settings.next_public_api_base_url.replace(':8000', ':3000')}/reset-password?token={token}"
    
    html = f"""
    <h3>Password Reset Request</h3>
    <p>You requested a password reset for your DivyaVaani AI account.</p>
    <p>Click the link below to reset your password:</p>
    <a href="{reset_link}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    """

    message = MessageSchema(
        subject="DivyaVaani AI - Password Reset",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        # Don't raise, just log. In production alerting would be good.
