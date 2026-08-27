@echo off
echo ============================================================
echo Kofu Automatic Compiler for Windows
echo ============================================================

echo Checking prerequisites...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python.
    pause
    exit /b 1
)

echo.
echo Installing PyInstaller and dependencies...
pip install pyinstaller pywebview
pip install -r requirements.txt

echo.
echo ============================================================
echo Compiling Normal Windows Version...
echo ============================================================
call Archivos_Extra\build_windows.bat

echo.
echo ============================================================
echo Compiling CPU-Only Windows Version...
echo ============================================================
call Archivos_Extra\build_cpu_windows.bat

echo.
echo ============================================================
echo All compilation tasks completed successfully!
echo Executables should be in the dist/ folder and your Downloads.
echo ============================================================
pause
