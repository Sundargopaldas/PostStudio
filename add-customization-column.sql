-- Adicionar coluna de customização na tabela posts
-- Execute este script no MySQL para adicionar a coluna que está faltando

USE contentflow_ai;

-- Verificar se a coluna já existe
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'contentflow_ai' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'customization';

-- Adicionar a coluna customization se não existir
ALTER TABLE posts ADD COLUMN customization TEXT AFTER image_url;

-- Verificar a estrutura da tabela após a alteração
DESCRIBE posts;