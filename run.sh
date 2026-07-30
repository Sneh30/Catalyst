#!/bin/bash
# Career OS - Development Runner
# Starts both backend and frontend

echo "🚀 Starting Career OS..."

# Start backend
echo "📦 Starting backend on http://localhost:8000"
cd backend
"$PWD/venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Start frontend
echo "🎨 Starting frontend on http://localhost:5173"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Backend:  http://localhost:8000"
echo "✅ Frontend: http://localhost:5173"
echo "✅ API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
