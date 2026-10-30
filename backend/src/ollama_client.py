# -*- coding: utf-8 -*-
import json
import re
import time
from typing import Any, Dict, List, Optional, Tuple

import requests

from config import (
    DEFAULT_OLLAMA_URL,
    DEFAULT_OLLAMA_MODELS,
    OLLAMA_TIMEOUT_CHECK,
    OLLAMA_TIMEOUT_GENERATE,
    NO_MODEL_ERROR_MESSAGE,
)


class NoModelAvailableError(RuntimeError):
    def __init__(self, message: str = NO_MODEL_ERROR_MESSAGE):
        self.message = message
        super().__init__(message)


class OllamaEngine:
    def __init__(self, base_url: Optional[str] = None, timeout: int = OLLAMA_TIMEOUT_CHECK):
        self.base_url = (base_url or DEFAULT_OLLAMA_URL).rstrip("/")
        self.timeout = timeout
        self._cached_models: List[str] = []
        self._last_model_check: float = 0.0
        self._cache_ttl = 4.0  # seconds

    @property
    def available(self) -> bool:
        return bool(self.listar_modelos())

    def _fetch_available_models(self, force: bool = False) -> List[str]:
        now = time.time()
        if not force and self._cached_models and (now - self._last_model_check) < self._cache_ttl:
            return self._cached_models

        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=self.timeout)
            if resp.status_code == 200:
                models = [m.get("name", "") for m in resp.json().get("models", []) if m.get("name")]
                self._cached_models = models
                self._last_model_check = now
                return models
        except Exception:
            pass
        return self._cached_models or []

    def listar_modelos(self, force: bool = False) -> List[str]:
        return self._fetch_available_models(force=force)

    def resolve_model(self, requested_model: Optional[str] = None) -> str:
        available_models = self._fetch_available_models()
        if not available_models:
            raise NoModelAvailableError()

        req = (requested_model or "").strip()
        if req:
            # Coincidencia exacta
            if req in available_models:
                return req
            # Coincidencia parcial (ej. "llama3" coincide con "llama3:latest")
            for m in available_models:
                if req.lower() == m.lower() or req.lower() in m.lower():
                    return m

        # Intentar modelos por defecto sugeridos
        for candidato in DEFAULT_OLLAMA_MODELS:
            for m in available_models:
                if candidato.lower() == m.lower() or candidato.split(":")[0] in m:
                    return m

        # Fallback inteligente: si hay modelos instalados, usar el primero disponible
        return available_models[0]

    def _generate(self, prompt: str, model: str, temperature: float = 0.7,
                   num_predict: int = 1024, timeout: int = OLLAMA_TIMEOUT_GENERATE,
                   system_prompt: Optional[str] = None) -> str:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": num_predict},
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            resp = requests.post(f"{self.base_url}/api/generate", json=payload, timeout=timeout)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "").strip()
        except requests.exceptions.ConnectionError as e:
            raise RuntimeError("Ollama no responde. Verifica que el servicio esté iniciado (ollama serve).") from e
        except requests.exceptions.Timeout as e:
            raise RuntimeError(f"Tiempo de espera agotado tras {timeout}s en Ollama.") from e
        except (KeyError, json.JSONDecodeError) as e:
            raise RuntimeError(f"Respuesta inesperada de Ollama: {e}") from e

    def razonar(self, prompt: str, model: Optional[str] = None,
                system_prompt: Optional[str] = None) -> Tuple[str, str]:
        modelo_resuelto = self.resolve_model(model)
        system_msg = system_prompt or (
            "Eres Kofu, un asistente de IA experto en redacción, análisis y generación de documentos estructurados. "
            "Responde de forma clara, profesional y concisa."
        )
        respuesta = self._generate(prompt, model=modelo_resuelto, system_prompt=system_msg)
        return respuesta, modelo_resuelto

    def sanitizar_entrada(self, texto_sucio: str, model: Optional[str] = None) -> Tuple[Dict[str, Any], bool]:
        fallback = {"texto_limpio": texto_sucio, "entidades_detectadas": [], "proceso_exitoso": False}
        try:
            modelo_resuelto = self.resolve_model(model)
        except NoModelAvailableError:
            return fallback, False

        prompt = (
            "Analiza el siguiente texto y devuelve ÚNICAMENTE un JSON válido con las claves:\n"
            "- 'texto_limpio': texto con formato corregido\n"
            "- 'entidades_detectadas': lista de nombres de entidades clave\n"
            "- 'proceso_exitoso': true\n\n"
            f"TEXTO:\n```\n{texto_sucio}\n```"
        )
        try:
            raw = self._generate(prompt, model=modelo_resuelto, temperature=0.1, num_predict=512, timeout=45)
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                return json.loads(match.group(0)), True
            return json.loads(raw), True
        except Exception:
            return fallback, False
