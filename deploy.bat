@echo off
REM Deployment script for TCG Arena (Windows)

echo.
echo 🚀 TCG Arena Deployment
echo =======================

REM Check prerequisites
echo Checking prerequisites...

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker not found
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    exit /b 1
)

echo ✓ Prerequisites met
echo.

REM Create .env if not exists
if not exist .env (
    echo Creating .env file...
    (
        echo # AWS Credentials
        echo AWS_ACCESS_KEY_ID=your_access_key_here
        echo AWS_SECRET_ACCESS_KEY=your_secret_key_here
        echo.
        echo # JWT
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
    ) > .env
    echo ⚠️  Edit .env with your AWS credentials and secrets
    echo Then run this script again
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Build
echo Building project...
call npm run build

echo.
echo ✓ Setup complete!
echo.
echo Start development servers:
echo   npm run dev
echo.
echo Or use Docker Compose:
echo   docker-compose up
echo.
echo Access the application:
echo   Frontend: http://localhost:5173 (dev) or http://localhost (docker)
echo   Backend: http://localhost:3000
