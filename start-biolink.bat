@echo off
setlocal

title BioPlatform Launcher

cd /d "%~dp0"

echo.
echo ========================================
echo   BioPlatform baslatiliyor
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js tapilmadi. Evvelce Node.js 18+ qurasdirin:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm tapilmadi. Node.js ile birlikde gelmelidir.
  echo.
  pause
  exit /b 1
)

if not exist "server\.env" (
  echo server\.env yaradilir...
  copy "server\.env.example" "server\.env" >nul
)

if not exist "client\.env" (
  echo client\.env yaradilir...
  copy "client\.env.example" "client\.env" >nul
)

if not exist "server\node_modules" (
  echo Server paketleri qurasdirilir...
  pushd "server"
  call npm install
  if errorlevel 1 (
    popd
    echo Server paketleri qurasdirilmadi.
    pause
    exit /b 1
  )
  popd
)

if not exist "client\node_modules" (
  echo Client paketleri qurasdirilir...
  pushd "client"
  call npm install
  if errorlevel 1 (
    popd
    echo Client paketleri qurasdirilmadi.
    pause
    exit /b 1
  )
  popd
)

if not exist "server\data\app.db" (
  echo Veritabani hazirlanir...
  pushd "server"
  call npm run init-db
  if errorlevel 1 (
    popd
    echo Veritabani hazirlanmadi.
    pause
    exit /b 1
  )
  popd
)

echo Server ve client ayri pencerelerde acilir...
start "BioPlatform Server" cmd /k "cd /d ""%~dp0server"" && npm run dev"
start "BioPlatform Client" cmd /k "cd /d ""%~dp0client"" && npm run dev"

echo.
echo Hazirdir. Brauzerde bu adresi ac:
echo http://localhost:5173
echo.
pause
