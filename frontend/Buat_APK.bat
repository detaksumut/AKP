@echo off
echo ===================================================
echo Membangun Aplikasi Android untuk AKP Lite
echo ===================================================

SET JAVA_HOME=C:\Program Files\Android\Android Studio\jbr

cd /d "%~dp0"

echo 1. Membangun aplikasi web...
call npm run build
if %errorlevel% neq 0 (
    echo Gagal membangun aplikasi web!
    pause
    exit /b %errorlevel%
)

echo.
echo 2. Sinkronisasi dengan Capacitor Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Gagal sinkronisasi Capacitor!
    pause
    exit /b %errorlevel%
)

echo.
echo 3. Membangun APK (Release)...
cd android
call gradlew assembleRelease
if %errorlevel% neq 0 (
    echo Gagal membangun APK Android!
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo BERHASIL! APK telah dibuat.
echo Lokasi: android\app\build\outputs\apk\release\app-release.apk
echo ===================================================
pause
