.PHONY: help install build run clean test deploy status setup

help:
	@echo "DivyaVaani AI - Development Commands"
	@echo "===================================="
	@echo "Available commands:"
	@echo "  make setup       - Set up development environment"
	@echo "  make install     - Install all dependencies"
	@echo "  make build       - Build all components"
	@echo "  make run         - Run development servers"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make test        - Run all tests"
	@echo "  make deploy      - Deploy to production"
	@echo "  make status      - Show system status"
	@echo "  make logs        - Show application logs"

setup:
	@echo "Setting up development environment..."
	# Backend setup
	cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	# Frontend setup
	cd frontend && npm install
	@echo "Setup complete! Run 'make run' to start development servers."

install:
	@echo "Installing dependencies..."
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

build:
	@echo "Building application..."
	# Build backend artifacts
	cd backend && python scripts/build.py
	# Build frontend
	cd frontend && npm run build

run:
	@echo "Starting development servers..."
	@echo "Starting backend on http://localhost:8000"
	@echo "Starting frontend on http://localhost:3000"
	# Start Redis (if available)
	docker-compose up -d redis || echo "Redis not available, skipping..."
	# Start backend
	cd backend && python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 &
	# Start frontend
	cd frontend && npm run dev &
	@echo "Servers started. Press Ctrl+C to stop."

clean:
	@echo "Cleaning build artifacts..."
	cd backend && make clean
	cd frontend && rm -rf .next out node_modules/.cache
	docker system prune -f || echo "Docker cleanup skipped"

test:
	@echo "Running tests..."
	cd backend && python -m pytest tests/ -v --tb=short
	cd frontend && npm test -- --watchAll=false

deploy:
	@echo "Deploying to production..."
	# Build Docker images
	docker-compose build
	# Push to registry (requires DOCKER_USERNAME and DOCKER_PASSWORD env vars)
	@echo "Push images to registry manually or set up CI/CD"
	# Deploy
	docker-compose up -d
	@echo "Deployment complete!"

status:
	@echo "System Status:"
	@echo "=============="
	@echo "Docker containers:"
	docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "No Docker containers running"
	@echo ""
	@echo "Running processes:"
	ps aux | grep -E "(uvicorn|next|redis)" | grep -v grep || echo "No application processes found"
	@echo ""
	@echo "Disk usage:"
	df -h | grep -E "(Filesystem|/)$"
	@echo ""
	@echo "Memory usage:"
	free -h

logs:
	@echo "Application Logs:"
	@echo "=================="
	docker-compose logs -f --tail=100 || echo "No Docker logs available"
	# Backend logs
	@echo "Backend logs:"
	tail -f backend/logs/*.log 2>/dev/null || echo "No backend logs found"
	# Frontend logs would be in browser console

diagnose:
	@echo "System Diagnostics:"
	@echo "==================="
	@echo "Python version:"
	python --version
	@echo "Node version:"
	node --version
	@echo "Docker version:"
	docker --version 2>/dev/null || echo "Docker not available"
	@echo "Git status:"
	git status --porcelain | head -10
	@echo "Environment check:"
	@echo "- Backend .env exists: $$(test -f backend/.env && echo 'Yes' || echo 'No')"
	@echo "- Frontend .env.local exists: $$(test -f frontend/.env.local && echo 'Yes' || echo 'No')"
	@echo "- Docker daemon running: $$(docker info >/dev/null 2>&1 && echo 'Yes' || echo 'No')"