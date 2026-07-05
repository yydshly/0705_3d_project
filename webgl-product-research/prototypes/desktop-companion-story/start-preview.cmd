@echo off
cd /d "%~dp0"
"D:\software\nodejs\node.exe" scripts\serve-dist.mjs 5175 > .serve-dist.log 2> .serve-dist.err
