@echo off
echo ========================================
echo   SUBSTITUIR PAGINA CREATE-POST
echo ========================================
echo.
echo Este script vai:
echo 1. Fazer backup adicional da versao original
echo 2. Substituir create-post.html pela nova versao
echo.
echo Pressione CTRL+C para cancelar
echo Pressione qualquer tecla para continuar...
pause >nul

echo.
echo [1/2] Fazendo backup adicional...
cd public
copy create-post.html create-post-old-backup.html >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ Backup criado: create-post-old-backup.html
) else (
    echo     ✗ Erro ao criar backup!
    pause
    exit /b 1
)

echo.
echo [2/2] Substituindo pela nova versao...
copy /Y create-post-new.html create-post.html >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ Pagina substituida com sucesso!
) else (
    echo     ✗ Erro ao substituir!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo A nova pagina esta ativa em:
echo http://localhost:3000/create-post.html
echo.
echo Backups disponiveis:
echo - create-post-backup.html
echo - create-post-old-backup.html
echo.
echo Para reverter, execute: reverter-pagina.bat
echo.
pause

