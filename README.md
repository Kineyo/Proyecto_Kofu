# LarIA v0.7

<p align="center">
  <img src="assets/banner laria.jpeg" alt="Banner LarIA" width="80%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Ollama-Local%20AI-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama">
  <img src="https://img.shields.io/badge/Microsoft%20Office-DOCX%20%7C%20PPTX-D83B01?style=for-the-badge&logo=microsoftoffice&logoColor=white" alt="OpenXML">
  <img src="https://img.shields.io/badge/License-MIT-00f5d4?style=for-the-badge&logoColor=black" alt="MIT License">
  <img src="https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows%20%7C%20macOS-7928CA?style=for-the-badge" alt="Platforms">
</p>

---

## ⚡ ¿Qué es LarIA?

**LarIA** es un proyecto experimental que nace a partir de la arquitectura de Kofu con una premisa clara: **¿Qué pasaría si diseñamos un asistente de IA para Office enfocado exclusivamente en la velocidad extrema, la baja latencia y el minimalismo?**

Mientras que Kofu está pensado como una suite exhaustiva y profunda para documentos de gran volumen, **LarIA prioriza la agilidad**: genera documentos Word (`.docx`) y presentaciones PowerPoint (`.pptx`) de forma casi instantánea, **100% offline** y sin necesidad de tener instalado Microsoft Office ni LibreOffice en el equipo.

---

## ⚖️ Diferencias Principales entre LarIA y Kofu

| Característica | Kofu (Rama `main` v1.5) | LarIA (Rama `LarIA-(Beta)` v0.7) |
|---|---|---|
| **Filosofía** | Suite ofimática integral, profunda y estructurada | Motor ultrarrápido, ágil y de respuesta inmediata |
| **Latencia de Respuesta** | Mayor profundidad analítica por sección | Respuestas y generaciones ultrarrápidas con mínima latencia |
| **Flujo de Razonamiento** | Cadena de pensamiento detallada y paso a paso | Razonamiento directo, técnico y conciso |
| **Tipo de Documentos** | Informes extensos, densos y exhaustivos | Documentos ejecutivos, minutas y presentaciones al grano |
| **Consumo de Recursos** | Moderado (ideal para análisis completos) | Mínimo (huella de memoria optimizada) |
| **Tiempo de Generación** | Optimizado para profundidad estructural | Optimizado para velocidad bruta |
| **Estado y Versión** | v1.5 (Estable) | v0.7 (Beta experimental) |

---

## ✨ Funcionalidades Clave de LarIA v0.7

- **⚡ Generación Ultrarrápida**: Creación de documentos `.docx` y presentaciones `.pptx` en cuestión de segundos.
- **🔒 Operación 100% Offline**: Total privacidad; todo el razonamiento se realiza localmente mediante el motor Ollama sin enviar datos a la red.
- **📄 Ingesta Documental Local (`Document-Offline`)**: Extracción y análisis de archivos (PDF, DOCX, PPTX, Excel, imágenes y texto plano) con validación estricta de *Magic Numbers* para evitar archivos corruptos o extensiones falsas.
- **🔄 Pipeline Archivo -> Documento**: Extrae la información de cualquier archivo subido y genera un documento o presentación con el contenido real.
- **🎨 Soporte de Plantillas Office**: Compatible con plantillas `.dotx`, `.docx`, `.potx` y `.pptx`.
- **🖥️ Interfaz Cibernética Moderna**: UI futurista reactiva con *glassmorphism*, telemetría en tiempo real y selector dinámico de modelos de Ollama.
- **🛑 Apagado Limpio**: Control de apagado desde la interfaz web mediante el endpoint `/system/shutdown`.

---

## 📋 Requisitos del Sistema

- **Sistema Operativo**: Windows 10/11, Linux (Ubuntu, Debian, Fedora, Arch) o macOS (x64 / Apple Silicon).
- **Python**: Versión 3.10 o superior (recomendado 3.10 a 3.12).
- **Ollama**: Motor local de IA descargable desde [ollama.com](https://ollama.com).
  - *Modelos recomendados*:
    - `ollama pull llama3.2` (óptimo para velocidad y respuesta inmediata)
    - `ollama pull qwen2.5` o `ollama pull mistral`
- **Ofimática**: **NO** requiere tener Microsoft Office ni LibreOffice instalado en tu sistema para crear y descargar los archivos.

---

## 🚀 Instalación y Uso Rápido

### 1. Clonar e ingresar a la rama LarIA
```bash
git clone -b LarIA-(Beta) --single-branch https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu
```

### 2. Iniciar el Servidor
Ejecuta el script correspondiente a tu sistema operativo (se creará automáticamente el entorno virtual y se iniciará la interfaz):

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

Abre tu navegador o visualiza la ventana en:
👉 `http://127.0.0.1:8000`

---

## 🗺️ Roadmap de LarIA

- **v0.4 (Rama independiente)**: Separación inicial del núcleo de Kofu para experimentar con flujos ultraligeros.
- **v0.5 (Beta)**: Primeras pruebas de conexión con modelos locales y ajustes en la gestión de dependencias.
- **v0.6 (Beta)**: Simplificación de la comunicación cliente-servidor y unificación de scripts de arranque.
- **v0.7 (Actual)**:
  - Integración del motor de ingesta offline nativo **`Document-Offline`** (sin dependencias en la nube).
  - Corrección de bugs críticos en endpoints de subida (`/files/upload`) y aislamiento de plantillas temporales.
  - Implementación de la nueva interfaz futurista dark-space con telemetría en vivo.
  - Detección dinámica y fallback inteligente para modelos de Ollama.
  - Licencia estandarizada bajo **MIT**.

---

## 📄 Licencia

LarIA es un proyecto de código abierto publicado bajo los términos de la **Licencia MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.
