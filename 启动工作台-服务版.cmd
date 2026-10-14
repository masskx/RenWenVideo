@echo off
chcp 65001 >nul
title 哲理视频工作台服务版
cd /d "%~dp0"
echo.
echo   正在启动服务版工作台...
echo   浏览器将自动打开 http://localhost:3210
echo.
start "" http://localhost:3210
node workbench/server.js
pause
