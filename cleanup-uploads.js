const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Função para limpar arquivos órfãos
async function cleanupOrphanedFiles() {
    console.log('🧹 Iniciando limpeza de arquivos órfãos...');
    
    try {
        // Conectar ao banco de dados
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'contentflow_ai'
        });
        
        // Buscar todas as URLs de arquivos no banco
        const [posts] = await pool.execute('SELECT image_url, customization FROM posts');
        
        const usedFiles = new Set();
        
        // Coletar todas as URLs de arquivos usados
        posts.forEach(post => {
            if (post.image_url && post.image_url.startsWith('/uploads/')) {
                const fileName = post.image_url.replace('/uploads/', '');
                usedFiles.add(fileName);
            }
            
            if (post.customization) {
                try {
                    const custom = JSON.parse(post.customization);
                    if (custom.video && custom.video.startsWith('/uploads/')) {
                        const fileName = custom.video.replace('/uploads/', '');
                        usedFiles.add(fileName);
                    }
                    if (custom.backgroundImage && custom.backgroundImage.startsWith('/uploads/')) {
                        const fileName = custom.backgroundImage.replace('/uploads/', '');
                        usedFiles.add(fileName);
                    }
                } catch (e) {
                    console.log('⚠️ Erro ao processar customização:', e.message);
                }
            }
        });
        
        console.log(`📊 ${usedFiles.size} arquivos em uso no banco de dados`);
        console.log('📁 Arquivos em uso:', Array.from(usedFiles));
        
        // Listar arquivos na pasta uploads
        const uploadsDir = path.join(__dirname, 'uploads');
        const files = fs.readdirSync(uploadsDir);
        
        let deletedCount = 0;
        let keptCount = 0;
        
        console.log(`\n🔍 Verificando ${files.length} arquivos na pasta uploads...`);
        
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            
            // Pular se não for arquivo de mídia
            if (!file.match(/\.(jpg|jpeg|png|gif|mp4|avi|mov)$/i)) {
                return;
            }
            
            if (usedFiles.has(file)) {
                console.log(`✅ Manter: ${file} (em uso)`);
                keptCount++;
            } else {
                try {
                    const stats = fs.statSync(filePath);
                    const sizeKB = Math.round(stats.size / 1024);
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Deletado: ${file} (${sizeKB}KB) - arquivo órfão`);
                    deletedCount++;
                } catch (error) {
                    console.log(`❌ Erro ao deletar ${file}:`, error.message);
                }
            }
        });
        
        console.log(`\n📊 Resumo da limpeza:`);
        console.log(`✅ Arquivos mantidos: ${keptCount}`);
        console.log(`🗑️ Arquivos deletados: ${deletedCount}`);
        console.log(`💾 Espaço liberado: ${deletedCount} arquivos órfãos removidos`);
        
        await pool.end();
        
    } catch (error) {
        console.log('❌ Erro durante limpeza:', error.message);
    }
}

// Função para mostrar estatísticas
function showUploadStats() {
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    
    let totalSize = 0;
    let imageCount = 0;
    let videoCount = 0;
    let backgroundCount = 0;
    
    files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
        
        if (file.startsWith('image-')) imageCount++;
        else if (file.startsWith('video-')) videoCount++;
        else if (file.startsWith('backgroundImage-')) backgroundCount++;
    });
    
    console.log('📊 Estatísticas da pasta uploads:');
    console.log(`📁 Total de arquivos: ${files.length}`);
    console.log(`🖼️ Imagens: ${imageCount}`);
    console.log(`🎬 Vídeos: ${videoCount}`);
    console.log(`🖼️ Backgrounds: ${backgroundCount}`);
    console.log(`💾 Tamanho total: ${Math.round(totalSize / 1024 / 1024)}MB`);
}

// Executar limpeza
console.log('🚀 Iniciando limpeza de arquivos órfãos...\n');

showUploadStats();
console.log('\n' + '='.repeat(50) + '\n');

cleanupOrphanedFiles().then(() => {
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('📊 Estatísticas após limpeza:');
    showUploadStats();
    console.log('\n✅ Limpeza concluída!');
});
