#!/bin/bash
echo "============================================================"
echo "Kofu Automatic Compiler for Linux"
echo "============================================================"

# Ensure permissions
chmod +x Archivos_Extra/build.sh
chmod +x Archivos_Extra/build_cpu_linux.sh

echo "Compiling Normal Linux Version (GPU/Loader)..."
./Archivos_Extra/build.sh

echo "Compiling CPU-Only Linux Version..."
./Archivos_Extra/build_cpu_linux.sh

echo "============================================================"
echo "All compilation tasks completed successfully!"
echo "Packages (.deb, .rpm, .pkg.tar.zst) should be in the dist/ folder and your Downloads folder."
echo "============================================================"
