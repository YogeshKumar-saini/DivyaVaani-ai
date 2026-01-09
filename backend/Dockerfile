# Production Dockerfile for Backend
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH /app

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
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 --gid 1001 appuser

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -U pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy the source code and ensure permissions
COPY --chown=appuser:appuser . .

# Create necessary directories and set permissions
RUN mkdir -p cache logs artifacts && \
    chown -R appuser:appuser cache logs artifacts

USER appuser

# Expose the API port
EXPOSE 8000

# Run the application
CMD ["python", "-m", "src.api.main"]
