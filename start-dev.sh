#!/bin/bash

echo "🚀 Starting Job Portal Development Servers..."

# Start backend in background
echo "📡 Starting backend server..."
cd be
uv run python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🌐 Starting frontend server..."
cd ../fe
npm start &
FRONTEND_PID=$!

echo "✅ Both servers are starting..."
echo "📡 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo "🧪 Test Page: http://localhost:3000/test"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

