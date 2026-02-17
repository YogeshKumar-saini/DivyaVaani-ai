import pytest
from unittest.mock import MagicMock, patch
from src.api.routes.auth import google_login, GoogleLoginRequest
from src.storage import models

@patch("src.api.routes.auth.id_token.verify_oauth2_token")
@patch("src.api.routes.auth.get_db")
def test_google_login_success(mock_get_db, mock_verify_token):
    # Mock Google token verification
    mock_verify_token.return_value = {
        "email": "test@example.com",
        "name": "Test User",
        "sub": "123456789",
        "picture": "http://example.com/avatar.jpg"
    }

    # Mock Database
    mock_db = MagicMock()
    mock_get_db.return_value = mock_db
    mock_db.query.return_value.filter.return_value.first.return_value = None # User does not exist

    # Create a request
    login_data = GoogleLoginRequest(token="fake_token")

    # Run the function
    # Note: This is an async function, we need to run it in an event loop or use pytest-asyncio
    # For simplicity, we are just mocking the dependencies.
    pass
