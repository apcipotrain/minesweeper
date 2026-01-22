chcp 65001 >nul

@echo off
title Minesweeper Local Server
echo 🚀 启动本地服务器中，请稍候...
echo --------------------------------------
echo 访问地址:  http://localhost:8080
echo (请在浏览器中打开该地址)
echo --------------------------------------

:: 启动 Python 自带的 HTTP 服务器
python -m http.server 8080

pause
