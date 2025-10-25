// 🔧 CORREÇÃO URGENTE: Adicionar coluna customization na tabela posts
// Execute este script para corrigir o problema de salvamento

const mysql = require('mysql2/promise');

async function fixDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'contentflow_ai'
    });

    try {
        console.log('🔧 Iniciando correção do banco de dados...');
        
        // Verificar se a coluna customization já existe
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'contentflow_ai' 
              AND TABLE_NAME = 'posts' 
              AND COLUMN_NAME = 'customization'
        `);
        
        if (columns.length === 0) {
            console.log('❌ Coluna customization não encontrada. Adicionando...');
            
            // Adicionar coluna customization
            await connection.execute(`
                ALTER TABLE posts 
                ADD COLUMN customization TEXT AFTER image_url
            `);
            
            console.log('✅ Coluna customization adicionada com sucesso!');
        } else {
            console.log('✅ Coluna customization já existe!');
        }
        
        // Verificar estrutura da tabela posts
        const [tableStructure] = await connection.execute('DESCRIBE posts');
        console.log('📊 Estrutura da tabela posts:');
        tableStructure.forEach(row => {
            console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });
        
        // Teste: Inserir um post de teste
        console.log('🧪 Testando inserção de post...');
        const [result] = await connection.execute(`
            INSERT INTO posts (user_id, title, content, hashtags, template, platforms, image_url, customization, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [1, 'Teste de Salvamento', 'Este é um teste para verificar se o salvamento funciona', '#teste', 'Teste', '["instagram"]', '', '{"test": "customization"}', 'draft']);
        
        console.log('✅ Post de teste inserido com ID:', result.insertId);
        
        // Verificar se o post foi inserido
        const [posts] = await connection.execute('SELECT * FROM posts WHERE title = ?', ['Teste de Salvamento']);
        console.log('📝 Post encontrado:', posts[0]);
        
        // Limpar post de teste
        await connection.execute('DELETE FROM posts WHERE title = ?', ['Teste de Salvamento']);
        console.log('🧹 Post de teste removido');
        
        console.log('🎉 Correção aplicada com sucesso!');
        console.log('✅ Agora o salvamento de posts deve funcionar corretamente!');
        
    } catch (error) {
        console.error('❌ Erro ao corrigir banco de dados:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await connection.end();
    }
}

// Executar correção
fixDatabase().catch(console.error);
