@echo off
cd /d "%~dp0"
echo Starting Nebula Drift...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" 8080
pause
