# -*- coding: utf-8 -*-
import sys
from pathlib import Path

# Agregar backend/src al sys.path para importaciones directas
SRC_DIR = Path(__file__).resolve().parent / "backend" / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from main import main

if __name__ == "__main__":
    main()
