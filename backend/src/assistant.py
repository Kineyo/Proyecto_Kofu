# -*- coding: utf-8 -*-
"""
AIAssistant para LarIA v0.7
Orquestación central: Razonamiento e ingesta documental offline.
"""
import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from file_processor import FileProcessor
from office_agent import OfficeAgent, OUTPUT_DIR, ARCHIVOS_DIR, TEMPLATES_DIR
from ollama_client import NoModelAvailableError
from reasoning import ChainOfThought, HybridReasoningEngine, ReasoningStep
from sanitization import SanitizadorEntrada, TypoCorrector


class AIAssistant:
    def __init__(self, use_ollama: bool = True):
        self.sanitizador = SanitizadorEntrada()
        self.typo_corrector = TypoCorrector()
        self.office_agent = OfficeAgent()
        self.file_processor = FileProcessor()
        self.reasoning_engine = HybridReasoningEngine(use_ollama=use_ollama)
        self.chain_of_thought = ChainOfThought()

    @staticmethod
    def _permite_internet(modo: str) -> bool:
        return modo.lower() == "online"

    def _preparar_entrada(self, user_input: str) -> str:
        limpio = self.sanitizador.limpiar_texto(user_input)
        return self.typo_corrector.correct_text(limpio)

    def process_request(self, user_input: str, modo: str = "local",
                         model: Optional[str] = None, api_key: Optional[str] = None) -> Tuple[str, List[ReasoningStep]]:
        entrada = self._preparar_entrada(user_input)
        self.chain_of_thought.steps = []
        self.chain_of_thought.add_step(f"Analizando solicitud ({modo}, modelo={model or 'auto'})")
        response, steps = self.reasoning_engine.reason(
            entrada, allow_external=self._permite_internet(modo), model=model, api_key=api_key
        )
        return response, steps

    def direct_reason(self, user_input: str, modo: str = "local",
                       model: Optional[str] = None, api_key: Optional[str] = None) -> Tuple[str, List[ReasoningStep]]:
        entrada = self._preparar_entrada(user_input)
        self.chain_of_thought.steps = []
        self.chain_of_thought.add_step(f"Procesando acceso directo ({modo})")
        response, steps = self.reasoning_engine.direct_reason(
            entrada, allow_external=self._permite_internet(modo), model=model, api_key=api_key
        )
        return response, steps

    def research_topic(self, topic: str, modo: str = "local", model: Optional[str] = None,
                       api_key: Optional[str] = None, style: str = "profesional",
                       source_content: Optional[str] = None) -> str:
        if source_content:
            prompt = (
                f"Actúa como redactor con tono {style}. A partir de la siguiente información extraída, "
                f"genera un texto completo y estructurado sobre '{topic}'.\n"
                "Organízalo en subtítulos (## Subtítulo) y párrafos claros.\n\n"
                f"INFORMACIÓN BASE:\n{source_content[:12000]}"
            )
        else:
            prompt = (
                f"Actúa como un experto redactor con tono {style}. Escribe un documento detallado sobre '{topic}'.\n"
                "Estructura el contenido con subtítulos (## Nombre de sección), desarrollo conceptual y conclusiones."
            )

        if self.reasoning_engine.ollama_engine and self.reasoning_engine.ollama_engine.available:
            try:
                texto, modelo = self.reasoning_engine.ollama_engine.razonar(
                    prompt,
                    model=model,
                    system_prompt="Eres un redactor profesional de alto nivel. Responde en español."
                )
                self.reasoning_engine.last_model_used = modelo
                return texto.strip()
            except Exception:
                pass

        if self._permite_internet(modo):
            from reasoning import query_external_llm_fallback
            online_res = query_external_llm_fallback(prompt, api_key=api_key)
            if online_res:
                return online_res

        return (
            f"# {topic}\n\n"
            f"## Introducción a {topic}\n"
            f"Este informe presenta un análisis sobre {topic} estructurado para facilitar su comprensión.\n\n"
            f"## Desarrollo Principal\n"
            f"Se evalúan los componentes estructurales y mejores prácticas asociadas a {topic}.\n\n"
            f"## Conclusiones\n"
            f"En conclusión, el análisis de {topic} demuestra la importancia de mantener un enfoque riguroso."
        )

    def _resolve_template_path(self, folder: str, template: Optional[str], default_exts: List[str]) -> Optional[str]:
        if not template:
            return None
        t_path = TEMPLATES_DIR / folder / template
        if t_path.exists():
            return str(t_path)
        for ext in default_exts:
            cand = TEMPLATES_DIR / folder / f"{template}{ext}"
            if cand.exists():
                return str(cand)
            cand2 = TEMPLATES_DIR / folder / f"{template.split('.')[0]}{ext}"
            if cand2.exists():
                return str(cand2)
        return None

    def create_presentation(self, topic: str, output_path: Optional[str] = None,
                             theme: str = "professional", modo: str = "local",
                             filename: Optional[str] = None,
                             template: Optional[str] = None,
                             model: Optional[str] = None,
                             api_key: Optional[str] = None,
                             source_content: Optional[str] = None) -> Dict[str, Any]:
        research = self.research_topic(
            topic, modo=modo, model=model, api_key=api_key, style=theme, source_content=source_content
        )
        safe_filename = self.sanitizador.sanitizar_nombre_archivo(
            filename or f"presentacion_{topic[:30].replace(' ', '_')}.pptx"
        )
        if not safe_filename.endswith(".pptx"):
            safe_filename += ".pptx"

        out = output_path or str(OUTPUT_DIR / safe_filename)
        Path(out).resolve().parent.mkdir(parents=True, exist_ok=True)

        template_path = self._resolve_template_path("powerpoint", template, [".potx", ".pptx"])
        schema = self.office_agent.get_template_schema(template) if template else None

        if schema and "slides" in schema:
            slides = []
            for s in schema["slides"]:
                slide = dict(s)
                slide["title"] = slide.get("title", "").replace("{topic}", topic)
                slide["text"] = slide.get("text", "").replace("{intro}", research[:300]).replace(
                    "{body}", research[300:1000]).replace("{conclusion}", research[-300:])
                slides.append(slide)
        else:
            slides = None
            prompt_json = (
                f"Convierte la siguiente investigación en una presentación ejecutiva.\n"
                f"Devuelve ÚNICAMENTE un arreglo JSON de 6 a 10 objetos con las claves:\n"
                f"- 'title': título conciso\n"
                f"- 'layout': 0 para portada, 1 para contenido\n"
                f"- 'text': puntos clave en viñetas cortas\n\n"
                f"INVESTIGACIÓN:\n{research[:4000]}"
            )
            if self.reasoning_engine.ollama_engine and self.reasoning_engine.ollama_engine.available:
                try:
                    raw_json, _ = self.reasoning_engine.ollama_engine.razonar(
                        prompt_json, model=model,
                        system_prompt="Devuelve únicamente un JSON válido [ {...}, {...} ]."
                    )
                    match = re.search(r"\[.*\]", raw_json, re.DOTALL)
                    if match:
                        slides = json.loads(match.group(0))
                except Exception:
                    slides = None

            if not slides:
                slides = [{"title": topic, "layout": 0, "subtitle": "Presentación elaborada con LarIA AI", "background": True}]
                sections = re.split(r'\n(?=##?\s+)', research)
                for i, sec in enumerate(sections[:8]):
                    lines = [l.strip() for l in sec.split("\n") if l.strip()]
                    if lines:
                        sec_title = lines[0].lstrip("#").strip() or f"Punto Clave {i+1}"
                        sec_body = "\n".join(lines[1:])[:400]
                        slides.append({"title": sec_title, "layout": 1, "text": sec_body, "background": True})

        result = self.office_agent.create_powerpoint(out, slides, template_path=template_path, theme=theme)
        result["filename"] = Path(out).name
        return result

    def create_document(self, topic: str, output_path: Optional[str] = None,
                         style: str = "professional", modo: str = "local",
                         filename: Optional[str] = None,
                         template: Optional[str] = None,
                         model: Optional[str] = None,
                         api_key: Optional[str] = None,
                         source_content: Optional[str] = None) -> Dict[str, Any]:
        research = self.research_topic(
            topic, modo=modo, model=model, api_key=api_key, style=style, source_content=source_content
        )
        safe_filename = self.sanitizador.sanitizar_nombre_archivo(
            filename or f"documento_{topic[:30].replace(' ', '_')}.docx"
        )
        if not safe_filename.endswith(".docx"):
            safe_filename += ".docx"

        out = output_path or str(OUTPUT_DIR / safe_filename)
        Path(out).resolve().parent.mkdir(parents=True, exist_ok=True)

        template_path = self._resolve_template_path("word", template, [".dotx", ".docx"])
        subtitle = "Informe y Análisis Exhaustivo"

        content = [
            {"type": "document_title", "text": topic},
            {"type": "document_subtitle", "text": subtitle},
        ]

        sections = re.split(r'\n(?=##?\s+)', research)
        for sec in sections:
            lines = [l for l in sec.split("\n") if l.strip()]
            if not lines:
                continue
            if lines[0].startswith("#"):
                heading_text = lines[0].lstrip("#").strip()
                content.append({"type": "heading", "text": heading_text, "level": 2})
                body = "\n".join(lines[1:])
                if body.strip():
                    content.append({"type": "paragraph", "text": body})
            else:
                content.append({"type": "paragraph", "text": sec})

        result = self.office_agent.create_word_document(out, content, template_path=template_path, style=style)
        result["filename"] = Path(out).name
        return result

    def digest_file(self, file_path: str, output_path: Optional[str] = None,
                     instrucciones: Optional[str] = None, model: Optional[str] = None,
                     api_key: Optional[str] = None) -> Dict[str, Any]:
        extraido = self.file_processor.process_local_file(file_path)
        if not extraido.get("success"):
            return extraido

        texto_preparado = self._preparar_entrada(extraido.get("text_content", ""))
        prompt_instruccion = instrucciones or "Resume y organiza los puntos más relevantes del siguiente documento:"
        prompt = f"{prompt_instruccion}\n\nCONTENIDO:\n{texto_preparado[:10000]}"

        digestion = texto_preparado
        if self.reasoning_engine.ollama_engine and self.reasoning_engine.ollama_engine.available:
            try:
                res, mod = self.reasoning_engine.ollama_engine.razonar(prompt, model=model)
                digestion = res
                self.reasoning_engine.last_model_used = mod
            except Exception:
                pass

        resultado = {"success": True, "filename": extraido.get("filename", ""), "digestion": digestion}

        if output_path:
            out_p = Path(output_path).resolve()
            out_p.parent.mkdir(parents=True, exist_ok=True)
            out_p.write_text(digestion, encoding="utf-8")
            resultado["output_path"] = str(out_p)

        return resultado

    def get_office_tips(self, software: str) -> List[str]:
        tips_map = {
            "word": [
                "Aplica estilos predefinidos (Título 1, Título 2) para navegación fluida.",
                "Usa sangría francesa para bibliografías en formato APA.",
                "Mantén un espaciado entre párrafos de 6 a 8 ptos para evitar saltos dobles innecesarios.",
            ],
            "powerpoint": [
                "Aplica la regla 6x6: máximo 6 líneas y 6 palabras por línea para diapositivas legibles.",
                "Mantén un contraste alto entre el fondo y el color de texto.",
                "Usa transiciones sobrias para no distraer a la audiencia.",
            ]
        }
        return tips_map.get(software.lower(), [])
