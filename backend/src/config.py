# -*- coding: utf-8 -*-
import os
import socket
from pathlib import Path

APP_NAME = "LarIA AI"
APP_VERSION = "0.7.0"

DEFAULT_OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", os.getenv("OLLAMA_HOST", "http://localhost:11434"))

DEFAULT_OLLAMA_MODELS = [
    os.getenv("OLLAMA_MODEL_PRIMARY", "qwen2.5:7b"),
    os.getenv("OLLAMA_MODEL_FALLBACK", "qwen2.5:3b"),
    "qwen2.5:latest",
    "qwen2.5:14b",
    "qwen2.5-coder:7b",
    "qwen2.5-coder:1.5b",
    "qwen2.5:1.5b",
    "qwen2.5:0.5b",
    "llama3.2:latest",
    "mistral:latest",
]

OLLAMA_TIMEOUT_CHECK = 4
OLLAMA_TIMEOUT_GENERATE = 180

NO_MODEL_ERROR_CODE = 418
NO_MODEL_ERROR_MESSAGE = "Error 418; No se encontró ningún modelo en Ollama. Ejecuta: ollama run qwen2.5:7b"

PREFERRED_PORTS = [8000, 8080, 8888, 5000]
CONTEXT_EXPIRATION_HOURS = 12


def find_free_port(candidates: list[int]) -> int:
    for port in candidates:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]
