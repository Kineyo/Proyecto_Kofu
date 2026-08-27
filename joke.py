import tkinter as tk
from tkinter import messagebox
import sys

def main():
    root = tk.Tk()
    root.withdraw()  # Oculta la ventana principal
    messagebox.showinfo("Kofu AI", "Próximamente, en 67 días...")
    sys.exit(0)

if __name__ == "__main__":
    main()
