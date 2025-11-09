"""Logging configuration using loguru."""

import sys
from loguru import logger
from pathlib import Path


def setup_logger(log_dir: str = "logs", level: str = "INFO"):
    """Setup logger with file and console handlers."""
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True, parents=True)
    
    # Remove default handler
    logger.remove()
    
    # Console handler
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
        level=level,
        colorize=True
    )
    
    # File handler
    logger.add(
        log_path / "app_{time:YYYY-MM-DD}.log",
        rotation="00:00",
        retention="30 days",
        level=level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function} - {message}"
    )
    
    return logger


# Initialize logger
log = setup_logger()
