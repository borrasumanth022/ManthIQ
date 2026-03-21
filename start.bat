@echo off
echo Starting ManthIQ...
echo.

:: Start backend
echo [1/2] Starting FastAPI backend on http://localhost:8000
start "ManthIQ Backend" cmd /k "C:\Users\borra\anaconda3\python.exe -m uvicorn main:app --reload --port 8000"

:: Give the backend a second to bind
timeout /t 2 /nobreak >nul

:: Start frontend
echo [2/2] Starting Vite dev server on http://localhost:5173
cd frontend
start "ManthIQ Frontend" cmd /k "npm run dev"

echo.
echo ManthIQ is starting:
echo   Backend  -> http://localhost:8000
echo   Frontend -> http://localhost:5173
echo   API docs -> http://localhost:8000/docs
