# Use Python 3.10 slim image for a smaller footprint
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    NLTK_DATA=/home/appuser/nltk_data \
    HF_HOME=/home/appuser/cache/huggingface \
    TRANSFORMERS_CACHE=/home/appuser/cache/transformers

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    cmake \
    python3-dev \
    libffi-dev \
    libssl-dev \
    portaudio19-dev \
    libasound2-dev \
    ffmpeg \
    tesseract-ocr \
    libtesseract-dev \
    libmagic1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user with a home directory
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 --gid 1001 --home /home/appuser appuser

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -U pip setuptools wheel && \
    pip install --no-cache-dir "numpy<2.0.0" "Cython<3" && \
    pip install --no-cache-dir -r requirements.txt

# Create necessary directories in /home/appuser for writable permissions
RUN mkdir -p /home/appuser/nltk_data \
    /home/appuser/cache/huggingface \
    /home/appuser/cache/transformers \
    /app/cache \
    /app/logs \
    /app/artifacts && \
    chown -R appuser:appuser /home/appuser /app/cache /app/logs /app/artifacts

# Switch to non-root user
USER appuser

# Copy source code (ownership is set on copy to ensure read permissions)
COPY --chown=appuser:appuser . .

# Expose the API port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
