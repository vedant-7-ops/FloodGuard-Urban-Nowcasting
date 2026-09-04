@echo off
echo Starting FloodGuard...

start "ML API" cmd /k "cd /d C:\Users\khair\OneDrive\SIH\Urban Flood Nowcasting System\ml-model && call venv\Scripts\activate && python ml_api.py"

timeout /t 3 /nobreak >nul

start "Backend" cmd /k "cd /d C:\Users\khair\OneDrive\SIH\Urban Flood Nowcasting System\backend && node server.js"

timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd /d C:\Users\khair\OneDrive\SIH\Urban Flood Nowcasting System\Frontend && npm run dev"

echo.
echo FloodGuard started.
pause