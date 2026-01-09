"""Logging configuration using loguru with structured logging support."""

import sys
import json
import os
from pathlib import Path
from typing import Dict, Any
from loguru import logger


# Simple logger setup to avoid circular imports
def setup_basic_logger():
    """Setup basic logger without config dependencies."""
    # Remove default handler
    logger.remove()

    # Basic console handler
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
        level="INFO",
        colorize=True
    )

    return logger


# Initialize with basic logger
log = setup_basic_logger()


def reconfigure_logger():
    """Reconfigure logger with settings after config is loaded."""
    try:
        from src.config import settings

        # Remove existing handlers
        logger.remove()

        log_path = Path(settings.log_dir)
        log_path.mkdir(exist_ok=True, parents=True)

        # Determine format based on settings
        if getattr(settings, 'enable_structured_logging', False):
            console_format = _structured_format
            file_format = _structured_format
        else:
            console_format = "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>"
            file_format = "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function} - {message}"

        # Console handler
        logger.add(
            sys.stdout,
            format=console_format,
            level=getattr(settings, 'log_level', 'INFO'),
            colorize=not getattr(settings, 'enable_structured_logging', False),
            serialize=getattr(settings, 'enable_structured_logging', False)
        )

        # File handler with rotation
        logger.add(
            log_path / "app_{time:YYYY-MM-DD}.log",
            rotation="00:00",
            retention="30 days",
            level=getattr(settings, 'log_level', 'INFO'),
            format=file_format,
            serialize=getattr(settings, 'enable_structured_logging', False),
            compression="gz"
        )

        # Error log handler (WARNING and above)
        logger.add(
            log_path / "error_{time:YYYY-MM-DD}.log",
            rotation="00:00",
            retention="90 days",
            level="WARNING",
            format=file_format,
            serialize=getattr(settings, 'enable_structured_logging', False),
            compression="gz"
        )

    except ImportError:
        # Config not available yet, keep basic logger
        pass


def _structured_format(record):
    """Format log record as structured JSON."""
    structured_record = {
        "timestamp": record["time"].isoformat(),
        "level": record["level"].name,
        "logger": record["name"],
        "function": record["function"],
        "line": record["line"],
        "message": record["message"]
    }

    # Add extra fields if present
    if "extra" in record and record["extra"]:
        structured_record["extra"] = record["extra"]

    # Add exception info if present
    if record["exception"]:
        structured_record["exception"] = {
            "type": record["exception"].type.__name__,
            "value": str(record["exception"].value),
            "traceback": record["exception"].traceback
        }

    return json.dumps(structured_record, default=str)


class StructuredLogger:
    """Enhanced logger with structured logging capabilities."""

    def log_request(self, method: str, path: str, status_code: int, duration: float, user_id: str = None, metadata: Dict[str, Any] = None):
        """Log HTTP request with structured data."""
        logger.bind(
            request={
                "method": method,
                "path": path,
                "status_code": status_code,
                "duration": duration,
                "user_id": user_id,
                **(metadata or {})
            }
        ).info("HTTP Request")

    def log_error(self, error: Exception, context: Dict[str, Any] = None):
        """Log error with context."""
        logger.bind(error_context=context).error(f"{error.__class__.__name__}: {str(error)}")

    def log_performance(self, operation: str, duration: float, metadata: Dict[str, Any] = None):
        """Log performance metrics."""
        logger.bind(
            performance={
                "operation": operation,
                "duration": duration,
                **(metadata or {})
            }
        ).info("Performance Metric")


# Global structured logger instance
structured_logger = StructuredLogger()
