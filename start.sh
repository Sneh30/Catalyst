#!/bin/bash
# Production start script — builds frontend, starts backend

set -e
echo "Building frontend..."
cd frontend
npm install --silent
npm run build
cd ..

echo "Starting backend..."
cd backend
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
