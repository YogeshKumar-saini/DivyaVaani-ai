.PHONY: help install build run-api clean test

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make build      - Build all artifacts"
	@echo "  make run-api    - Run API server"
	@echo "  make clean      - Clean artifacts and logs"
	@echo "  make test       - Run tests"

install:
	pip install -r requirements.txt

build:
	python scripts/build.py

run-api:
	python scripts/run_api.py

clean:
	rm -rf artifacts/ logs/ __pycache__ src/**/__pycache__
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

test:
	pytest tests/ -v
