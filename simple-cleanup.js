const fs = require('fs');
const path = require('path');

// Função para limpar arquivos antigos
function cleanupOldFiles() {
    console.log('🧹 Limpando arquivos antigos...');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    
    let deletedCount = 0;
    let totalSizeDeleted = 0;
    
    files.forEach(file => {
        // Pular se não for arquivo de mídia
        if (!file.match(/\.(jpg|jpeg|png|gif|mp4|avi|mov)$/i)) {
            return;
        }
        
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        // Deletar arquivos mais antigos que 1 hora
        const hoursOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        
        if (hoursOld > 1) {
            try {
                const sizeKB = Math.round(stats.size / 1024);
                fs.unlinkSync(filePath);
                console.log(`🗑️ Deletado: ${file} (${sizeKB}KB, ${Math.round(hoursOld)}h atrás)`);
                deletedCount++;
                totalSizeDeleted += stats.size;
            } catch (error) {
                console.log(`❌ Erro ao deletar ${file}:`, error.message);
            }
        } else {
            console.log(`✅ Manter: ${file} (${Math.round(hoursOld)}h atrás)`);
        }
    });
    
    console.log(`\n📊 Resumo da limpeza:`);
    console.log(`🗑️ Arquivos deletados: ${deletedCount}`);
    console.log(`💾 Espaço liberado: ${Math.round(totalSizeDeleted / 1024 / 1024)}MB`);
}

// Função para mostrar estatísticas
function showStats() {
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
console.log('🚀 Iniciando limpeza de arquivos antigos...\n');

console.log('📊 ANTES da limpeza:');
showStats();

console.log('\n' + '='.repeat(50) + '\n');

cleanupOldFiles();

console.log('\n' + '='.repeat(50) + '\n');

console.log('📊 DEPOIS da limpeza:');
showStats();

console.log('\n✅ Limpeza concluída!');
