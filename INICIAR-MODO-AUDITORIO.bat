@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "APP_URL="
if exist "APP-URL.txt" set /p APP_URL=<"APP-URL.txt"

if not defined APP_URL (
  echo No se encontro una URL en APP-URL.txt
  pause
  exit /b 1
)

set "BROWSER="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "BROWSER=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if not defined BROWSER (
  echo No se encontro Google Chrome ni Microsoft Edge.
  pause
  exit /b 1
)

start "Alcaldia Digital" "%BROWSER%" --kiosk "%APP_URL%" --autoplay-policy=no-user-gesture-required --disable-session-crashed-bubble --disable-features=Translate --no-first-run
exit /b 0
