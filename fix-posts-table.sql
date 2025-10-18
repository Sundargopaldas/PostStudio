-- Script para corrigir a estrutura da tabela posts
USE contentflow_ai;

-- Verificar se a coluna customization existe
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'contentflow_ai' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'customization';

-- Se não existir, adicionar a coluna customization
ALTER TABLE posts ADD COLUMN IF NOT EXISTS customization JSON NULL AFTER image_url;

-- Adicionar coluna video_url se não existir
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) NULL AFTER image_url;

-- Verificar estrutura atual da tabela
DESCRIBE posts;

-- Mostrar todas as colunas
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'contentflow_ai' 
AND TABLE_NAME = 'posts'
ORDER BY ORDINAL_POSITION;
