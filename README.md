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

## 🌿 ¿Qué rama escoger? (Guía de Versiones)

El repositorio de **Kofu** cuenta con ramas especializadas según la potencia de tu equipo, tus requerimientos de latencia y tu entorno de ejecución:

| Rama | Versión / Estado | Lenguaje / Motor | Huella de RAM | Caso de Uso Ideal |
| :--- | :---: | :--- | :---: | :--- |
| [**`main`**](#-1-rama-main-kofu-v15---edición-completa-recomendada) | `v1.5` (Estable) | Python 3.10+ (FastAPI) | 8 – 16 GB | Suite ofimática completa, análisis documental profundo y reportes densos. |
| [**`LarIA-(Beta)`**](#-2-rama-laria-beta-v07---edición-ultraligera) | `v0.7` (Beta) | Python 3.10+ (FastAPI) | 6 – 8 GB | Velocidad extrema, baja latencia, minutas ejecutivas y bajo consumo térmico. |
| [**`kofu-cpp`**](#-3-rama-kofu-cpp-v20---edición-nativa-c20) | `v2.0` (Nativa) | C++20 / C Nativo | < 30 MB *(Backend)* | Máximo rendimiento, arranque en < 2 ms, binario de 969 KB, **cero Python**. |
| [**`plantillas`**](#-4-rama-plantillas-catálogo-oficial) | `Oficial` | Formatos OpenXML | Mínimo | Paquetes oficiales con 66+ plantillas profesionales (`.dotx` y `.potx`). |

---

### 🌟 1. Rama `main` (Kofu v1.5 - Edición Completa Recomendada)

Si buscas la experiencia completa con todas las herramientas de Kofu, análisis contextual exhaustivo y tienes un equipo estándar o potente:

> [!TIP]
> Es la rama principal y más completa. Incluye el motor de ingesta multinúcleo **Document-Offline**, generación enriquecida con plantillas, telemetría y razonamiento profundo con la familia de modelos Ollama.

#### 📋 Requisitos Reales del Sistema:
- **Memoria RAM**: 8 GB mínimo (para modelos ligeros como `qwen2.5:3b`) | **16 GB recomendados** (para modelos de 7B u 8B).
- **Almacenamiento Libre**: 25 GB a 30 GB (espacio para modelos de Ollama y archivos de trabajo).
- **Procesador (CPU)**: 4 núcleos físicos o superior (arquitectura x86_64 o Apple Silicon M-Series).
- **Intérprete Python**: Python 3.10 o superior (recomendado 3.10 a 3.12).
- **Motor de IA Local**: [Ollama](https://ollama.com) ejecutándose localmente (`ollama run qwen2.5:7b`).
- **Navegador Web**: Cualquier navegador moderno (Chrome, Firefox, Edge, Safari, Brave).
- **Sistema Operativo**: Windows 10/11, distribuciones Linux (Ubuntu, Debian, Fedora, Arch) o macOS (Intel / Apple Silicon).
- **Ofimática**: **NO** requiere tener Microsoft Office ni LibreOffice instalado.

#### 🚀 Instalación y Ejecución:

<details>
<summary>🐧 <b>Instalación y ejecución en Linux</b> (clic para desplegar)</summary>

```bash
# 1. Clonar la rama main
git clone -b main https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

# 2. Iniciar con el script automatizado (crea el entorno virtual e instala dependencias automáticamente)
chmod +x run.sh
./run.sh
```

*(Opcional: Si prefieres configurar el entorno manualmente)*:
```bash
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
cd backend/src
python3 main.py --browser
```

</details>

<details>
<summary>🪟 <b>Instalación y ejecución en Windows</b> (CMD y PowerShell) (clic para desplegar)</summary>

**Opción A: Desde el Símbolo del Sistema (CMD)**
```cmd
:: 1. Clonar el repositorio
git clone -b main https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

:: 2. Ejecutar el script automatizado (configura el entorno e inicia Kofu)
run.bat
```

**Opción B: Desde PowerShell**
```powershell
# 1. Clonar el repositorio
git clone -b main https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

# 2. Ejecutar el script de PowerShell
.\run.ps1
```

*(Opcional: Si prefieres configurar el entorno manualmente en CMD)*:
```cmd
python -m venv env
call .\env\Scripts\activate.bat
pip install -r requirements.txt
cd backend\src
python main.py --browser
```

</details>

<details>
<summary>🍏 <b>Instalación y ejecución en macOS</b> (clic para desplegar)</summary>

```bash
# 1. Clonar la rama main
git clone -b main https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

# 2. Dar permisos de ejecución y arrancar
chmod +x run.command
./run.command
```

*(Opcional: Configuración manual)*:
```bash
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
cd backend/src
python3 main.py --browser
```

</details>

---

### ⚡ 2. Rama `LarIA-(Beta)` (v0.7 - Edición Ultraligera y Rápida)

Diseñada para quienes buscan **velocidad de respuesta extrema, mínima latencia y bajo consumo de recursos**. Perfecta para laptops o equipos con recursos ajustados que necesitan minutas, síntesis ejecutivas y documentos concisos sin sobrecalentar el procesador.

#### 📋 Requisitos Reales del Sistema:
- **Memoria RAM**: 6 GB a 8 GB (DDR4 / DDR5) suficientes para operar modelos compactos.
- **Almacenamiento Libre**: 10 GB a 15 GB (los modelos ligeros de Ollama ocupan solo entre 1 y 2.5 GB).
- **Procesador (CPU)**: 2 a 4 núcleos modernos (arquitecturas recientes x86_64 o ARM).
- **Intérprete Python**: Python 3.10 o superior (recomendado 3.10 a 3.12).
- **Motor de IA Local**: [Ollama](https://ollama.com) con modelos ultrarrápidos recomendados: `ollama run qwen2.5:1.5b` o `ollama run qwen2.5:3b`.
- **Navegador Web**: Cualquier navegador moderno.
- **Sistema Operativo**: Windows, Linux o macOS.

#### 🚀 Instalación y Ejecución:

<details>
<summary>🐧 <b>Instalación y ejecución en Linux</b> (clic para desplegar)</summary>

```bash
# 1. Clonar únicamente la rama LarIA
git clone -b "LarIA-(Beta)" --single-branch https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

# 2. Dar permisos de ejecución y arrancar
chmod +x run.sh
./run.sh
```

</details>

<details>
<summary>🪟 <b>Instalación y ejecución en Windows</b> (CMD y PowerShell) (clic para desplegar)</summary>

**Opción A: Desde CMD**
```cmd
:: 1. Clonar la rama LarIA
git clone -b "LarIA-(Beta)" --single-branch https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

:: 2. Ejecutar el script automatizado
run.bat
```

**Opción B: Desde PowerShell**
```powershell
# 1. Clonar la rama LarIA
git clone -b "LarIA-(Beta)" --single-branch https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

# 2. Ejecutar
.\run.ps1
```

</details>

<details>
<summary>🍏 <b>Instalación y ejecución en macOS</b> (clic para desplegar)</summary>

```bash
# 1. Clonar la rama LarIA
git clone -b "LarIA-(Beta)" --single-branch https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

# 2. Dar permisos y ejecutar
chmod +x run.command
./run.command
```

</details>

---

### 🚀 3. Rama `kofu-cpp` (v2.0 - Edición Nativa en C++20 de Alto Rendimiento)

Reimplementación nativa total del backend en **C++20 y C puro**. **¡No requiere intérprete de Python, pip ni entornos virtuales!** Genera un binario compilado ultra-ligero de tan solo **969 KB** con optimizaciones LTO (`-flto -O2 -march=native`), arranque instantáneo en menos de **2 milisegundos** y una huella de memoria en el backend menor a 30 MB.

#### 📋 Requisitos Reales del Sistema:
- **Compilador C++**: GCC 11+, Clang 14+ o MSVC 2019+ compatible con el estándar **C++20**.
- **Gestor de Compilación**: CMake 3.20 o superior.
- **Python**: **NO es necesario**. Todo el servidor, manipulación OpenXML (`pugixml` + `libzip`) e ingesta binaria están compilados en código máquina nativo.
- **Memoria RAM**: 8 GB recomendados (el backend C++ consume < 30 MB; la memoria se destina a Ollama para inferencia).
- **Almacenamiento Libre**: 15 GB a 20 GB (herramientas de compilación y modelos Ollama).
- **Procesador (CPU)**: 4 núcleos o más (recomendado para compilar en paralelo `make -j` y ejecutar inferencia).
- **Librerías del Sistema**: Zlib y OpenSSL (opcionales; activan HTTPS nativo para investigación web).
- **Motor de IA Local**: [Ollama](https://ollama.com) optimizado para modelos Qwen (`qwen2.5:7b`, `qwen2.5:3b`, `qwen2.5-coder:7b`).

#### 🚀 Compilación y Ejecución:

<details>
<summary>🐧 <b>Compilación y ejecución en Linux</b> (clic para desplegar)</summary>

```bash
# 1. Clonar la rama kofu-cpp
git clone -b kofu-cpp --single-branch https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

# 2. Instalar herramientas de compilación básicas (ejemplo Debian/Ubuntu)
sudo apt update && sudo apt install -y build-essential cmake

# 3. Configurar CMake en modo Release (descarga dependencias automáticamente vía FetchContent)
cmake -S kofu-cpp -B kofu-cpp/build -DCMAKE_BUILD_TYPE=Release

# 4. Compilar en paralelo con todos los núcleos del procesador
cmake --build kofu-cpp/build -j$(nproc)

# 5. Ejecutar el binario nativo (inicia en < 2 ms en http://localhost:8000)
./kofu-cpp/build/kofu
```

</details>

<details>
<summary>🪟 <b>Compilación y ejecución en Windows</b> (MSVC / Visual Studio) (clic para desplegar)</summary>

```cmd
:: 1. Clonar la rama kofu-cpp
git clone -b kofu-cpp --single-branch https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

:: 2. Configurar con CMake (usando las herramientas de C++ de Visual Studio 2019/2022)
cmake -S kofu-cpp -B kofu-cpp/build -DCMAKE_BUILD_TYPE=Release

:: 3. Compilar en Release
cmake --build kofu-cpp/build --config Release

:: 4. Iniciar el servidor nativo
.\kofu-cpp\build\Release\kofu.exe
```

</details>

<details>
<summary>🍏 <b>Compilación y ejecución en macOS</b> (clic para desplegar)</summary>

```bash
# 1. Clonar la rama kofu-cpp
git clone -b kofu-cpp --single-branch https://github.com/shebxyd-pixel/Proyecto_Kofu.git
cd Proyecto_Kofu

# 2. Instalar CMake (vía Homebrew si no está disponible) y herramientas de Xcode
xcode-select --install
brew install cmake

# 3. Configurar y compilar en Release
cmake -S kofu-cpp -B kofu-cpp/build -DCMAKE_BUILD_TYPE=Release
cmake --build kofu-cpp/build -j$(sysctl -n hw.ncpu)

# 4. Iniciar el binario compilado
./kofu-cpp/build/kofu
```

</details>

---

### 📦 4. Rama `plantillas` (Catálogo Oficial de Estilos y Diseños)

Rama huérfana (*orphan branch*) dedicada a almacenar y servir los **11 paquetes temáticos oficiales** con más de **66 plantillas maestras** editables (`.dotx` para Word y `.potx` para PowerPoint), incluyendo normas APA 7ma edición, formatos institucionales, corporativos, jurídicos, técnicos y creativos.

#### 📋 Requisitos:
- **Compatibilidad**: Compatible con cualquiera de las ramas (`main`, `LarIA-(Beta)` o `kofu-cpp`).
- **Almacenamiento**: ~100 MB para los paquetes de plantillas.
- **Hardware**: Cualquier equipo (sin requerimientos de RAM o CPU específicos).

#### 🚀 Cómo Usarlas:

<details>
<summary>📦 <b>Ver métodos de instalación de plantillas</b> (clic para desplegar)</summary>

**Método 1: Automático desde la Interfaz Web (Recomendado)**
- Inicia Kofu en cualquiera de sus ramas (`main`, `LarIA-(Beta)` o `kofu-cpp`).
- En la barra superior, haz clic en el botón **"📦 Centro de Plantillas"**.
- Haz clic en **"Descargar Paquete"** en la categoría deseada; Kofu las instalará automáticamente.

**Método 2: Clonación e Instalación Manual**
```bash
# 1. Clonar la rama de plantillas en una carpeta separada
git clone -b plantillas --single-branch https://github.com/shebxyd-pixel/Proyecto_Kofu.git plantillas-kofu

# 2. Copiar los archivos descomprimidos a las carpetas de Kofu:
# - Copiar archivos .dotx en: templates/word/
# - Copiar archivos .potx en: templates/powerpoint/
```

</details>

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
- **v1.2 (Parche)**:
  + Correccion de archivos.
- **v1.3 (Parche)**:
  + Correccion de archivos
- **v1.4 (Parche)**:
  + Correccion de archivos
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
