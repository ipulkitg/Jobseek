#!/bin/bash

echo "🔄 Restarting backend server to apply route fixes..."

# Find and kill the existing Python process for the backend
echo "🔍 Looking for existing backend process..."
BACKEND_PID=$(ps aux | grep "python.*main.py" | grep -v grep | awk '{print $2}')

if [ ! -z "$BACKEND_PID" ]; then
    echo "⚡ Killing existing backend process (PID: $BACKEND_PID)..."
    kill $BACKEND_PID
    sleep 2
    
    # Check if process is still running and force kill if necessary
    if ps -p $BACKEND_PID > /dev/null; then
        echo "🔥 Force killing process..."
        kill -9 $BACKEND_PID
    fi
    echo "✅ Backend process terminated"
else
    echo "ℹ️  No existing backend process found"
fi

echo "🚀 Starting backend server..."
cd be
python3 main.py &

echo "✅ Backend server restarted!"
echo "📋 The server should now have the route order fix applied"
echo "🔗 Test the endpoint: curl -X GET \"http://localhost:8000/api/v1/jobs/employer\" -H \"Content-Type: application/json\""
