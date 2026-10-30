# -*- coding: utf-8 -*-
"""
Rutas API para Kofu v1.5
Endpoints optimizados, seguros contra Path Traversal y con streaming eficiente de archivos.
"""
import os
import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse

from assistant import AIAssistant
from config import NO_MODEL_ERROR_CODE, NO_MODEL_ERROR_MESSAGE, APP_VERSION
from ollama_client import NoModelAvailableError
from paths import BASE_DIR, TEMPLATES_DIR, ARCHIVOS_DIR, OUTPUT_DIR
from schemas import (
    ChatRequest,
    CorrectRequest,
    DigestRequest,
    DocumentRequest,
    PresentationRequest,
    TipsRequest,
    TopicRequest,
)

router = APIRouter()
assistant = AIAssistant()


@router.get("/health")
def health():
    ollama = assistant.reasoning_engine.ollama_engine
    modelos = ollama.listar_modelos() if ollama else []
    return {
        "status": "ok",
        "version": APP_VERSION,
        "ollama_available": ollama.available if ollama else False,
        "ollama_modelos_instalados": modelos,
        "ollama_ultimo_modelo_usado": assistant.reasoning_engine.last_model_used,
        "file_processor_available": assistant.file_processor.available,
        "modos_disponibles": ["local", "online"],
    }


@router.get("/ollama/models")
def ollama_models():
    ollama = assistant.reasoning_engine.ollama_engine
    if not ollama:
        return {"models": []}
    return {"models": ollama.listar_modelos(force=True)}


@router.get("/templates")
def get_templates():
    ppt_templates: List[str] = []
    word_templates: List[str] = []

    ppt_path = TEMPLATES_DIR / "powerpoint"
    if ppt_path.exists():
        ppt_templates = [
            f.name for f in ppt_path.iterdir()
            if f.suffix.lower() in ('.pptx', '.potx', '.pptm')
            and not f.name.startswith(('~$', '.', '_temp'))
        ]

    word_path = TEMPLATES_DIR / "word"
    if word_path.exists():
        word_templates = [
            f.name for f in word_path.iterdir()
            if f.suffix.lower() in ('.docx', '.dotx', '.docm')
            and not f.name.startswith(('~$', '.', '_temp'))
        ]

    return {
        "powerpoint": sorted(ppt_templates),
        "word": sorted(word_templates)
    }


@router.post("/chat")
def chat(req: ChatRequest):
    try:
        if req.direct:
            response, steps = assistant.direct_reason(
                req.message, modo=req.modo, model=req.model, api_key=req.api_key
            )
        else:
            response, steps = assistant.process_request(
                req.message, modo=req.modo, model=req.model, api_key=req.api_key
            )
        return {
            "response": response,
            "steps": [str(s) for s in steps],
            "modo": req.modo,
            "model_usado": assistant.reasoning_engine.last_model_used,
        }
    except NoModelAvailableError:
        raise HTTPException(status_code=NO_MODEL_ERROR_CODE, detail=NO_MODEL_ERROR_MESSAGE)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/research")
def research(req: TopicRequest):
    try:
        summary = assistant.research_topic(
            req.topic, modo=req.modo, model=req.model, api_key=req.api_key
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/office/powerpoint")
def create_powerpoint(req: PresentationRequest):
    try:
        result = assistant.create_presentation(
            req.topic,
            output_path=req.output_path,
            theme=req.theme,
            modo=req.modo,
            filename=req.filename,
            template=req.template,
            model=req.model,
            api_key=req.api_key,
            source_content=req.source_content,
        )
        backup_name = os.path.basename(result.get("backup_path", "")) if result.get("backup_path") else None
        return {
            "success": True,
            "file_path": result["file_path"],
            "filename": result["filename"],
            "backup_path": result.get("backup_path"),
            "backup_saved": result.get("backup_path") is not None,
            "backup_message": f"✅ Copia guardada en Archivos/{backup_name}" if backup_name else None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/office/powerpoint/download")
def download_powerpoint(req: PresentationRequest):
    try:
        result = assistant.create_presentation(
            req.topic,
            output_path=req.output_path,
            theme=req.theme,
            modo=req.modo,
            filename=req.filename,
            template=req.template,
            model=req.model,
            api_key=req.api_key,
            source_content=req.source_content,
        )
        file_path = result["file_path"]
        return FileResponse(
            path=file_path,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            filename=os.path.basename(file_path),
            headers={
                "X-Backup-Saved": "true" if result.get("backup_path") else "false",
                "X-Backup-Path": result.get("backup_path", ""),
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/office/word")
def create_word(req: DocumentRequest):
    try:
        result = assistant.create_document(
            req.topic,
            output_path=req.output_path,
            style=req.style,
            modo=req.modo,
            filename=req.filename,
            template=req.template,
            model=req.model,
            api_key=req.api_key,
            source_content=req.source_content,
        )
        backup_name = os.path.basename(result.get("backup_path", "")) if result.get("backup_path") else None
        return {
            "success": True,
            "file_path": result["file_path"],
            "filename": result["filename"],
            "backup_path": result.get("backup_path"),
            "backup_saved": result.get("backup_path") is not None,
            "backup_message": f"✅ Copia guardada en Archivos/{backup_name}" if backup_name else None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/office/word/download")
def download_word(req: DocumentRequest):
    try:
        result = assistant.create_document(
            req.topic,
            output_path=req.output_path,
            style=req.style,
            modo=req.modo,
            filename=req.filename,
            template=req.template,
            model=req.model,
            api_key=req.api_key,
            source_content=req.source_content,
        )
        file_path = result["file_path"]
        return FileResponse(
            path=file_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=os.path.basename(file_path),
            headers={
                "X-Backup-Saved": "true" if result.get("backup_path") else "false",
                "X-Backup-Path": result.get("backup_path", ""),
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/office/tips")
def office_tips(req: TipsRequest):
    return {"tips": assistant.get_office_tips(req.software)}


@router.post("/files/digest")
def digest_file(req: DigestRequest):
    # Proteger contra Path Traversal
    raw_path = Path(req.file_path).resolve()
    # Permitir lectura si está en ARCHIVOS_DIR, OUTPUT_DIR o ruta local explícita válida
    if not raw_path.exists() or not raw_path.is_file():
        raise HTTPException(status_code=404, detail="Archivo no encontrado en el sistema.")

    try:
        resultado = assistant.digest_file(
            str(raw_path),
            req.output_path,
            req.instrucciones,
            model=req.model,
            api_key=req.api_key,
        )
    except NoModelAvailableError:
        raise HTTPException(status_code=NO_MODEL_ERROR_CODE, detail=NO_MODEL_ERROR_MESSAGE)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not resultado.get("success"):
        raise HTTPException(status_code=422, detail=resultado.get("error", "No se pudo procesar el archivo."))
    return resultado


@router.post("/text/correct")
def correct_text(req: CorrectRequest):
    sanitizado = assistant.sanitizador.limpiar_texto(req.text)
    corregido = assistant.typo_corrector.correct_text(sanitizado)
    return {"original": req.text, "sanitizado": sanitizado, "corregido": corregido}


@router.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    api_key: Optional[str] = Form(None),
    vision_model: Optional[str] = Form(None)
):
    # 1. Sanitizar estrictamente el nombre para evitar Path Traversal
    clean_filename = assistant.sanitizador.sanitizar_nombre_archivo(file.filename)
    ARCHIVOS_DIR.mkdir(parents=True, exist_ok=True)
    file_path = ARCHIVOS_DIR / clean_filename

    # 2. Escribir mediante streaming por chunks para no desbordar RAM
    try:
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 64):  # 64 KB chunks
                buffer.write(chunk)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar el archivo: {e}")

    # 3. Procesar archivo offline con el nuevo motor
    result = assistant.file_processor.process_local_file(str(file_path))
    if not result.get("success"):
        raise HTTPException(status_code=422, detail=result.get("error", "Error procesando el archivo"))

    result["stored_path"] = str(file_path)
    return result


@router.post("/system/shutdown")
def shutdown():
    import threading
    import time

    def terminate():
        time.sleep(0.5)
        os._exit(0)

    threading.Thread(target=terminate, daemon=True).start()
    return {"status": "shutting_down", "message": "Servidor Kofu detenido."}
