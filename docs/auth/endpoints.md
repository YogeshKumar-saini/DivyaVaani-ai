# Authentication: Endpoints

All endpoints have the base prefix: `/auth`

## 1. Google Login
`POST /auth/google`

Authenticates a user via Google Sign-In access token.

- **Request Body (JSON)**:
```json
{
  "token": "string (Required - Google access token)"
}
```

- **Success Response (200 OK)**:
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

## 2. Register User
`POST /auth/register`

Creates a new user account with email and password.

- **Request Body (JSON)**:
```json
{
  "email": "string (Required)",
  "password": "string (Required)",
  "full_name": "string (Optional)"
}
```

- **Success Response (200 OK)**: Returns the created user object without the password hash.

## 3. Login (Email/Password)
`POST /auth/token`

Standard login to obtain an access token.

- **Request Body (JSON)**:
```json
{
  "email": "string (Required)",
  "password": "string (Required)"
}
```

- **Success Response (200 OK)**:
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

## 4. Get Current User Profile
`GET /auth/me`

Retrieves the profile of the currently authenticated user.

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Success Response (200 OK)**:
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "is_active": true,
  "is_email_verified": true,
  "subscription_type": "free",
  "created_at": "ISO-datetime",
  "updated_at": "ISO-datetime"
}
```

## 5. Update Profile
`PUT /auth/users/me`

Updates profile details (full name and avatar).

- **Authentication**: Required
- **Request Body (JSON)**:
```json
{
  "full_name": "string (Optional)",
  "avatar_url": "string (Optional)"
}
```

## 6. Update Password
`PUT /auth/users/password`

- **Authentication**: Required
- **Request Body (JSON)**:
```json
{
  "old_password": "string (Required)",
  "new_password": "string (Required)"
}
```

## 7. Password Recovery
- **Forgot Password**: `POST /auth/forgot-password`
  ```json
  {"email": "user@example.com"}
  ```
- **Reset Password**: `POST /auth/reset-password`
  ```json
  {
    "token": "string",
    "new_password": "string"
  }
  ```
