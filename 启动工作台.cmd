@echo off
chcp 65001 >nul
title 哲理视频单页预览
cd /d "%~dp0"
echo.
echo   正在打开视频单页预览...
echo   如需选择素材，请在页面中选择 zen-video\out 文件夹
echo.
start "" "%~dp0workbench.html"
pause
