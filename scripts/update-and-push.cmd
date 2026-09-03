@echo off
REM RED DEVILS HUB - refresh data.js from BBC Sport, then commit and push.
REM Messages are ASCII on purpose: the console codepage garbles UTF-8 Korean.
REM Register:
REM   schtasks /create /sc daily /st 09:00 /tn "RedDevilsHub" /tr "C:\red-devils-hub\scripts\update-and-push.cmd"
setlocal
cd /d C:\red-devils-hub || exit /b 1

for /f "usebackq delims=" %%d in (`node -e "console.log(new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date()))"`) do set TODAY=%%d
if "%TODAY%"=="" (
  echo [update-and-push] Could not read today's date. Is Node installed?
  exit /b 1
)

node scripts\update-data.mjs
if errorlevel 1 (
  echo [update-and-push] update-data.mjs failed - nothing committed.
  exit /b 1
)

git add data.js
git diff --cached --quiet
if not errorlevel 1 (
  echo [update-and-push] %TODAY% - no changes.
  exit /b 0
)

git commit -m "data: %TODAY%"
if errorlevel 1 exit /b 1

git push origin main
if errorlevel 1 (
  echo [update-and-push] push failed.
  exit /b 1
)

echo [update-and-push] %TODAY% done.
endlocal
