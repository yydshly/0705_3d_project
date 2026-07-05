@echo off
cd /d "%~dp0"
"D:\software\nodejs\node.exe" node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5174 > .vite-dev.log 2> .vite-dev.err.log
