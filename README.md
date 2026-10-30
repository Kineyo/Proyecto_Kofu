# Kofu v1.5

<p align="center">
  <img src="assets/banner kofu2.jpeg" alt="Banner Kofu" width="80%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Ollama-Offline%20LLM-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama">
  <img src="https://img.shields.io/badge/Microsoft%20Office-DOCX%20%7C%20PPTX-D83B01?style=for-the-badge&logo=microsoftoffice&logoColor=white" alt="OpenXML">
  <img src="https://img.shields.io/badge/License-MIT-00f5d4?style=for-the-badge&logoColor=black" alt="MIT License">
  <img src="https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows%20%7C%20macOS-7928CA?style=for-the-badge" alt="Platforms">
</p>

---

## ⚡ ¿Qué es Kofu?

**Kofu** es un asistente autónomo y multiplataforma de generación de documentos Word (`.docx`) y presentaciones PowerPoint (`.pptx`) con estilos y plantillas profesionales. Funciona de manera **100% offline**, sin depender de la nube ni requerir tener instalado Microsoft Office o LibreOffice en tu equipo.

Utiliza el motor local **Ollama** para el razonamiento e integración contextual, y un sistema nativo de **ingesta documental offline** con validación estricta de *Magic Numbers* para leer, resumir y transformar tus archivos locales en nuevos documentos y diapositivas.

---

## ✨ Funcionalidades Principales

- **📄 Generador de Documentos Word (`.docx`)**: Crea informes, ensayos y documentos técnicos estructurados con títulos, párrafos alineados, negritas y tablas automáticamente.
- **📊 Generador de Presentaciones PowerPoint (`.pptx`)**: Genera presentaciones con portadas, diapositivas de contenido, viñetas y formatos ejecutivos.
- **⚡ Motor 100% Offline**: Opera localmente garantizando máxima privacidad para tus datos y documentos confidenciales.
- **🔍 Ingesta Documental Inteligente**: Arrastra o sube cualquier archivo (PDF, Word, Excel, PowerPoint, imágenes o texto plano). Kofu extrae su información real y la utiliza como base para redactar tus nuevos documentos.
- **🎨 Plantillas Personalizadas**: Aplica plantillas de diseño integradas (`.dotx`, `.docx`, `.potx`, `.pptx`) o añade tus propias plantillas corporativas.
- **🌐 Modo Híbrido Opcional (Online)**: Si lo deseas, conecta claves de Gemini o OpenAI para potenciar el razonamiento cuando tengas conexión a internet.
- **🖥️ Interfaz Futurista y Reactiva**: Panel de control con estética cibernética/dark space, telemetría de tareas en vivo y conmutador dinámico de modelos.

---

## 📋 Requisitos del Sistema

- **Sistema Operativo**: Windows 10/11, Linux (Ubuntu, Debian, Fedora, Arch) o macOS (x64 / Apple Silicon).
- **Python**: Versión 3.10 o superior (recomendado 3.10 a 3.12).
- **Ollama**: Motor para modelos locales. Descárgalo desde [ollama.com](https://ollama.com).
  - *Familia de Modelos Recomendada (Qwen 2.5)*:
    - **Recomendado Principal (Equilibrado)**: `ollama run qwen2.5:7b` (Alta precisión en español y estructura)
    - **Documentos Técnicos y Código**: `ollama run qwen2.5-coder:7b` (OpenXML, tablas y Markdown estricto)
    - **Máxima Profundidad y Razonamiento**: `ollama run qwen2.5:14b` (Calidad académica superior)
    - **Laptops y Modo Ligero (Bajo Consumo)**: `ollama run qwen2.5:3b` o `ollama run qwen2.5:1.5b`
    - *(En la interfaz web dispones del Hub de Modelos con enlaces a Ollama, Hugging Face oficial y versiones GGUF con fine-tuning)*.
- **Ofimática (Office / LibreOffice)**:
  - **Para crear y exportar**: **NO** es necesario tener Microsoft Office ni LibreOffice instalado. Kofu construye los archivos nativamente mediante bibliotecas de OpenXML.
  - **Para visualizarlos**: Cualquier visor compatible con `.docx` y `.pptx`.
- **Memoria RAM**: 8 GB mínimo (16 GB recomendados para modelos locales de 7B o 8B en GPU/CPU).

---

## 🚀 Instalación y Uso Rápido

### 1. Clonar el repositorio
```bash
git clone https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu
```

### 2. Iniciar Kofu
Ejecuta el script de inicio correspondiente a tu sistema operativo. El script creará automáticamente el entorno virtual (`env`), instalará las dependencias necesarias y levantará el servidor abriendo la interfaz:

- **Linux**:
  ```bash
  chmod +x run.sh
  ./run.sh
  ```
- **macOS**:
  ```bash
  chmod +x run.command
  ./run.command
  ```
- **Windows (CMD)**:
  ```cmd
  run.bat
  ```
- **Windows (PowerShell)**:
  ```powershell
  .\run.ps1
  ```

Una vez iniciado, accede a la interfaz en tu navegador o ventana nativa en:
👉 `http://127.0.0.1:8000`

---

## 🧩 Ingesta Documental Offline (`Document-Offline`)

Kofu integra un motor de extracción y lectura de documentos local de alta velocidad, eliminando dependencias pesadas en la nube:

- **Validación de Magic Numbers**: Verifica los primeros bytes del archivo (cabeceras binarias) para certificar que el contenido coincida exactamente con su extensión antes de procesarlo.
- **Formatos soportados nativamente**:
  - **Documentos**: PDF (`.pdf`), Microsoft Word (`.docx`), Microsoft PowerPoint (`.pptx`), Microsoft Excel (`.xlsx`, `.xls`).
  - **Texto y Datos**: Markdown (`.md`), Texto Plano (`.txt`), CSV (`.csv`), JSON (`.json`), XML (`.xml`), HTML (`.html`).
  - **Imágenes**: JPG, PNG, WEBP, BMP, TIFF (vía RapidOCR / Tesseract local).

---

## 🗺️ Roadmap de Versiones

- **v0.3 (Estable)**: Generación inicial de documentos simples y conexión local por consola.
- **v0.5 (Estable)**: Integración de módulos de investigación web y soporte preliminar de formatos.
- **v0.6 (Estable)**: Mejoras de frontend, módulos de sanitización inicial y endpoints de API.
- **v0.7 (Beta)**: Integración con motor Ollama para razonamiento local y soporte de plantillas de Office.
- **v0.8 (Estable)**: Resolución de políticas CORS, estabilidad en generación de archivos y control de descargas.
- **v0.9 (Beta)**: Comunicación estable mediante servidor ASGI (FastAPI + Uvicorn) y ramificación del proyecto a LarIA.
- **v1.0 (Estable)**: Primera versión completamente autónoma sin dependencia de Microsoft Office, uso de plantillas dinámicas e inyección de contexto.
- **v1.1 (Estable)**: Ejecución multiplataforma con scripts de arranque automatizados y soporte para catálogos ampliados de modelos.
- **v1.5 (Actual)**: 
  - Reemplazo completo de dependencias de nube por el motor de ingesta local **Document-Offline**.
  - Pipeline real de generación a partir de archivos subidos por el usuario.
  - Nueva interfaz futurista con estética cibernética, telemetría y controles en caliente.
  - Eliminación de más de 5 GB de librerías innecesarias de Deep Learning para un arranque ultraligero.
  - Protección estricta contra *Path Traversal* y lectura indebida de archivos.
  - Licencia de código abierto estandarizada bajo **MIT**.

---

## 🛡️ Licencia y Términos de Uso

Kofu es un proyecto de código abierto publicado bajo los términos de la **Licencia MIT**.

- **Uso y Estudio**: Eres libre de descargar, utilizar, inspeccionar y modificar el código para tus propios proyectos personales, educativos o comerciales.
- **Atribución Requerida**: Cualquier distribución o derivado del código debe mantener el aviso de copyright y crédito al autor original.
- **Sin Garantías**: El software se proporciona "tal cual" (*AS IS*), sin garantías de ningún tipo.

Para más información, consulta el archivo [`LICENSE`](LICENSE).
