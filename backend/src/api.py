# -*- coding: utf-8 -*-
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from config import find_free_port, PREFERRED_PORTS, APP_VERSION
from paths import WEB_DIR, PACKAGES_DIR
from routes import router

app = FastAPI(title="Kofu AI API", version=APP_VERSION)

# Configuración CORS segura y compatible con los navegadores modernos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Montar Paquetes de Plantillas
if PACKAGES_DIR.exists():
    app.mount("/templates/packages/static", StaticFiles(directory=str(PACKAGES_DIR)), name="templates_packages")

# Montar Frontend Web
if WEB_DIR.exists():
    app.mount("/web", StaticFiles(directory=str(WEB_DIR)), name="web")

    @app.get("/")
    def read_root():
        return RedirectResponse(url="/web/index.html")

if __name__ == "__main__":
    import uvicorn
    port = find_free_port(PREFERRED_PORTS)
    print(f"Iniciando Kofu AI v{APP_VERSION} en http://127.0.0.1:{port}")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
