# -*- coding: utf-8 -*-
import os
import sys
from pathlib import Path

def get_base_dir() -> Path:
    if getattr(sys, 'frozen', False):
        return Path(sys._MEIPASS)
    else:
        return Path(__file__).resolve().parent.parent.parent

def get_exec_dir() -> Path:
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent
    else:
        return Path(__file__).resolve().parent.parent.parent

BASE_DIR = get_base_dir()
EXEC_DIR = get_exec_dir()

TEMPLATES_DIR = BASE_DIR / 'templates'
PACKAGES_DIR = TEMPLATES_DIR / 'packages'
WEB_DIR = BASE_DIR / 'web'
OUTPUT_DIR = EXEC_DIR / 'output'
ARCHIVOS_DIR = EXEC_DIR / 'archivos'
CACHE_DIR = EXEC_DIR / '.laria_cache'

# Ensure directories exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ARCHIVOS_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)
