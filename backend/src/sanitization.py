# -*- coding: utf-8 -*-
"""
Módulo de Sanitización para Kofu v1.5
Protección contra Path Traversal, caracteres de control y normalización de texto.
"""
import os
import re
from pathlib import Path


class SanitizadorEntrada:
    @staticmethod
    def limpiar_texto(texto: str) -> str:
        if not texto:
            return ""
        # Eliminar caracteres nulos y caracteres de control (excepto tab y saltos de línea comunes)
        texto = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]", "", str(texto))
        # Normalizar espacios en blanco repetitivos
        texto = re.sub(r"[ \t]+", " ", texto)
        return texto.strip()

    @staticmethod
    def es_entrada_segura(texto: str) -> bool:
        if not texto or not isinstance(texto, str):
            return False
        # Validar longitud prudente
        return 0 < len(texto.strip()) <= 500000

    @staticmethod
    def sanitizar_nombre_archivo(nombre: str) -> str:
        if not nombre:
            return "documento_kofu"
        # Tomar únicamente el basename para evitar Path Traversal (../../etc/...)
        nombre_base = Path(nombre).name
        # Reemplazar caracteres peligrosos o reservados en Windows/Linux
        limpio = re.sub(r'[<>:"/\\|?*\x00-\x1F]', "_", nombre_base)
        limpio = limpio.strip(" .")
        return limpio[:255] if limpio else "documento_kofu"


class TypoCorrector:
    """
    Corrector suave sin mutaciones semánticas forzadas.
    Permite normalizar comandos explícitos de documentos sin romper el vocabulario general.
    """
    def correct_text(self, text: str) -> str:
        # Los LLMs modernos comprenden lenguaje natural directamente sin preprocesamiento agresivo.
        return text
