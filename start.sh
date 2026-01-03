#!/bin/bash

# Function to handle script exit
cleanup() {
    echo ""
    echo "🍁 Shutting down Maple..."
    # Kill all child processes in the current process group
    trap - SIGINT EXIT # Prevent infinite recursion
    kill 0
}

# Trap SIGINT (Ctrl+C) and EXIT
trap cleanup SIGINT EXIT

echo "🍁 Starting Maple..."

# Check if venv exists
if [ ! -d "backend/venv" ]; then
    echo "Error: Backend virtual environment not found. Please run setup instructions in README."
    exit 1
fi

# Start Backend
echo "Starting Backend server..."
(cd backend && source venv/bin/activate && python main.py) &

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo "Starting Frontend..."
(cd frontend && npm run dev) &

# Wait for both processes
wait
