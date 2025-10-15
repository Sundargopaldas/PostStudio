const mysql = require('mysql2/promise');

async function createTestPost() {
    try {
        // Conectar ao banco de dados
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'contentflow_ai'
        });

        console.log('🔗 Conectado ao banco de dados');

        // Dados do post de teste
        const testPost = {
            title: 'Post de Teste - PostStudio I.A',
            content: 'Este é um post de teste criado para demonstrar as funcionalidades do PostStudio I.A. Inclui imagem de fundo personalizada e vídeo com legenda animada.',
            template: 'Post Motivacional',
            image_url: 'imagem_uploaded',
            hashtags: '#teste #poststudio #ia #conteudo #demonstracao',
            platforms: 'twitter,facebook,instagram,linkedin',
            customization: JSON.stringify({
                font: 'font-inter',
                color: '#3b82f6',
                background: 'gradient-1',
                textEffect: 'normal',
                backgroundImage: '/uploads/backgroundImage-test-2024.jpg',
                video: '/uploads/video-test-2024.mp4',
                videoCaption: 'Esta é uma legenda de teste para demonstrar a funcionalidade de legendas animadas no PostStudio I.A',
                videoCaptionFont: 'Arial'
            }),
            user_id: 1,
            created_at: new Date(),
            updated_at: new Date()
        };

        // Inserir o post
        const [result] = await connection.execute(`
            INSERT INTO posts (title, content, template, image_url, hashtags, platforms, customization, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            testPost.title,
            testPost.content,
            testPost.template,
            testPost.image_url,
            testPost.hashtags,
            testPost.platforms,
            testPost.customization,
            testPost.user_id,
            testPost.created_at,
            testPost.updated_at
        ]);

        console.log('✅ Post de teste criado com sucesso!');
        console.log('📝 ID do post:', result.insertId);
        console.log('🎨 Customização:', testPost.customization);
        console.log('🖼️ Imagem de fundo:', testPost.customization.backgroundImage);
        console.log('🎬 Vídeo:', testPost.customization.video);
        console.log('📝 Legenda:', testPost.customization.videoCaption);

        await connection.end();
        console.log('🔗 Conexão encerrada');

    } catch (error) {
        console.error('❌ Erro ao criar post de teste:', error);
    }
}

// Executar a função
createTestPost();
