@echo off
echo ===================================================
echo Deploy AKP Lite ke Vercel
echo ===================================================
echo Anda akan diminta untuk login jika belum login ke Vercel.
echo Silakan ikuti instruksi di layar.
echo.

cd /d "%~dp0"
call npx vercel

echo.
echo Jika ingin deploy ke production, jalankan perintah: npx vercel --prod
echo ===================================================
pause
