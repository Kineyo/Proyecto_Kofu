# Kofu C++

**Rama experimental de Kofu escrita en C++ (`.cpp` y `.hpp`).**

Esta rama es una reimplementacion experimental del backend de Kofu. No debe
considerarse una version estable ni un reemplazo completo de la version
Python. El programa compila un ejecutable llamado `kofu`, inicia un servidor
HTTP local y se comunica con Ollama mediante su API REST.

## Estado de esta rama

- Backend experimental en C++17/C++20.
- Servidor HTTP basado en `cpp-httplib`.
- Cliente para Ollama y seleccion dinamica de modelos por tipo de tarea.
- Motor de razonamiento local basado en reglas, con enriquecimiento mediante
  Ollama.
- Generacion nativa de documentos Office Open XML: `.docx` y `.pptx`.
- Uso de plantillas `.dotx` y `.potx`, estilos, temas y copias de respaldo.
- Sanitizacion de entradas y correccion de errores frecuentes en espanol e
  ingles.
- Investigacion web mediante Google Custom Search, DuckDuckGo o Bing, segun
  la configuracion disponible.
- **MarkItDown aun no esta portado a C++**. El digest y el procesamiento
  automatico de archivos no estan disponibles en esta version.
- La interfaz estatica se sirve desde `web/` si ese directorio existe; el
  arbol actual de esta rama no incluye ese directorio.

## Funcionalidades implementadas

El ejecutable integra los siguientes modulos:

- `config`: carga `.env`, variables de entorno, rutas del proyecto y puertos.
- `ollama_client`: consulta modelos y genera o razona con Ollama.
- `model_router`: selecciona el modelo adecuado para razonamiento,
  investigacion, documentos o presentaciones.
- `reasoning`: reglas locales, cadena de razonamiento y respuesta con Ollama.
- `sanitizer`: limpieza de entradas, nombres de archivo y correccion
  ortografica basica.
- `knowledge_base`: consejos estaticos para Word y PowerPoint.
- `web_research`: busqueda y resumen de informacion web.
- `docx_generator`: crea documentos Word desde cero o a partir de `.dotx`.
- `pptx_generator`: crea presentaciones PowerPoint desde cero o a partir de
  `.potx`.
- `assistant`: orquesta las tareas de chat, investigacion y generacion.
- `http_server`: expone la API y sirve los archivos estaticos del frontend.

Los documentos generados se guardan en `output/` y sus copias de respaldo en
`Archivos/`. Esas carpetas se crean automaticamente al iniciar el programa.

## Requisitos

- CMake 3.20 o superior.
- Compilador compatible con C++17; CMake usa C++20 cuando el compilador lo
  soporta.
- `pkg-config`.
- `libzip` y sus archivos de desarrollo.
- Ollama instalado y ejecutandose en `http://localhost:11434` por defecto.
- Conexion a Internet solo para descargar dependencias de CMake, consultar
  servicios de investigacion web o descargar modelos de Ollama.

No se necesita Microsoft Office ni LibreOffice para generar los archivos.
Para abrirlos se necesita una aplicacion compatible con `.docx` o `.pptx`, como
Microsoft Office o LibreOffice.

### Dependencias descargadas por CMake

Durante la configuracion, `FetchContent` descarga estas versiones:

- `cpp-httplib` v0.18.3
- `nlohmann/json` v3.11.3
- `pugixml` v1.14

## Compilacion

Desde la raiz del repositorio:

```bash
sudo apt install cmake g++ pkg-config libzip-dev
cmake -S kofu-cpp -B kofu-cpp/build -DCMAKE_BUILD_TYPE=Release
cmake --build kofu-cpp/build --parallel
```

Para una compilacion de depuracion con AddressSanitizer y UndefinedBehaviorSanitizer:

```bash
cmake -S kofu-cpp -B kofu-cpp/build-debug -DCMAKE_BUILD_TYPE=Debug
cmake --build kofu-cpp/build-debug --parallel
```

El binario resultante es `kofu-cpp/build/kofu` o
`kofu-cpp/build-debug/kofu`.

## Configuracion

El programa busca un archivo `.env` en la raiz del proyecto. Las variables de
entorno tienen prioridad sobre los valores del archivo.

Ejemplo:

```dotenv
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL_PRIMARY=gemma4:latest
OLLAMA_MODEL_FALLBACK=llama3:latest
LLM_MODEL_NAME=gemma4:latest
USE_LOCAL_LLM=true
GOOGLE_API_KEY=
GOOGLE_CX=
```

Variables reconocidas:

| Variable | Uso | Valor predeterminado |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | URL del servidor Ollama | `http://localhost:11434` |
| `OLLAMA_MODEL` | Modelo principal | sin definir |
| `OLLAMA_MODEL_PRIMARY` | Modelo principal alternativo | sin definir |
| `OLLAMA_MODEL_FALLBACK` | Modelo de respaldo | sin definir |
| `LLM_MODEL_NAME` | Modelo por defecto del asistente | primer modelo disponible |
| `USE_LOCAL_LLM` | Activa el uso de Ollama | `true` |
| `GOOGLE_API_KEY` | Clave de Google Custom Search | vacia |
| `GOOGLE_CX` | Identificador del buscador de Google | vacio |

Si no se encuentran puertos libres en `8000`, `8080`, `3000` o `5000`, el
servidor solicita un puerto aleatorio al sistema operativo.

## Ollama

Inicia Ollama y descarga al menos un modelo compatible con tu equipo:

```bash
ollama serve
ollama pull gemma4:latest
ollama pull llama3:latest
```

Los nombres de modelo se pueden cambiar mediante las variables de entorno
anteriores. El endpoint `/health` informa si Ollama esta disponible y que
modelos puede consultar.

## Ejecucion

```bash
./kofu-cpp/build/kofu
```

El servidor escucha en todas las interfaces (`0.0.0.0`) y selecciona el primer
puerto disponible de su lista de preferencia. La raiz `/` redirige a
`/web/index.html` cuando el frontend esta instalado.

## API HTTP

Rutas disponibles en el servidor C++:

| Metodo | Ruta | Funcion |
| --- | --- | --- |
| `GET` | `/health` | Estado del servidor y de Ollama |
| `GET` | `/ollama/models` | Modelos instalados en Ollama |
| `GET` | `/templates` | Plantillas Word y PowerPoint disponibles |
| `POST` | `/chat` | Chat y razonamiento |
| `POST` | `/research` | Investigacion y resumen web |
| `POST` | `/office/word` | Genera un documento `.docx` |
| `POST` | `/office/word/download` | Descarga un documento Word |
| `POST` | `/office/powerpoint` | Genera una presentacion `.pptx` |
| `POST` | `/office/powerpoint/download` | Descarga una presentacion |
| `POST` | `/office/tips` | Consejos para Word o PowerPoint |
| `POST` | `/text/correct` | Corrige texto sanitizado |
| `POST` | `/files/upload` | Guarda una carga de archivo |
| `POST` | `/files/digest` | Devuelve que la funcion no esta portada |

Las rutas esperan y devuelven JSON, salvo las rutas de descarga. La API
habilita CORS para facilitar el uso desde un frontend local.

## Plantillas incluidas

- PowerPoint: `templates/powerpoint/` con plantillas `.potx`.
- Word: `templates/word/` con plantillas `.dotx`.

Los archivos temporales que empiezan por `~$` se ignoran al listar plantillas.

## Empaquetado

El proyecto incluye configuracion de CPack para generar paquetes `DEB` y
`TGZ` en Linux, `NSIS` y `ZIP` en Windows, y `DragNDrop` y `TGZ` en macOS:

```bash
cd kofu-cpp/build
cpack
```

Tambien se incluye la entrada de escritorio Linux en
`kofu-cpp/packaging/kofu.desktop`.

## Limitaciones conocidas

- Esta rama es experimental y puede contener incompatibilidades con el
  backend Python original.
- No hay pruebas automatizadas ni frontend C++ incluido en el arbol mostrado.
- MarkItDown no esta disponible: `/files/digest` no procesa PDF, DOCX, PPTX,
  imagenes ni audio.
- Google Custom Search necesita `GOOGLE_API_KEY` y `GOOGLE_CX`; si no estan
  configuradas, el codigo intenta usar buscadores alternativos sujetos a su
  disponibilidad y a la red.
- El servicio debe tratarse como local de confianza: escucha en `0.0.0.0` y
  las cabeceras CORS permiten cualquier origen.

## Licencia

Consulta [LICENSE](LICENSE) para los terminos del proyecto y las licencias de
las dependencias de terceros.
