# -*- coding: utf-8 -*-
"""
Motor de razonamiento para Kofu v1.5
Híbrido: Detección inteligente de intenciones + Ollama local + Fallback online seguro.
"""
import os
import re
import threading
import time
from typing import List, Optional, Tuple

import requests
from config import CONTEXT_EXPIRATION_HOURS
from paths import CACHE_DIR
from ollama_client import OllamaEngine, NoModelAvailableError


class ReasoningStep:
    def __init__(self, step_num: int, thought: str, evidence: str = ""):
        self.step_num = step_num
        self.thought = thought
        self.evidence = evidence

    def __str__(self):
        return f"Paso {self.step_num}: {self.thought}" + (f" ({self.evidence})" if self.evidence else "")


class ChainOfThought:
    def __init__(self):
        self.steps: List[str] = []

    def add_step(self, step: str):
        self.steps.append(step)

    def get_chain(self) -> str:
        return "\n".join(f"{i + 1}. {s}" for i, s in enumerate(self.steps))

    def explain(self) -> str:
        return f"Proceso de razonamiento:\n{self.get_chain()}\n\nConclusión generada."


def query_external_llm_fallback(prompt: str, api_key: Optional[str] = None) -> Optional[str]:
    """Fallback seguro a LLMs en la nube cuando se especifica en modo online."""
    if api_key:
        # 1. Intentar Gemini usando header de seguridad
        try:
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
            headers = {
                "Content-Type": "application/json",
                "x-goog-api-key": api_key,
            }
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            resp = requests.post(url, headers=headers, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception:
            pass

        # 2. Intentar OpenAI API si parece una key de OpenAI (sk-...)
        if api_key.startswith("sk-"):
            try:
                resp = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.7,
                    },
                    timeout=30,
                )
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"].strip()
            except Exception:
                pass

    env_api_key = os.getenv("OPENAI_API_KEY")
    if env_api_key:
        try:
            resp = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {env_api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                },
                timeout=30,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception:
            pass

    return None


class ReasoningEngine:
    """Motor de intenciones y respuestas base para Kofu."""

    def __init__(self):
        self.thinking_steps: List[ReasoningStep] = []

    def _extract_topic(self, text: str) -> str:
        for pattern in (
            r"(?:sobre|acerca de|de|del tema)\s+(.+?)(?:\?|$|,|\.)",
            r"(?:crear|hacer|generar|elaborar)\s+(?:un\s+|una\s+)?(?:documento|presentaci[oó]n|texto|informe)\s+(?:de|sobre)?\s*(.+?)(?:\?|$|,|\.)",
        ):
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return text.strip()

    def reason(self, user_input: str) -> Tuple[str, List[ReasoningStep]]:
        self.thinking_steps = [ReasoningStep(1, "Analizando intención del usuario", user_input)]
        topic = self._extract_topic(user_input)
        if topic and topic != user_input:
            self.thinking_steps.append(ReasoningStep(2, f"Tema identificado: {topic}"))

        low = user_input.lower()
        if any(w in low for w in ("powerpoint", "presentación", "presentacion", "diapositivas", "ppt")):
            return (
                f"Puedo crear una presentación en PowerPoint sobre '{topic}'. "
                "Selecciona una plantilla en el menú desplegable si deseas un diseño específico y pulsa Enviar.",
                self.thinking_steps,
            )
        if any(w in low for w in ("word", "documento", "informe", "ensayo", "docx")):
            return (
                f"Puedo generar un documento Word completo sobre '{topic}'. "
                "Puedes elegir una plantilla en el menú superior para aplicar estilos profesionales.",
                self.thinking_steps,
            )
        return (
            "Hola, soy Kofu. Puedo ayudarte a:\n"
            "• Redactar y estructurar documentos Word (.docx)\n"
            "• Crear presentaciones PowerPoint automáticas (.pptx)\n"
            "• Procesar y resumir archivos y documentos offline\n"
            "¿Sobre qué tema deseas trabajar hoy?",
            self.thinking_steps,
        )


class HybridReasoningEngine(ReasoningEngine):
    def __init__(self, use_ollama: bool = True):
        super().__init__()
        self.ollama_engine = OllamaEngine() if use_ollama else None
        self.chain_of_thought = ChainOfThought()
        self.last_model_used: Optional[str] = None
        self.context_file = CACHE_DIR / "contexto_activo.txt"
        self._lock = threading.Lock()

    def _leer_contexto(self) -> str:
        with self._lock:
            if not self.context_file.exists():
                return ""
            try:
                if CONTEXT_EXPIRATION_HOURS > 0:
                    edad_horas = (time.time() - self.context_file.stat().st_mtime) / 3600.0
                    if edad_horas > CONTEXT_EXPIRATION_HOURS:
                        self.context_file.unlink(missing_ok=True)
                        return ""
                return self.context_file.read_text(encoding="utf-8").strip()
            except Exception:
                return ""

    def _guardar_contexto_async(self, prompt: str, respuesta: str, model: Optional[str]):
        if not self.ollama_engine:
            return

        def tarea():
            try:
                contexto_previo = self._leer_contexto()
                instruccion = (
                    "Resume la interacción en una sola oración breve (máx 20 palabras) para recordar el tema de conversación.\n"
                    f"Contexto previo: {contexto_previo}\n"
                    f"Usuario: {prompt[:300]}\n"
                    f"Asistente: {respuesta[:300]}\n"
                    "Resumen:"
                )
                resumen, _ = self.ollama_engine.razonar(
                    instruccion, model=model, system_prompt="Eres un memorizador conciso."
                )
                if resumen:
                    with self._lock:
                        self.context_file.write_text(resumen.strip(), encoding="utf-8")
            except Exception:
                pass

        threading.Thread(target=tarea, daemon=True).start()

    def _respuesta_con_ollama(self, prompt: str, system_prompt: Optional[str] = None,
                                allow_external: bool = False, model: Optional[str] = None,
                                api_key: Optional[str] = None) -> Optional[str]:
        if self.ollama_engine and self.ollama_engine.available:
            try:
                contexto_previo = self._leer_contexto()
                prompt_con_contexto = (
                    f"Contexto de la conversación previa: {contexto_previo}\n\nPregunta: {prompt}"
                    if contexto_previo else prompt
                )
                respuesta, modelo_usado = self.ollama_engine.razonar(
                    prompt_con_contexto, model=model, system_prompt=system_prompt
                )
                self.last_model_used = modelo_usado
                self._guardar_contexto_async(prompt, respuesta, model=modelo_usado)
                return respuesta
            except NoModelAvailableError:
                if not allow_external:
                    raise
            except Exception:
                pass

        if allow_external:
            return query_external_llm_fallback(prompt, api_key=api_key)
        return None

    def direct_reason(self, user_input: str, allow_external: bool = False,
                       model: Optional[str] = None, api_key: Optional[str] = None) -> Tuple[str, List[ReasoningStep]]:
        self.thinking_steps = [ReasoningStep(1, "Procesamiento directo")]
        respuesta = self._respuesta_con_ollama(
            user_input,
            system_prompt="Eres Kofu, un asistente de IA técnico, preciso y directo. Responde con claridad y excelente formato.",
            allow_external=allow_external,
            model=model,
            api_key=api_key,
        )
        if respuesta:
            self.thinking_steps.append(ReasoningStep(2, f"Respuesta generada con {self.last_model_used or 'IA'}"))
            return respuesta, self.thinking_steps

        return user_input, self.thinking_steps

    def reason(self, user_input: str, allow_external: bool = False,
               model: Optional[str] = None, api_key: Optional[str] = None) -> Tuple[str, List[ReasoningStep]]:
        respuesta_reglas, pasos = super().reason(user_input)
        try:
            respuesta_ia = self._respuesta_con_ollama(
                user_input,
                allow_external=allow_external,
                model=model,
                api_key=api_key,
            )
            if respuesta_ia:
                pasos.append(ReasoningStep(len(pasos) + 1, f"Generado con {self.last_model_used or 'Ollama'}"))
                return respuesta_ia, pasos
        except NoModelAvailableError:
            raise
        except Exception:
            pass

        return respuesta_reglas, pasos
