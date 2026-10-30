# -*- coding: utf-8 -*-
"""
Módulo de Sanitización para LarIA v0.7
"""
import re
from pathlib import Path


class SanitizadorEntrada:
    @staticmethod
    def limpiar_texto(texto: str) -> str:
        if not texto:
            return ""
        texto = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]", "", str(texto))
        texto = re.sub(r"[ \t]+", " ", texto)
        return texto.strip()

    @staticmethod
    def es_entrada_segura(texto: str) -> bool:
        if not texto or not isinstance(texto, str):
            return False
        return 0 < len(texto.strip()) <= 500000

    @staticmethod
    def sanitizar_nombre_archivo(nombre: str) -> str:
        if not nombre:
            return "documento_laria"
        nombre_base = Path(nombre).name
        limpio = re.sub(r'[<>:"/\\|?*\x00-\x1F]', "_", nombre_base)
        limpio = limpio.strip(" .")
        return limpio[:255] if limpio else "documento_laria"


class TypoCorrector:
    def correct_text(self, text: str) -> str:
        return text
