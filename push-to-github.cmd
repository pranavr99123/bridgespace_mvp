@echo off
cd /d "%~dp0"

echo Checking git...
git status 2>nul
if errorlevel 1 (
  echo Initializing git repo...
  git init
)

echo Adding files...
git add .
git status

echo.
echo Committing...
git commit -m "Bridgespace - couples communication web app" 2>nul || git commit -m "Bridgespace - couples communication web app" --allow-empty

echo.
echo ========================================
echo NEXT STEPS (do these on github.com):
echo ========================================
echo 1. Go to https://github.com/new
echo 2. Create a repo named "bridgespace-mvp" (or any name)
echo 3. Do NOT add README, .gitignore, or license
echo 4. Copy the repo URL (e.g. https://github.com/YOUR_USERNAME/bridgespace-mvp.git)
echo.
echo Then run these commands (replace URL with yours):
echo   git remote add origin https://github.com/YOUR_USERNAME/bridgespace-mvp.git
echo   git branch -M main
echo   git push -u origin main
echo ========================================
pause
