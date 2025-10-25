-- 🔧 CORREÇÃO URGENTE: Adicionar coluna customization na tabela posts
-- Execute este script para corrigir o problema de salvamento

USE contentflow_ai;

-- Verificar se a coluna customization já existe
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'contentflow_ai' 
  AND TABLE_NAME = 'posts' 
  AND COLUMN_NAME = 'customization';

-- Adicionar coluna customization se não existir
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS customization TEXT AFTER image_url;

-- Verificar estrutura da tabela posts
DESCRIBE posts;

-- Mostrar todas as colunas da tabela posts
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'contentflow_ai' 
  AND TABLE_NAME = 'posts'
ORDER BY ORDINAL_POSITION;

-- Teste: Inserir um post de teste
INSERT INTO posts (user_id, title, content, hashtags, template, platforms, image_url, customization, status, created_at) 
VALUES (1, 'Teste de Salvamento', 'Este é um teste para verificar se o salvamento funciona', '#teste', 'Teste', '["instagram"]', '', '{"test": "customization"}', 'draft', NOW());

-- Verificar se o post foi inserido
SELECT * FROM posts WHERE title = 'Teste de Salvamento';

-- Limpar post de teste
DELETE FROM posts WHERE title = 'Teste de Salvamento';

SELECT '✅ Correção aplicada com sucesso!' as status;
