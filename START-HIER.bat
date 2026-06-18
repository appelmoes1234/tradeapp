@echo off
cd /d "%~dp0"
echo Installing minimal dependencies...
npm.cmd install --omit=dev --ignore-scripts --no-audit --no-fund
echo Starting FTMO app on http://127.0.0.1:4000
npx.cmd next dev -H 127.0.0.1 -p 4000
pause
