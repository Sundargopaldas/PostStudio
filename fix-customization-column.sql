-- Script para corrigir a coluna customization
USE contentflow_ai;

-- Verificar o tipo atual da coluna
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'contentflow_ai' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'customization';

-- Alterar a coluna customization para LONGTEXT
ALTER TABLE posts MODIFY COLUMN customization LONGTEXT;

-- Verificar se foi alterada
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'contentflow_ai' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'customization';

-- Mostrar estrutura da tabela
DESCRIBE posts;
