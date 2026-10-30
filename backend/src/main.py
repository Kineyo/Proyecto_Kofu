# -*- coding: utf-8 -*-
"""
LarIA AI v1.5 - Orquestador Principal
"""
import argparse
import multiprocessing
import os
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser

import uvicorn
from api import app
from config import APP_VERSION, APP_NAME, find_free_port, PREFERRED_PORTS, DEFAULT_OLLAMA_URL
from paths import WEB_DIR


def start_ollama():
    try:
        urllib.request.urlopen(DEFAULT_OLLAMA_URL, timeout=1.5)
    except Exception:
        try:
            print("Iniciando servicio de Ollama en segundo plano...")
            subprocess.Popen(
                ["ollama", "serve"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            time.sleep(2)
        except Exception:
            pass


def main():
    parser = argparse.ArgumentParser(description=f"{APP_NAME} Server v{APP_VERSION}")
    parser.add_argument("--browser", action="store_true", help="Abrir en navegador web estándar en lugar de PyWebView")
    parser.add_argument("--port", type=int, default=None, help="Puerto personalizado para el servidor")
    args, _ = parser.parse_known_args()

    print("==================================================")
    print(f"      {APP_NAME} v{APP_VERSION} - Servidor Autónomo")
    print("==================================================")

    start_ollama()

    port = args.port or find_free_port(PREFERRED_PORTS)
    url = f"http://127.0.0.1:{port}"

    try:
        (WEB_DIR / '.port').write_text(str(port))
    except Exception:
        pass

    config = uvicorn.Config(
        app,
        host="127.0.0.1",
        port=port,
        log_level="warning",
        ws="none"
    )
    server = uvicorn.Server(config)
    server_thread = threading.Thread(target=server.run, daemon=True)
    server_thread.start()

    print(f"\n🚀 Servidor LarIA v{APP_VERSION} activo en: {url}")
    time.sleep(1.2)

    if args.browser:
        print("Abriendo interfaz en el navegador web predeterminado...")
        webbrowser.open(f"{url}/web/index.html")
        try:
            while server_thread.is_alive():
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nDeteniendo servidor LarIA...")
            server.should_exit = True
    else:
        try:
            import webview
            print("Iniciando ventana de aplicación (PyWebView)...")
            webview.create_window(f'{APP_NAME} v{APP_VERSION}', f"{url}/web/index.html", width=1280, height=840)
            webview.start()
            server.should_exit = True
        except (ImportError, Exception) as e:
            print(f"Interfaz nativa no disponible ({e}). Abriendo en navegador...")
            webbrowser.open(f"{url}/web/index.html")
            try:
                while server_thread.is_alive():
                    time.sleep(1)
            except KeyboardInterrupt:
                server.should_exit = True

    print("LarIA se ha detenido correctamente.")


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
