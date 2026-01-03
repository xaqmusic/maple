@echo off
echo 🍁 Starting Maple...

:: Check if venv exists
if not exist "backend\venv" (
    echo Error: Backend virtual environment not found. Please run setup instructions in README.
    pause
    exit /b 1
)

echo Starting Backend server...
start "Maple Backend" cmd /k "cd backend && call venv\Scripts\activate && python main.py"

:: Wait a moment
timeout /t 2 /nobreak >nul

echo Starting Frontend...
start "Maple Frontend" cmd /k "cd frontend && npm run dev"

echo Maple is running! Close the new windows to stop.
pause
