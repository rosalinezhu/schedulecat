@echo off
echo Installing email reminder dependencies...
echo.

cd server
echo Installing server dependencies...
npm install nodemailer node-cron
if %errorlevel% neq 0 (
    echo Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Installing all server dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install all dependencies
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Creating .env file from template...
if not exist .env (
    copy .env.example .env
    echo .env file created from template
) else (
    echo .env file already exists
)

echo.
echo IMPORTANT: Configure your .env file with:
echo 1. MONGODB_URI - your MongoDB connection string
echo 2. JWT_SECRET - a secure random string
echo 3. EMAIL_USER - your Gmail address (optional for email reminders)
echo 4. EMAIL_APP_PASSWORD - your Gmail app password (optional for email reminders)
echo.
echo To start the server: npm start
echo.
pause
