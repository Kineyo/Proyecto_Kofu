# -*- coding: utf-8 -*-
import sys
from pathlib import Path

_SRC_DIR = str(Path(__file__).resolve().parent)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from .assistant import AIAssistant
from .ollama_client import OllamaEngine, NoModelAvailableError
from .office_agent import OfficeAgent
from .file_processor import FileProcessor
from .sanitization import SanitizadorEntrada, TypoCorrector
from .reasoning import HybridReasoningEngine, ReasoningEngine, ReasoningStep, ChainOfThought

__all__ = [
    "AIAssistant",
    "HybridReasoningEngine",
    "ReasoningEngine",
    "ReasoningStep",
    "ChainOfThought",
    "OllamaEngine",
    "NoModelAvailableError",
    "OfficeAgent",
    "FileProcessor",
    "SanitizadorEntrada",
    "TypoCorrector",
]
