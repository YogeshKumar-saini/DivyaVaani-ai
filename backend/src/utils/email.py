"""
Email service using fastapi-mail (SMTP).

Reads SMTP credentials from settings (which maps SMTP_* env vars).
All send functions are async and safe – they log errors instead of raising
so that email failures never break the request flow.
"""

import logging
from typing import Optional

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr

from src.settings import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_email_configured() -> bool:
    """Return True when all required SMTP settings are present."""
    return bool(
        settings.mail_server
        and settings.mail_server not in ("", "localhost")
        and settings.mail_username
        and settings.mail_password
    )


def _get_connection_config() -> ConnectionConfig:
    """Build fastapi-mail ConnectionConfig from settings."""
    # Strip display-name wrapper from mail_from if present
    # e.g. "Kirata <foo@bar.com>" → "foo@bar.com"
    raw_from = settings.mail_from or settings.mail_username or "noreply@divyavaani.ai"
    if "<" in raw_from and ">" in raw_from:
        mail_from_addr = raw_from.split("<")[1].rstrip(">").strip()
    else:
        mail_from_addr = raw_from.strip()

    return ConnectionConfig(
        MAIL_USERNAME=settings.mail_username,
        MAIL_PASSWORD=settings.mail_password,
        MAIL_FROM=mail_from_addr,
        MAIL_FROM_NAME=settings.email_from_name,
        MAIL_PORT=settings.mail_port,
        MAIL_SERVER=settings.mail_server,
        MAIL_STARTTLS=settings.mail_starttls,
        MAIL_SSL_TLS=settings.mail_ssl_tls,
        USE_CREDENTIALS=settings.use_credentials,
        VALIDATE_CERTS=settings.validate_certs,
    )


def _get_frontend_base() -> str:
    """Return the frontend base URL.

    Set FRONTEND_URL in the backend .env / environment:
      - Local:      FRONTEND_URL=http://localhost:3000
      - Production: FRONTEND_URL=https://divya-vaani-ai.vercel.app
    """
    return (settings.frontend_url or "http://localhost:3000").rstrip("/")


# ---------------------------------------------------------------------------
# HTML template helpers
# ---------------------------------------------------------------------------

def _base_email_html(title: str, body_html: str) -> str:
    """Wrap body content in a branded HTML email template."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{title}</title>
  <style>
    body {{
      margin: 0; padding: 0;
      background: #0f0f1a;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #e2e8f0;
    }}
    .wrapper {{
      max-width: 600px;
      margin: 40px auto;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }}
    .header {{
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
      padding: 32px 40px;
      text-align: center;
    }}
    .header h1 {{
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.5px;
    }}
    .header p {{
      margin: 6px 0 0;
      font-size: 13px;
      color: rgba(255,255,255,0.75);
      letter-spacing: 1px;
      text-transform: uppercase;
    }}
    .content {{
      padding: 36px 40px;
    }}
    .content h2 {{
      margin-top: 0;
      font-size: 22px;
      color: #c4b5fd;
    }}
    .content p {{
      line-height: 1.7;
      color: #cbd5e1;
      font-size: 15px;
    }}
    .btn {{
      display: inline-block;
      margin: 24px 0;
      padding: 14px 32px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      letter-spacing: 0.3px;
    }}
    .divider {{
      border: none;
      border-top: 1px solid rgba(255,255,255,0.08);
      margin: 28px 0;
    }}
    .token-box {{
      background: rgba(99,102,241,0.12);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 8px;
      padding: 14px 20px;
      font-family: monospace;
      font-size: 14px;
      word-break: break-all;
      color: #a5b4fc;
      margin: 16px 0;
    }}
    .footer {{
      padding: 20px 40px;
      text-align: center;
      font-size: 12px;
      color: rgba(255,255,255,0.3);
      border-top: 1px solid rgba(255,255,255,0.06);
    }}
    .footer a {{ color: #8b5cf6; text-decoration: none; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🕉️ DivyaVaani AI</h1>
      <p>Sacred Knowledge · Wisdom · Guidance</p>
    </div>
    <div class="content">
      {body_html}
    </div>
    <div class="footer">
      <p>© 2025 DivyaVaani AI · <a href="{_get_frontend_base()}">divyavaani.ai</a></p>
      <p>This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>"""


# ---------------------------------------------------------------------------
# Public send functions
# ---------------------------------------------------------------------------

async def send_welcome_email(email: EmailStr, full_name: Optional[str] = None) -> None:
    """Send a welcome email after successful registration."""
    if not _is_email_configured():
        logger.warning(f"[EMAIL MOCK] Welcome email → {email} (SMTP not configured)")
        return

    name = full_name or email.split("@")[0]
    frontend_url = _get_frontend_base()

    body = f"""
    <h2>Welcome, {name}! 🙏</h2>
    <p>Thank you for joining <strong>DivyaVaani AI</strong> — your gateway to the timeless wisdom of the Bhagavad Gita and sacred Hindu scriptures.</p>
    <p>You can now:</p>
    <ul style="color:#cbd5e1; line-height:1.9; font-size:15px;">
      <li>💬 Ask questions and receive guidance from ancient wisdom</li>
      <li>🔊 Use voice mode for a richer, conversational experience</li>
      <li>🌐 Explore scriptures in multiple Indian languages</li>
      <li>📊 Track your learning journey in Analytics</li>
    </ul>
    <a href="{frontend_url}" class="btn">Start Exploring →</a>
    <hr class="divider"/>
    <p style="font-size:13px; color:#94a3b8;">
      If you didn't create this account, you can safely ignore this email.
    </p>
    """

    message = MessageSchema(
        subject="Welcome to DivyaVaani AI 🕉️",
        recipients=[email],
        body=_base_email_html("Welcome to DivyaVaani AI", body),
        subtype=MessageType.html,
    )

    try:
        fm = FastMail(_get_connection_config())
        await fm.send_message(message)
        logger.info(f"[EMAIL] Welcome email sent → {email}")
    except Exception as exc:
        logger.error(f"[EMAIL] Failed to send welcome email to {email}: {exc}")


async def send_password_reset_email(email: EmailStr, token: str) -> None:
    """Send a password-reset link email."""
    if not _is_email_configured():
        logger.warning(
            f"[EMAIL MOCK] Password-reset email → {email}  token={token} (SMTP not configured)"
        )
        return

    frontend_url = _get_frontend_base()
    reset_link = f"{frontend_url}/reset-password?token={token}"

    body = f"""
    <h2>Reset Your Password 🔐</h2>
    <p>We received a request to reset the password for your DivyaVaani AI account associated with <strong>{email}</strong>.</p>
    <p>Click the button below to create a new password. This link expires in <strong>30 minutes</strong>.</p>
    <a href="{reset_link}" class="btn">Reset My Password</a>
    <hr class="divider"/>
    <p style="font-size:13px; color:#94a3b8;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <div class="token-box">{reset_link}</div>
    <p style="font-size:13px; color:#94a3b8;">
      If you did not request a password reset, please ignore this email — your password will remain unchanged.
    </p>
    """

    message = MessageSchema(
        subject="DivyaVaani AI – Password Reset Request",
        recipients=[email],
        body=_base_email_html("Password Reset", body),
        subtype=MessageType.html,
    )

    try:
        fm = FastMail(_get_connection_config())
        await fm.send_message(message)
        logger.info(f"[EMAIL] Password-reset email sent → {email}")
    except Exception as exc:
        logger.error(f"[EMAIL] Failed to send password-reset email to {email}: {exc}")


async def send_password_changed_email(email: EmailStr, full_name: Optional[str] = None) -> None:
    """Notify user that their password was successfully changed."""
    if not _is_email_configured():
        logger.warning(f"[EMAIL MOCK] Password-changed notification → {email} (SMTP not configured)")
        return

    name = full_name or email.split("@")[0]
    frontend_url = _get_frontend_base()
    reset_link = f"{frontend_url}/forgot-password"

    body = f"""
    <h2>Password Changed Successfully ✅</h2>
    <p>Hi <strong>{name}</strong>,</p>
    <p>Your DivyaVaani AI account password was just changed successfully.</p>
    <p>If you made this change, no further action is needed.</p>
    <hr class="divider"/>
    <p style="color:#f87171; font-size:14px;">
      ⚠️ <strong>Didn't change your password?</strong> Your account may be compromised.
      Please reset it immediately:
    </p>
    <a href="{reset_link}" class="btn" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
      Secure My Account
    </a>
    """

    message = MessageSchema(
        subject="DivyaVaani AI – Password Changed",
        recipients=[email],
        body=_base_email_html("Password Changed", body),
        subtype=MessageType.html,
    )

    try:
        fm = FastMail(_get_connection_config())
        await fm.send_message(message)
        logger.info(f"[EMAIL] Password-changed notification sent → {email}")
    except Exception as exc:
        logger.error(f"[EMAIL] Failed to send password-changed email to {email}: {exc}")


async def send_email_verification(email: EmailStr, token: str, full_name: Optional[str] = None) -> None:
    """Send an email-verification link (for future use)."""
    if not _is_email_configured():
        logger.warning(f"[EMAIL MOCK] Verification email → {email}  token={token} (SMTP not configured)")
        return

    name = full_name or email.split("@")[0]
    frontend_url = _get_frontend_base()
    verify_link = f"{frontend_url}/verify-email?token={token}"

    body = f"""
    <h2>Verify Your Email Address 📧</h2>
    <p>Hi <strong>{name}</strong>,</p>
    <p>Please verify your email address to activate all features of your DivyaVaani AI account.</p>
    <a href="{verify_link}" class="btn">Verify Email Address</a>
    <hr class="divider"/>
    <p style="font-size:13px; color:#94a3b8;">
      If the button doesn't work, copy and paste this link:<br/>
    </p>
    <div class="token-box">{verify_link}</div>
    <p style="font-size:13px; color:#94a3b8;">
      This link expires in 24 hours. If you didn't create an account, please ignore this email.
    </p>
    """

    message = MessageSchema(
        subject="DivyaVaani AI – Verify Your Email",
        recipients=[email],
        body=_base_email_html("Verify Email", body),
        subtype=MessageType.html,
    )

    try:
        fm = FastMail(_get_connection_config())
        await fm.send_message(message)
        logger.info(f"[EMAIL] Verification email sent → {email}")
    except Exception as exc:
        logger.error(f"[EMAIL] Failed to send verification email to {email}: {exc}")
