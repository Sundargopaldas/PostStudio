const mysql = require('mysql2/promise');

async function fixDatabase() {
    try {
        console.log('🔧 Corrigindo estrutura do banco de dados...');
        
        // Configuração do banco
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'contentflow_ai'
        };
        
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado ao banco de dados');
        
        // Verificar tipo atual da coluna
        console.log('🔍 Verificando tipo atual da coluna customization...');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'posts' 
            AND COLUMN_NAME = 'customization'
        `, [dbConfig.database]);
        
        console.log('📊 Tipo atual:', columns[0]);
        
        // Alterar coluna para LONGTEXT
        console.log('🔧 Alterando coluna customization para LONGTEXT...');
        await connection.execute(`
            ALTER TABLE posts MODIFY COLUMN customization LONGTEXT
        `);
        
        console.log('✅ Coluna customization alterada para LONGTEXT');
        
        // Verificar se foi alterada
        const [newColumns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'posts' 
            AND COLUMN_NAME = 'customization'
        `, [dbConfig.database]);
        
        console.log('📊 Novo tipo:', newColumns[0]);
        
        await connection.end();
        console.log('✅ Correção concluída com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao corrigir banco:', error.message);
        process.exit(1);
    }
}

fixDatabase();
