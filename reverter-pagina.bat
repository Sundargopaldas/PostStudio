@echo off
echo ========================================
echo   REVERTER PAGINA CREATE-POST
echo ========================================
echo.
echo Este script vai reverter para a versao original
echo usando o backup: create-post-backup.html
echo.
echo Pressione CTRL+C para cancelar
echo Pressione qualquer tecla para continuar...
pause >nul

echo.
echo Revertendo para versao original...
cd public
copy /Y create-post-backup.html create-post.html >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ Pagina revertida com sucesso!
) else (
    echo     ✗ Erro ao reverter!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   REVERTIDO COM SUCESSO!
echo ========================================
echo.
echo A pagina original foi restaurada.
echo.
echo Para voltar para a nova versao, execute: substituir-pagina.bat
echo.
pause

