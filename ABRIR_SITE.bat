@echo off
setlocal
cd /d "%~dp0"
echo Iniciando ASHFALL Development Hub...
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start "ASHFALL Site - Servidor" cmd /k py -3 -m http.server 8765 --directory site
) else (
    start "ASHFALL Site - Servidor" cmd /k python -m http.server 8765 --directory site
)
timeout /t 2 /nobreak >nul
start "" "http://localhost:8765"
echo Site aberto no navegador. Para encerrar, feche a janela Servidor.
