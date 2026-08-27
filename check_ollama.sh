#!/bin/bash

# Check if Ollama service is running
if curl -s http://localhost:11434 > /dev/null || pgrep -x "ollama" > /dev/null; then
    echo "Ollama is already running."
else
    # Check if ollama command exists
    if command -v ollama >/dev/null 2>&1; then
        echo "Starting Ollama..."
        ollama serve >/dev/null 2>&1 &
        sleep 2
        echo "Ollama started."
    else
        echo "============================================================"
        echo "Ollama is NOT installed."
        echo "Please install Ollama to use the Kofu AI Assistant."
        echo "Install using curl: curl -fsSL https://ollama.com/install.sh | sh"
        echo "Or download from: https://ollama.com/download"
        echo "============================================================"
    fi
fi
