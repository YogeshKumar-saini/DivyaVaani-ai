"""Core exception classes for API error handling."""

class APIError(Exception):
    """Base API error with structured error information."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(APIError):
    """Validation error for input data."""

    def __init__(self, field: str, message: str):
        super().__init__(
            code="VALIDATION_ERROR",
            message=f"{field}: {message}",
            status_code=400
        )


class ProcessingError(APIError):
    """Error during processing operations."""

    def __init__(self, operation: str, message: str):
        super().__init__(
            code="PROCESSING_ERROR",
            message=f"{operation}: {message}",
            status_code=500
        )


class ServiceUnavailableError(APIError):
    """Service temporarily unavailable."""

    def __init__(self, service: str, message: str = "Service temporarily unavailable"):
        super().__init__(
            code="SERVICE_UNAVAILABLE",
            message=f"{service}: {message}",
            status_code=503
        )


class RateLimitError(APIError):
    """Rate limit exceeded."""

    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(
            code="RATE_LIMIT_EXCEEDED",
            message=message,
            status_code=429
        )
