@echo off
chcp 65001
echo ==========================================
echo 독립형 장애보고서 호출기를 시작합니다...
echo ==========================================

:: 브라우저 자동 실행 (2초 대기 후 실행)
timeout /t 2 >nul
start http://localhost:8003

:: 프로그램 실행 (Node.js)
node app.js

pause
