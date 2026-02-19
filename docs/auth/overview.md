# Authentication: Overview

DivyaVaani AI uses a secure authentication system based on JSON Web Tokens (JWT) and a dual-authentication strategy: traditional Email/Password and modern Google OAuth 2.0.

## Authentication Flows

### 1. Traditional Email/Password
Users can register with their email and a secure password. Upon successful login, the system issues a JWT `access_token` that must be included in the `Authorization` header for protected endpoints.

- **Registration**: Includes a welcome email upon successful signup.
- **Login**: Validates credentials and returns a bearer token.
- **Password Management**: Includes "Forgot Password" functionality via email and an in-app password update feature.

### 2. Google OAuth 2.0
Supports seamless one-tap login using the `google-credential` flow. The backend verifies the Google access token and automatically creates a new user account if one doesn't exist.

- **Account Merging**: If a user exists with the same email but hasn't linked Google, the system securely merges the accounts.
- **Automatic Profiling**: Pulls full name and avatar directly from Google.

## Security Features

- **JWT Tokens**: Bearer tokens are signed using the `HS256` algorithm with a secure secret key.
- **Password Hashing**: Traditional passwords are never stored in plain text; they are hashed using `bcrypt` (via `passlib`).
- **Rate Limiting**: Auth endpoints are protected by rate limiters to prevent brute-force attacks.
- **CORS Protection**: Access is restricted to trusted origins (configured via `CORS_ORIGINS`).

## Using the API

All protected endpoints require the following header:

```http
Authorization: Bearer <your_access_token>
```

Tokens are valid for **30 minutes** (configurable) and must be refreshed by re-logging.
