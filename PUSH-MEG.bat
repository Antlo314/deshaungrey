@echo off
REM ---------------------------------------------------------------------------
REM  Push the MEG Enterprises site to GitHub for the first time.
REM
REM  STEP 1 (once, in a browser): create an EMPTY repo at
REM         https://github.com/new
REM         name: meg-enterprises      owner: Antlo314
REM         visibility: PRIVATE  (recommended - the repo carries internal
REM                               handoff notes about the Lumen fleet)
REM         do NOT add a README, .gitignore or licence - the repo already has them
REM
REM  STEP 2: double-click this file, or run it with a different repo URL:
REM         PUSH-MEG.bat https://github.com/Antlo314/some-other-name.git
REM ---------------------------------------------------------------------------
setlocal
set "REPO=%~1"
if "%REPO%"=="" set "REPO=https://github.com/Antlo314/meg-enterprises.git"

cd /d "%~dp0site" || (echo Could not find the site folder next to this script. & pause & exit /b 1)

echo.
echo Repo:   %REPO%
echo Folder: %CD%
echo.

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin "%REPO%" || (echo Could not add the remote. & pause & exit /b 1)
  echo Added remote origin.
) else (
  echo Remote origin already set to:
  git remote get-url origin
)

echo.
echo Pushing main...
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed. Most common cause: the repo does not exist yet on GitHub,
  echo or the name does not match. Create it at https://github.com/new first.
  pause
  exit /b 1
)

echo.
echo Done. Next: import the repo at https://vercel.com/new , then
echo   Storage  -^> Create Database -^> Neon Postgres  (sets DATABASE_URL)
echo   Settings -^> Environment Variables: SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
echo   Domains  -^> megentllc.com
echo See site\README.md for the full deploy checklist.
pause
