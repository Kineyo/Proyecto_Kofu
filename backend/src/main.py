import os
import sys
import subprocess
import time
import multiprocessing
import uvicorn
import threading
import argparse
import webbrowser
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from api import app

def start_ollama():
    from config import DEFAULT_OLLAMA_URL
    try:
        import urllib.request
        try:
            urllib.request.urlopen(DEFAULT_OLLAMA_URL, timeout=1)
        except Exception:
            print("Iniciando servicio nativo de Ollama en segundo plano...")
            subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(2)
    except Exception:
        pass

def run_server():
    config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="warning", ws="none")
    server = uvicorn.Server(config)
    server.run()

def main():
    parser = argparse.ArgumentParser(description="Kofu AI Server")
    parser.add_argument("--browser", action="store_true", help="Launch in web browser instead of PyWebView")
    args, unknown = parser.parse_known_args()

    print("========================================")
    print("   Kofu v1.1.02.01 (Beta) - Servidor de IA")
    print("========================================")
    
    start_ollama()
    
    print("Levantando servicio unificado (Backend + Frontend) en puerto 8000...")
    
    # Configure Web Server and API
    from paths import WEB_DIR
    web_dir = str(WEB_DIR)
    app.mount("/web", StaticFiles(directory=web_dir), name="web")
    
    @app.get("/")
    def read_root():
        return RedirectResponse(url="/web/index.html")

    # Start the FastAPI server in a background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    print("\nTodos los servicios iniciados correctamente.")
    time.sleep(2)  # Give the server a moment to start
    
    if args.browser:
        print("Iniciando en Navegador Web...")
        webbrowser.open('http://127.0.0.1:8000/')
        # Keep main thread alive
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
    else:
        print("Iniciando Interfaz Gráfica (PyWebView)...")
        import webview
        webview.create_window('Kofu AI', 'http://127.0.0.1:8000/', width=1280, height=800)
        webview.start()
    
    print("Servidor detenido.")

if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
