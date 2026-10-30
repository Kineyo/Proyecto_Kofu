# Kofu v1.5 // Autonomous Neural Office Engine

**Kofu** es un asistente autónomo de creación de documentos Word (`.docx`) y presentaciones PowerPoint (`.pptx`) con estilos profesionales, **100% offline** y sin necesidad de tener instalado Microsoft Office ni LibreOffice. Utiliza el motor local **Ollama** para razonamiento e ingesta documental offline de alto rendimiento.

---

## ⚡ Novedades de la Versión 1.5

- **Ingesta Documental 100% Offline**: Reemplazo de MarkItDown por el motor nativo de ingesta de documentos (`Document-Offline`), con validación estricta de *Magic Numbers* (evita archivos falsificados) y extracción local para PDF, Word, PowerPoint, imágenes y texto plano sin dependencias de la nube.
- **Pipeline de Documentos Inteligente**: Ahora puedes subir un archivo (PDF, DOCX, TXT) y Kofu extraerá su contenido real para redactar un nuevo informe o estructurar diapositivas automáticamente.
- **Frontend Futurista y Reactivo**: Interfaz moderna inspirada en estética cyberpunk/deep-space con *glassmorphism*, telemetría en tiempo real y selector dinámico de modelos de Ollama.
- **Arquitectura Eficiente y Ligera**: Eliminación de más de 5 GB de dependencias no utilizadas (`torch`, `transformers`, `langchain`). La instalación pasa de tardar 25 minutos a solo segundos.
- **Seguridad Endurecida**: Protección estricta contra *Path Traversal*, lectura arbitraria de archivos y desbordamiento de memoria por streaming de subida.
- **Detección Dinámica de Modelos**: Selección inteligente de modelos instalados en Ollama sin bloqueos ni errores 418.
- **Licencia Open Source Oficial**: Alineada con los lineamientos de GitHub bajo la licencia estándar MIT.

---

## 📋 Requisitos del Sistema

- **Sistema Operativo**: Windows 10/11, Linux (Ubuntu, Debian, Fedora, Arch) o macOS (x64 / Apple Silicon).
- **Python**: Versión 3.10, 3.11 o 3.12.
- **Ollama**: Motor de LLMs locales instalado desde [ollama.com](https://ollama.com).
  - Modelos recomendados:
    - `ollama pull llama3.2` o `ollama pull qwen2.5`
    - `ollama pull llama3` o `ollama pull mistral`
- **Ofimática**: **NO** es necesario tener Microsoft Office ni LibreOffice instalado para generar los documentos.

---

## 🚀 Instalación y Uso Rápido

### 1. Clonar o descargar el proyecto
```bash
git clone https://github.com/tu-usuario/Proyecto_Kofu.git
cd Proyecto_Kofu
```

### 2. Iniciar Kofu
Ejecuta el script correspondiente a tu sistema operativo:

- **Linux / macOS**:
  ```bash
  chmod +x run.sh
  ./run.sh
  ```
- **Windows (CMD)**:
  ```cmd
  run.bat
  ```
- **Windows (PowerShell)**:
  ```powershell
  .\run.ps1
  ```

El script configurará automáticamente un entorno virtual e iniciará Kofu abriendo la interfaz en tu navegador o ventana nativa en `http://127.0.0.1:8000`.

---

## 🛠️ Stack Tecnológico

- **Backend**: Python 3, FastAPI, Uvicorn (Arquitectura asíncrona pura en Python).
- **Generación Ofimática**: `python-docx`, `python-pptx`, OpenXML nativo.
- **Ingesta Documental**: `pypdf`, `pymupdf` (opcional), `openpyxl`, `Pillow`.
- **Inteligencia Artificial Local**: Ollama REST API (sin sobrecargas de librerías intermedias).
- **Frontend**: Vanilla HTML5, CSS3 cibernético moderno con variables CSS y JavaScript reactivo.

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.
