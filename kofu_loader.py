import os
import sys
import subprocess
import threading
import shutil
import urllib.request
import zipfile

try:
    import tkinter as tk
    from tkinter import ttk
    HAS_TK = True
except ImportError:
    HAS_TK = False

class KofuSetupLogic:
    def __init__(self, ui):
        self.ui = ui

    def setup_windows_portable_python(self, app_dir):
        py_dir = os.path.join(app_dir, 'python_portable')
        python_exe = os.path.join(py_dir, 'python.exe')
        
        if not os.path.exists(python_exe):
            self.ui.update_status("Descargando Python Portátil (10MB)...", 5)
            os.makedirs(py_dir, exist_ok=True)
            py_zip = os.path.join(app_dir, 'python.zip')
            urllib.request.urlretrieve("https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip", py_zip)
            
            self.ui.update_status("Extrayendo entorno autónomo...", 10)
            with zipfile.ZipFile(py_zip, 'r') as zip_ref:
                zip_ref.extractall(py_dir)
            os.remove(py_zip)

            pth_file = os.path.join(py_dir, 'python311._pth')
            if os.path.exists(pth_file):
                with open(pth_file, 'a') as f:
                    f.write('\nimport site\n')

            self.ui.update_status("Instalando gestor de paquetes...", 15)
            get_pip = os.path.join(app_dir, 'get-pip.py')
            urllib.request.urlretrieve("https://bootstrap.pypa.io/get-pip.py", get_pip)
            
            subprocess.run([python_exe, get_pip], check=True, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        
        return python_exe

    def run_setup(self):
        try:
            bundle_dir = getattr(sys, '_MEIPASS', os.path.abspath(os.path.dirname(__file__)))
            
            if sys.platform == 'win32':
                app_dir = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'KofuApp')
                os.makedirs(app_dir, exist_ok=True)
                python_cmd = self.setup_windows_portable_python(app_dir)
            else:
                app_dir = os.path.join(os.path.expanduser('~'), '.local', 'share', 'KofuApp')
                os.makedirs(app_dir, exist_ok=True)
                env_dir = os.path.join(app_dir, 'env')
                python_cmd = os.path.join(env_dir, 'bin', 'python3')
                if not os.path.exists(python_cmd):
                    self.ui.update_status("Creando entorno en Linux...", 10)
                    subprocess.run([sys.executable, '-m', 'venv', env_dir], check=True)

            req_source = os.path.join(bundle_dir, 'requirements.txt')
            req_dest = os.path.join(app_dir, 'requirements.txt')
            if os.path.exists(req_source):
                shutil.copy(req_source, req_dest)

            self.ui.update_status("Descargando librerías y modelos (Tomará varios minutos)...", 20)
            
            creation_flags = getattr(subprocess, 'CREATE_NO_WINDOW', 0) if sys.platform == 'win32' else 0
            process = subprocess.Popen(
                [python_cmd, '-m', 'pip', 'install', '-r', req_dest],
                stdout=subprocess.PIPE, 
                stderr=subprocess.STDOUT, 
                text=True,
                creationflags=creation_flags
            )
            
            progress_val = 20
            while True:
                line = process.stdout.readline()
                if not line and process.poll() is not None:
                    break
                if line:
                    line_str = line.strip()
                    if "Downloading" in line_str:
                        self.ui.update_status(line_str[:55] + "...", progress_val)
                        if progress_val < 90: progress_val += 0.2
                    elif "Installing" in line_str:
                        self.ui.update_status("Instalando en disco...", 95)
            
            if process.returncode != 0:
                self.ui.update_status("Error al descargar librerías. Verifica tu internet.")
                return

            self.ui.update_status("¡Todo listo! Iniciando Kofu...", 100)
            
            main_py = os.path.join(bundle_dir, 'backend', 'src', 'main.py')
            subprocess.Popen([python_cmd, main_py], cwd=bundle_dir, creationflags=creation_flags)
            
            self.ui.on_finish()

        except Exception as e:
            self.ui.update_status(f"Error fatal: {str(e)}")

class CLILoader:
    def update_status(self, text, value=None):
        print(f"[{int(value) if value else '*'}] {text}")
        
    def on_finish(self):
        sys.exit(0)

class GUILoader:
    def __init__(self, root):
        self.root = root
        self.root.title("Kofu AI - Instalador Inicial")
        self.root.geometry("550x250")
        self.root.resizable(False, False)
        
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry('{}x{}+{}+{}'.format(width, height, x, y))

        self.label = tk.Label(root, text="Preparando Kofu AI por primera vez...", font=("Arial", 14, "bold"))
        self.label.pack(pady=20)

        self.progress = ttk.Progressbar(root, orient="horizontal", length=450, mode="determinate")
        self.progress.pack(pady=10)

        self.detail_label = tk.Label(root, text="Iniciando...", font=("Arial", 10), fg="#555555")
        self.detail_label.pack(pady=5)

    def update_status(self, text, value=None):
        self.detail_label.config(text=text)
        if value is not None:
            self.progress['value'] = value

    def on_finish(self):
        self.root.quit()

if __name__ == "__main__":
    if HAS_TK:
        root = tk.Tk()
        ui = GUILoader(root)
        logic = KofuSetupLogic(ui)
        threading.Thread(target=logic.run_setup, daemon=True).start()
        root.mainloop()
    else:
        print("Modo Consola: GUI no disponible.")
        ui = CLILoader()
        logic = KofuSetupLogic(ui)
        logic.run_setup()
