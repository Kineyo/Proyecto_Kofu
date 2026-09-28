import os
import sys
from pathlib import Path

def get_base_dir() -> Path:
    if getattr(sys, 'frozen', False):
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        return Path(sys._MEIPASS)
    else:
        # Normal execution
        return Path(__file__).resolve().parent.parent.parent

def get_exec_dir() -> Path:
    if getattr(sys, 'frozen', False):
        # Directory where the executable is located
        return Path(sys.executable).parent
    else:
        # Normal execution
        return Path(__file__).resolve().parent.parent.parent

BASE_DIR = get_base_dir()
EXEC_DIR = get_exec_dir()

TEMPLATES_DIR = BASE_DIR / 'templates'
WEB_DIR = BASE_DIR / 'web'
OUTPUT_DIR = EXEC_DIR / 'output'
ARCHIVOS_DIR = EXEC_DIR / 'archivos'

# Ensure user directories exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ARCHIVOS_DIR.mkdir(parents=True, exist_ok=True)
