@echo off
echo Checking if Ollama is installed...

where ollama >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Ollama is installed. Starting Ollama...
    start ollama serve
    timeout /t 2 >nul
    echo Ollama started.
) else (
    echo ============================================================
    echo Ollama is NOT installed.
    echo Please install Ollama to use the Kofu AI Assistant.
    echo Download from: https://ollama.com/download
    echo ============================================================
    pause
)
