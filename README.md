# LarIA v1.5 // Ultra-Fast Neural Office Engine

**LarIA** es la versión ultrarrápida, ligera y optimizada de la plataforma de generación ofimática con IA. Permite crear documentos de Word (`.docx`) y presentaciones PowerPoint (`.pptx`) con plantillas profesionales, de forma **100% offline**, sin requerir Microsoft Office ni LibreOffice instalado, conectándose al motor local de **Ollama** y procesando archivos mediante el motor de ingesta de `Document-Offline`.

---

## ⚡ Características Principales de LarIA v1.5

- **Ingesta Documental Offline (Document-Offline)**: Extracción local con comprobación de *Magic Numbers* para evitar archivos falsos. Lee PDF, DOCX, PPTX, Excel, imágenes y archivos de texto sin librerías pesadas en la nube.
- **Pipeline Inteligente Archivo -> Documento**: Extrae el contenido de cualquier archivo subido para redactar informes o diapositivas basadas en la información real del usuario.
- **Interfaz Futurista y Cibernética**: Diseño moderno con *glassmorphism*, telemetría de tareas en vivo y selección dinámica de modelos Ollama.
- **Eficiencia y Cero Bloat**: Menos de 20 dependencias ligeras, descartando más de 5 GB de librerías innecesarias (`torch`, `transformers`, etc.).
- **Seguridad Endurecida**: Protección estricta contra *Path Traversal* y lectura de archivos no autorizados.

---

## 📋 Requisitos del Sistema

- **Sistema Operativo**: Windows 10/11, Linux (Ubuntu, Debian, Fedora, Arch) o macOS.
- **Python**: 3.10 o superior.
- **Ollama**: Motor local disponible en [ollama.com](https://ollama.com). Modelos recomendados:
  - `ollama pull llama3.2` o `ollama pull qwen2.5`
- **Ofimática**: **NO** requiere tener Microsoft Office ni LibreOffice instalado.

---

## 🚀 Inicio Rápido

1. Clona el repositorio e ingresa a la rama:
   ```bash
   git checkout LarIA-(Beta)
   ```
2. Ejecuta el archivo correspondiente a tu sistema:
   - **Linux / macOS**: `./run.sh`
   - **Windows (CMD)**: `run.bat`
   - **Windows (PowerShell)**: `.\run.ps1`

El servidor se iniciará en `http://127.0.0.1:8000`.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.
