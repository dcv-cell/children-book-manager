
@echo off
echo 正在启动儿童绘本二手书管理系统...
echo.

:: 启动后端
start "OpenClaw Backend" cmd /k "cd /d %~dp0backend && npm start"

:: 等待 2 秒让后端启动
timeout /t 2 /nobreak >nul

:: 启动前端
start "OpenClaw Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo 系统启动中...
echo 后端地址: http://localhost:3001
echo 前端地址: 请查看前端窗口
echo.
pause
