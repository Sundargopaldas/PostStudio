
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const fs = require('fs').promises;
const multer = require('multer');
// Google OAuth removido - usando sistema de login original

// Configurações da API Unsplash
const UNSPLASH_ACCESS_KEY = 'UjGgSU69vZ6mxTmU9NRPUtgVgu6-2KJVT_vWJBOtOu4';
const UNSPLASH_SECRET_KEY = '7c-9mD7wty6R5OtosqG9LLI7VyvCK5JfO4VJE3JhZbk';

const app = express();

// Middleware de acesso premium temporário
app.use((req, res, next) => {
    const premiumConfig = require('./premium-config.json');
    
    if (premiumConfig.enabled && new Date() < new Date(premiumConfig.expiresAt)) {
        // Aplicar permissões premium
        if (req.session && req.session.userId) {
            req.session.premiumAccess = true;
            req.session.features = premiumConfig.features;
        }
    }
    
    next();
});
const PORT = process.env.PORT || 3000;

// Configuração do banco de dados
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'contentflow_ai',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Testar conexão com o banco
async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexão com banco de dados estabelecida');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com banco de dados:', error.message);
        console.log('💡 Verifique se o MySQL está rodando e se o banco "contentflow_ai" existe');
        console.log('🔄 Continuando em modo demo...');
        return false;
    }
}

// Modo demo - dados persistentes em arquivo JSON
const DEMO_DATA_FILE = 'demo-data.json';
let demoUsers = [];
let demoUserIdCounter = 1;

// Funções para gerenciar dados demo
async function loadDemoData() {
    try {
        const data = await fs.readFile(DEMO_DATA_FILE, 'utf8');
        const parsed = JSON.parse(data);
        demoUsers = parsed.users || [];
        demoUserIdCounter = parsed.nextId || 1;
        console.log(`📁 Carregados ${demoUsers.length} usuários demo do arquivo`);
    } catch (error) {
        console.log('📁 Criando arquivo de dados demo...');
        demoUsers = [];
        demoUserIdCounter = 1;
        await saveDemoData();
    }
    
    // Carregar posts demo
    try {
        const postsData = await fs.readFile('demo-posts.json', 'utf8');
        global.demoPosts = JSON.parse(postsData);
        console.log(`📁 Carregados ${global.demoPosts.length} posts demo do arquivo`);
        console.log('🔍 Posts carregados:', global.demoPosts);
        console.log('🔍 global.demoPosts definido?', !!global.demoPosts);
        console.log('🔍 global.demoPosts é array?', Array.isArray(global.demoPosts));
    } catch (error) {
        console.log('📁 Criando arquivo de posts demo...');
        console.log('❌ Erro ao carregar posts demo:', error.message);
        global.demoPosts = [];
        console.log('🔍 global.demoPosts inicializado como array vazio');
    }
}

async function saveDemoData() {
    try {
        const data = {
            users: demoUsers,
            nextId: demoUserIdCounter,
            lastUpdated: new Date().toISOString()
        };
        await fs.writeFile(DEMO_DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Erro ao salvar dados demo:', error);
    }
}


// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware para tratar erros de payload muito grande
app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
        return res.status(413).json({ 
            message: 'Arquivo muito grande. Tamanho máximo permitido: 50MB',
            error: 'PAYLOAD_TOO_LARGE'
        });
    }
    next(error);
});

app.use(express.static('public'));
// Permitir acesso direto via /public/arquivo.html
app.use('/public', express.static('public'));

// Servir imagens da pasta uploads
app.use('/uploads', express.static('uploads'));

// Configuração de sessão
app.use(session({
    secret: 'contentflow-ai-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true apenas em HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Sistema de login original restaurado

// Rotas de pagamento
const paymentRoutes = require('./routes/payment');
app.use('/api', paymentRoutes);

// Rota para deletar post (PRIMEIRA ROTA - antes de todas as outras)
app.delete('/api/posts/:id', async (req, res) => {
    console.log('🚀 Rota DELETE /api/posts/:id chamada!');
    console.log('🔍 Headers:', req.headers);
    console.log('🔍 Method:', req.method);
    console.log('🔍 URL:', req.url);
    
    try {
        const postId = req.params.id;
        console.log(`🗑️ Tentando deletar post ${postId}...`);
        console.log(`🔍 Parâmetros recebidos:`, req.params);
        console.log(`👤 Usuário logado:`, req.session.userId);
        
        // Verificar se o usuário está logado
        if (!req.session.userId) {
            console.log('❌ Usuário não autenticado');
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        let postDeleted = false;

        try {
            // Tentar deletar do banco de dados
            const [result] = await pool.execute(
                'DELETE FROM posts WHERE id = ? AND user_id = ?',
                [postId, req.session.userId]
            );
            
            if (result.affectedRows > 0) {
                postDeleted = true;
                console.log(`✅ Post ${postId} deletado do banco de dados`);
            }
        } catch (dbError) {
            console.log('🔄 Banco não disponível, tentando deletar em modo demo...');
            
            // Deletar em modo demo
            if (global.demoPosts && global.demoPosts.length > 0) {
                const postIndex = global.demoPosts.findIndex(post => 
                    post.id == postId && post.user_id == req.session.userId
                );
                
                if (postIndex !== -1) {
                    global.demoPosts.splice(postIndex, 1);
                    
                    // Salvar no arquivo
                    await fs.writeFile('demo-posts.json', JSON.stringify(global.demoPosts, null, 2));
                    
                    postDeleted = true;
                    console.log(`✅ Post ${postId} deletado do modo demo`);
                }
            }
        }

        if (postDeleted) {
            res.json({ 
                message: 'Post deletado com sucesso!',
                postId: postId
            });
        } else {
            res.status(404).json({ message: 'Post não encontrado ou você não tem permissão para deletá-lo' });
        }
        
    } catch (error) {
        console.error('Erro ao deletar post:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/videos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'videos.html'));
});

app.get('/test-unsplash', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-unsplash.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/create-post', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create-post.html'));
});

app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'posts.html'));
});

// Rota para a página de pagamento
app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

// Rota para a página de pagamento simples
app.get('/payment-simple', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment-simple.html'));
});

// Rota para a página de pagamento com Mercado Pago
app.get('/payment-mercado-pago', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment-mercado-pago.html'));
});

// Rota para a página de sucesso de pagamento
app.get('/payment-success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment-success.html'));
});

app.get('/debug-posts', (req, res) => {
    // Redirecionar para a página principal de posts
    res.redirect('/posts');
});

app.get('/simple-posts', (req, res) => {
    // Redirecionar para a página principal de posts
    res.redirect('/posts');
});

app.get('/force-login-posts', (req, res) => {
    // Redirecionar para a página principal de posts
    res.redirect('/posts');
});

app.get('/test-inputs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-inputs.html'));
});

app.get('/debug-404', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'debug-404.html'));
});

app.get('/create-post-simple', (req, res) => {
    // Redirecionar para a página principal de criação de posts (customização avançada)
    res.redirect('/create-post');
});

app.get('/input-test', (req, res) => {
    // Redirecionar para criação principal
    res.redirect('/create-post');
});

app.get('/basic-test', (req, res) => {
    // Redirecionar para criação principal
    res.redirect('/create-post');
});

app.get('/working-test', (req, res) => {
    // Redirecionar para criação principal
    res.redirect('/create-post');
});

app.get('/visual-editor', (req, res) => {
    // Unificar criação de posts na página de customização avançada
    res.sendFile(path.join(__dirname, 'public', 'create-post.html'));
});

// Página dedicada para criação de vídeo dinâmico
app.get('/create-video', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create-video.html'));
});

app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

// Rota para configurações
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

// Rota para assinaturas
app.get('/subscription', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'subscription.html'));
});

// Middleware para verificar sessão
function checkSession(req, res, next) {
    console.log('🔍 Verificando sessão:', {
        userId: req.session.userId,
        userName: req.session.userName,
        userEmail: req.session.userEmail
    });
    next();
}

// Rota removida - botão editores eliminado

app.get('/image-editor', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'image-editor.html'));
});

app.get('/video-editor', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'video-editor.html'));
});

app.get('/video-narration-editor', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'video-narration-editor.html'));
});

app.get('/test-api', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-api.html'));
});

// Rota para gerar narração
app.post('/api/generate-narration', async (req, res) => {
    try {
        console.log('🎤 POST /api/generate-narration - Gerando narração');
        const { text, voiceId, speed, volume } = req.body;
        
        console.log('📝 Dados da narração:', { text, voiceId, speed, volume });
        
        if (!text || !voiceId) {
            return res.status(400).json({ error: 'Texto e voz são obrigatórios' });
        }
        
        // Usar a API key do ElevenLabs
        const apiKey = 'sk_83361992bc2f7a4177040a338cad9964ce3bd9dd53d480e4';
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                    style: 0.0,
                    use_speaker_boost: true
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro da API ElevenLabs:', errorText);
            return res.status(500).json({ error: 'Erro ao gerar narração' });
        }
        
        const audioBuffer = await response.arrayBuffer();
        const audioBlob = Buffer.from(audioBuffer);
        
        console.log('✅ Narração gerada com sucesso:', audioBlob.length, 'bytes');
        
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBlob.length
        });
        
        res.send(audioBlob);
        
    } catch (error) {
        console.error('❌ Erro ao gerar narração:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/session-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'session-test.html'));
});

// Rota para teste do Google Fonts
app.get('/test-google-fonts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-google-fonts.html'));
});

// Rota para teste do Pexels
app.get('/test-pexels', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-pexels.html'));
});

// Rota para teste das imagens Pexels
app.get('/test-pexels-images', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-pexels-images.html'));
});

// Rota para teste do editor de imagens com Pexels
app.get('/test-image-editor-pexels', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-image-editor-pexels.html'));
});

// Rota para teste da API Pexels real
app.get('/test-pexels-api-real', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-pexels-api-real.html'));
});

// Rota para teste do fix do Pexels
app.get('/test-pexels-fix', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-pexels-fix.html'));
});

// Rota para teste Pexels SIMPLES
app.get('/test-pexels-simples', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-pexels-simples.html'));
});

// Rota para teste da API REAL do Pexels
app.get('/test-pexels-real', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-pexels-real.html'));
});

// Rota para teste SIMPLES do Pexels
app.get('/test-pexels-simple', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-pexels-simple.html'));
});

// Rota para teste de VÍDEOS do Pexels
app.get('/test-pexels-videos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-pexels-videos.html'));
});

// Rota para teste de VÍDEOS MODERNOS (Mixkit)
app.get('/test-modern-videos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-modern-videos.html'));
});

// API do usuário - configurações
app.get('/api/user/settings', checkSession, (req, res) => {
    console.log('🔧 API user/settings chamada');
    
    // Configurações padrão do usuário
    const userSettings = {
        elevenlabsApiKey: 'sk_83361992bc2f7a4177040a338cad9964ce3bd9dd53d480e4', // Nova chave ElevenLabs
        userId: req.session.userId,
        userEmail: req.session.userEmail,
        preferences: {
            defaultVoice: '21m00Tcm4TlvDq8ikWAM', // Rachel
            language: 'pt-BR',
            speed: 1.0
        }
    };
    
    console.log('✅ Retornando configurações do usuário');
    res.json(userSettings);
});

// API do Pexels para imagens - VERSÃO REAL
app.get('/api/pexels/images', async (req, res) => {
    try {
        const { query = 'nature', page = 1, per_page = 20 } = req.query;
        
        console.log('🔍 API Pexels REAL chamada!', { query, page, per_page });
        
        // Chave da API do Pexels - configurada
        const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'f0djuVMOG9iW68zHOsbZmk2yt5ip7wbajvoPz10jMOhVDtg7yihzmRjJ';
        
        if (PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
            console.log('⚠️ Chave da API do Pexels não configurada - usando fallback');
            return res.json({
                photos: [
                    {
                        id: 1,
                        src: {
                            small: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=150',
                            medium: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
                        },
                        alt: 'Tecnologia Moderna'
                    }
                ],
                total_results: 1,
                page: 1,
                per_page: 1,
                note: 'Usando imagens de exemplo - configure sua chave da API do Pexels'
            });
        }
        
        // Fazer requisição real para a API do Pexels
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`, {
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        });
        
        if (!response.ok) {
            console.error('❌ Erro na API do Pexels:', response.status, response.statusText);
            throw new Error(`Erro na API do Pexels: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`✅ ${data.photos.length} imagens encontradas do Pexels para "${query}"`);
        
        res.json(data);
        
    } catch (error) {
        console.error('❌ Erro ao buscar imagens do Pexels:', error);
        
        // Fallback para imagens de exemplo em caso de erro
        res.json({
            photos: [
                {
                    id: 1,
                    src: {
                        small: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=150',
                        medium: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
                    },
                    alt: 'Tecnologia Moderna'
                }
            ],
            total_results: 1,
            page: 1,
            per_page: 1,
            error: error.message,
            note: 'Usando imagens de exemplo devido ao erro'
        });
    }
});

// API do Pexels para VÍDEOS - VERSÃO REAL
app.get('/api/pexels/videos', async (req, res) => {
    try {
        const { query = 'nature', page = 1, per_page = 20, min_duration = 10 } = req.query;
        
        console.log('🎬 API Pexels VÍDEOS chamada!', { query, page, per_page, min_duration });
        
        // Chave da API do Pexels - configurada
        const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'f0djuVMOG9iW68zHOsbZmk2yt5ip7wbajvoPz10jMOhVDtg7yihzmRjJ';
        
        if (PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
            console.log('⚠️ Chave da API do Pexels não configurada - usando fallback');
            return res.json({
                videos: [
                    {
                        id: 1,
                        duration: 30,
                        video_files: [
                            {
                                id: 1,
                                quality: 'hd',
                                file_type: 'video/mp4',
                                link: 'https://videos.pexels.com/video-files/123456/pexels-video-123456.mp4'
                            }
                        ],
                        video_pictures: [
                            {
                                id: 1,
                                picture: 'https://images.pexels.com/videos/123456/pexels-video-123456.jpeg'
                            }
                        ],
                        user: {
                            name: 'Pexels',
                            url: 'https://www.pexels.com/@pexels'
                        }
                    }
                ],
                total_results: 1,
                page: 1,
                per_page: 1,
                note: 'Usando vídeos de exemplo - configure sua chave da API do Pexels'
            });
        }
        
        // Fazer requisição real para a API de vídeos do Pexels
        const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}&min_duration=${min_duration}`, {
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        });
        
        if (!response.ok) {
            console.error('❌ Erro na API de vídeos do Pexels:', response.status, response.statusText);
            throw new Error(`Erro na API de vídeos do Pexels: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filtrar apenas vídeos com duração mínima
        if (min_duration) {
            data.videos = data.videos.filter(video => video.duration >= parseInt(min_duration));
        }
        
        console.log(`✅ ${data.videos.length} vídeos encontrados do Pexels para "${query}" (min: ${min_duration}s)`);
        
        res.json(data);
        
    } catch (error) {
        console.error('❌ Erro ao buscar vídeos do Pexels:', error);
        
        // Fallback para vídeos de exemplo em caso de erro
        res.json({
            videos: [
                {
                    id: 1,
                    duration: 30,
                    video_files: [
                        {
                            id: 1,
                            quality: 'hd',
                            file_type: 'video/mp4',
                            link: 'https://videos.pexels.com/video-files/123456/pexels-video-123456.mp4'
                        }
                    ],
                    video_pictures: [
                        {
                            id: 1,
                            picture: 'https://images.pexels.com/videos/123456/pexels-video-123456.jpeg'
                        }
                    ],
                    user: {
                        name: 'Pexels',
                        url: 'https://www.pexels.com/@pexels'
                    }
                }
            ],
            total_results: 1,
            page: 1,
            per_page: 1,
            error: error.message,
            note: 'Usando vídeos de exemplo devido ao erro'
        });
    }
});

// API para vídeos modernos (usando Pexels com filtros modernos)
app.get('/api/mixkit/videos', async (req, res) => {
    try {
        const { category = 'all', limit = 20 } = req.query;
        
        console.log('🎬 API VÍDEOS MODERNOS chamada!', { category, limit });
        
        // Mapear categorias para termos de busca modernos
        const modernQueries = {
            'business': 'business meeting office corporate startup',
            'technology': 'technology AI artificial intelligence digital innovation',
            'lifestyle': 'lifestyle urban modern city contemporary',
            'nature': 'sustainable green environment eco-friendly future',
            'all': 'modern professional contemporary innovative'
        };
        
        const query = modernQueries[category] || modernQueries['all'];
        
        // Chave da API do Pexels - configurada
        const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'f0djuVMOG9iW68zHOsbZmk2yt5ip7wbajvoPz10jMOhVDtg7yihzmRjJ';
        
        if (PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
            console.log('⚠️ Chave da API do Pexels não configurada - usando fallback');
            return res.json({
                videos: [
                    {
                        id: 'modern-fallback-1',
                        title: 'Modern Business Video',
                        duration: 30,
                        video_files: [{
                            id: 1,
                            quality: 'hd',
                            file_type: 'video/mp4',
                            link: 'https://videos.pexels.com/video-files/123456/pexels-video-123456.mp4'
                        }],
                        video_pictures: [{
                            id: 1,
                            picture: 'https://images.pexels.com/videos/123456/pexels-video-123456.jpeg'
                        }],
                        user: { name: 'Pexels', url: 'https://www.pexels.com/@pexels' },
                        category: category,
                        tags: ['modern', 'professional', 'contemporary']
                    }
                ],
                total_results: 1,
                page: 1,
                per_page: 1,
                source: 'Pexels Modern',
                note: 'Usando vídeos de exemplo - configure sua chave da API do Pexels'
            });
        }
        
        // Fazer requisição real para a API de vídeos do Pexels com termos modernos
        const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=1&per_page=${limit}&min_duration=30`, {
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        });
        
        if (!response.ok) {
            console.error('❌ Erro na API de vídeos do Pexels:', response.status, response.statusText);
            throw new Error(`Erro na API de vídeos do Pexels: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Adicionar tags modernas baseadas na categoria
        const modernTags = {
            'business': ['business', 'professional', 'corporate', 'modern'],
            'technology': ['technology', 'AI', 'digital', 'innovation'],
            'lifestyle': ['lifestyle', 'urban', 'modern', 'contemporary'],
            'nature': ['sustainable', 'green', 'eco-friendly', 'future'],
            'all': ['modern', 'professional', 'contemporary', 'innovative']
        };
        
        // Adicionar tags modernas aos vídeos
        if (data.videos) {
            data.videos = data.videos.map(video => ({
                ...video,
                category: category,
                tags: modernTags[category] || modernTags['all'],
                source: 'Pexels Modern'
            }));
        }
        
        console.log(`✅ ${data.videos ? data.videos.length : 0} vídeos modernos encontrados para categoria "${category}"`);
        
        res.json({
            videos: data.videos || [],
            total_results: data.total_results || 0,
            page: data.page || 1,
            per_page: data.per_page || limit,
            source: 'Pexels Modern',
            note: 'Vídeos modernos e profissionais do Pexels'
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar vídeos modernos:', error);
        
        // Fallback para vídeos de exemplo em caso de erro
        res.json({
            videos: [
                {
                    id: 'modern-fallback-1',
                    title: 'Modern Business Video',
                    duration: 30,
                    video_files: [{
                        id: 1,
                        quality: 'hd',
                        file_type: 'video/mp4',
                        link: 'https://videos.pexels.com/video-files/123456/pexels-video-123456.mp4'
                    }],
                    video_pictures: [{
                        id: 1,
                        picture: 'https://images.pexels.com/videos/123456/pexels-video-123456.jpeg'
                    }],
                    user: { name: 'Pexels', url: 'https://www.pexels.com/@pexels' },
                    category: category,
                    tags: ['modern', 'professional', 'contemporary'],
                    source: 'Pexels Modern'
                }
            ],
            total_results: 1,
            page: 1,
            per_page: 1,
            error: error.message,
            note: 'Usando vídeos de exemplo devido ao erro'
        });
    }
});

app.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'calendar.html'));
});

app.get('/insights', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'insights.html'));
});

// Rota de login com autenticação real
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Validações básicas
        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios' });
        }
        
        let user = null;
        
        // Tentar buscar no banco primeiro
        try {
            const [users] = await pool.execute(
                'SELECT id, name, email, password, status FROM users WHERE email = ?',
                [email]
            );
            
            if (users.length > 0) {
                user = users[0];
                
                // Verificar se conta está ativa
                if (user.status !== 'active') {
                    return res.status(401).json({ message: 'Conta inativa. Entre em contato com o suporte.' });
                }
                
                // Verificar senha
                const isPasswordValid = await bcrypt.compare(password, user.password);
                
                if (!isPasswordValid) {
                    return res.status(401).json({ message: 'Email ou senha incorretos' });
                }
            }
        } catch (dbError) {
            console.log('🔄 Banco não disponível, tentando modo demo...');
        }
        
        // Se não encontrou no banco, tentar modo demo
        if (!user) {
            const demoUser = demoUsers.find(u => u.email === email);
            if (!demoUser) {
                return res.status(401).json({ message: 'Email ou senha incorretos' });
            }
            
            // Verificar senha criptografada
            const isPasswordValid = await bcrypt.compare(password, demoUser.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Email ou senha incorretos' });
            }
            
            user = demoUser;
        }
        
        // Criar sessão do usuário
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        
        res.json({ 
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota de cadastro com banco de dados
app.post('/api/signup', async (req, res) => {
    const { fullName, email, password, newsletter } = req.body;
    
    try {
        // Validações básicas
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ message: 'A senha deve ter pelo menos 8 caracteres' });
        }
        
        if (!email.includes('@') || !email.includes('.')) {
            return res.status(400).json({ message: 'Email inválido' });
        }
        
        let userId = null;
        let userCreated = false;
        
        // Tentar salvar no banco primeiro
        try {
            // Verificar se email já existe
            const [existingUsers] = await pool.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );
            
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Este email já está cadastrado' });
            }
            
            // Criptografar senha
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // Inserir usuário no banco
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?)',
                [fullName, email, hashedPassword, 'active']
            );
            
            userId = result.insertId;
            userCreated = true;
            
            // Salvar configuração de newsletter se selecionada
            if (newsletter) {
                await pool.execute(
                    'INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES (?, ?, ?)',
                    [userId, 'newsletter', 'true']
                );
            }
            
        } catch (dbError) {
            console.log('🔄 Banco não disponível, usando modo demo...');
            
            // Verificar se email já existe no modo demo
            const existingDemoUser = demoUsers.find(u => u.email === email);
            if (existingDemoUser) {
                return res.status(400).json({ message: 'Este email já está cadastrado' });
            }
            
            // Criptografar senha mesmo no modo demo
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // Criar usuário demo
            userId = demoUserIdCounter++;
            const newUser = {
                id: userId,
                name: fullName,
                email: email,
                password: hashedPassword, // Senha criptografada
                newsletter: newsletter || false,
                status: 'active',
                role: 'user',
                created_at: new Date().toISOString()
            };
            
            demoUsers.push(newUser);
            await saveDemoData(); // Salvar no arquivo
            userCreated = true;
        }
        
        if (userCreated) {
            // Criar sessão do usuário
            req.session.userId = userId;
            req.session.userName = fullName;
            req.session.userEmail = email;
            
            res.json({ 
                message: 'Conta criada com sucesso!',
                user: {
                    id: userId,
                    name: fullName,
                    email: email,
                    newsletter: newsletter || false
                }
            });
        } else {
            res.status(500).json({ message: 'Erro ao criar conta' });
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para obter dados do usuário logado
app.get('/api/user', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }
        
        let user = null;
        
        // Tentar buscar no banco primeiro
        try {
            const [users] = await pool.execute(
                'SELECT id, name, email, avatar, role, created_at FROM users WHERE id = ?',
                [req.session.userId]
            );
            
            if (users.length > 0) {
                user = users[0];
            }
        } catch (dbError) {
            console.log('🔄 Banco não disponível, buscando em modo demo...');
        }
        
        // Se não encontrou no banco, buscar no modo demo
        if (!user) {
            const demoUser = demoUsers.find(u => u.id === req.session.userId);
            if (demoUser) {
                user = {
                    id: demoUser.id,
                    name: demoUser.name,
                    email: demoUser.email,
                    avatar: null,
                    role: 'user',
                    created_at: new Date().toISOString()
                };
            }
        }
        
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        res.json({ user });
        
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota de logout
app.post('/api/logout', async (req, res) => {
    try {
        if (req.session.userId) {
            // Tentar log de atividade (opcional)
            try {
                await pool.execute(
                    'INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)',
                    [req.session.userId, 'logout', 'Usuário fez logout do sistema', req.ip]
                );
            } catch (logError) {
                console.log('⚠️ Tabela activity_logs não encontrada, pulando log...');
            }
        }
        
        // Destruir sessão
        req.session.destroy((err) => {
            if (err) {
                console.error('Erro ao destruir sessão:', err);
                return res.status(500).json({ message: 'Erro ao fazer logout' });
            }
            res.json({ message: 'Logout realizado com sucesso' });
        });
        
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Middleware para verificar autenticação
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Acesso negado. Faça login primeiro.' });
    }
    next();
};

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Aceitar imagens, vídeos e áudio
        if (file.mimetype.startsWith('image/') || 
            file.mimetype.startsWith('video/') || 
            file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem, vídeo ou áudio são permitidos!'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        fieldSize: 50 * 1024 * 1024, // 50MB para campos de texto (imagens de fundo)
        fieldNameSize: 100,
        fields: 20
    }
});

// Rota de teste para verificar se as rotas estão funcionando
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

// Rota específica para posts JSON (com upload de imagens)
app.post('/api/posts/json', upload.single('image'), async (req, res) => {
    try {
        console.log('📝 POST /api/posts/json - Criando post JSON');
        console.log('📊 Dados recebidos:', {
            title: req.body.title,
            content: req.body.content ? req.body.content.substring(0, 100) + '...' : 'vazio',
            hashtags: req.body.hashtags,
            template: req.body.template
        });
        
        const { title, content, hashtags, template, platforms, customization } = req.body;
        
        // Processar customização primeiro para determinar onde salvar a imagem
        let customizationData = {};
        let imageUrl = '';
        let saveImageInCustomization = false;
        
        if (customization) {
            try {
                customizationData = JSON.parse(customization);
                console.log('🔍 Customização original:', customizationData);
                
                // Determinar onde salvar a imagem baseado no tipo
                if (customizationData.imageType === 'background' || customizationData.imageType === 'partial') {
                    saveImageInCustomization = true;
                }
            } catch (e) {
                console.log('❌ Erro ao processar customização:', e);
                customizationData = {};
            }
        }
        
        // Processar imagem se foi enviada
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
            console.log('📸 Imagem salva:', imageUrl);
            
            // Adicionar imagem no local correto
            if (saveImageInCustomization) {
                if (customizationData.imageType === 'background') {
                    customizationData.backgroundImage = imageUrl;
                    console.log('🖼️ Imagem de fundo adicionada:', imageUrl);
                } else if (customizationData.imageType === 'partial') {
                    customizationData.partialImage = imageUrl;
                    console.log('🖼️ Imagem parcial adicionada:', imageUrl);
                }
                // Limpar imageUrl para não salvar duplicado
                imageUrl = '';
            }
        }
        
        // Verificar se o usuário está logado
        if (!req.session.userId) {
            console.log('⚠️ Usuário não autenticado - usando usuário padrão para teste');
            // Para teste, usar usuário ID 1 (admin)
            req.session.userId = 1;
            req.session.userName = 'Admin';
            req.session.userEmail = 'admin@contentflow.ai';
        }
        
        // Validar dados obrigatórios
        if (!title || !content) {
            console.log('❌ Validação falhou - Título:', title, 'Conteúdo:', content);
            return res.status(400).json({ message: 'Título e conteúdo são obrigatórios' });
        }
        
        console.log('✅ Validação passou - Salvando no banco...');
        
        // Verificar se a conexão com o banco está funcionando
        if (!pool) {
            console.error('❌ Conexão com banco de dados não disponível');
            return res.status(500).json({ 
                success: false,
                message: 'Erro de conexão com banco de dados' 
            });
        }
        
        // Salvar no banco de dados
        const query = `
            INSERT INTO posts (user_id, title, content, hashtags, template, platforms, image_url, customization, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        // Limitar tamanho do JSON de customização
        let finalCustomization = JSON.stringify(customizationData);
        if (finalCustomization.length > 10000) {
            console.log('⚠️ Customização muito grande, truncando...');
            finalCustomization = JSON.stringify({ 
                error: 'Customização muito grande', 
                originalSize: finalCustomization.length 
            });
        }
        
        console.log('🔍 Query SQL:', query);
        console.log('🔍 Parâmetros:', [
            req.session.userId,
            title,
            content,
            hashtags || '',
            template || 'Post Personalizado',
            platforms || '[]',
            imageUrl,
            finalCustomization
        ]);
        
        // Debug específico da customização final
        console.log('🔍 Customização final sendo salva:', finalCustomization);
        try {
            const customParsed = JSON.parse(finalCustomization);
            console.log('🔍 Vídeo na customização final:', customParsed.video);
            console.log('🔍 Legenda na customização final:', customParsed.videoCaption);
            console.log('🔍 Narração na customização final:', customParsed.narration);
        } catch (e) {
            console.error('❌ Erro ao parsear customização final:', e);
        }
        
        const result = await pool.execute(query, [
            req.session.userId,
            title,
            content,
            hashtags || '',
            template || 'Post Personalizado',
            platforms || '[]',
            imageUrl,
            finalCustomization
        ]);
        
        console.log('✅ Post salvo com sucesso - ID:', result[0].insertId);
        
        res.json({ 
            success: true, 
            message: 'Post criado com sucesso!',
            postId: result[0].insertId
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar post JSON:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro interno do servidor',
            error: error.message 
        });
    }
});


// Rota para criar posts com upload de imagem
app.post('/api/posts', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'backgroundImage', maxCount: 1 }, { name: 'narrationAudio', maxCount: 1 }]), async (req, res) => {
    try {
        console.log('📝 POST /api/posts - Iniciando criação de post');
        console.log('📊 Dados recebidos:', {
            title: req.body.title,
            content: req.body.content ? req.body.content.substring(0, 100) + '...' : 'vazio',
            hashtags: req.body.hashtags,
            files: req.files ? Object.keys(req.files) : 'nenhum'
        });
        
        // Debug adicional para identificar o problema
        console.log('🔍 Debug completo:', {
            body: req.body,
            files: req.files,
            headers: req.headers
        });
        
        // Debug específico da customização
        if (req.body.customization) {
            try {
                const customization = JSON.parse(req.body.customization);
                console.log('🔍 Customização parseada no servidor:', customization);
                console.log('🔍 Vídeo na customização:', customization.video);
                console.log('🔍 Legenda na customização:', customization.videoCaption);
                console.log('🔍 Narração na customização:', customization.narration);
            } catch (e) {
                console.error('❌ Erro ao parsear customização no servidor:', e);
            }
        }
        
        // Para FormData, os dados vêm em req.body diretamente
        const title = req.body.title;
        const content = req.body.content;
        const hashtags = req.body.hashtags;
        const template = req.body.template;
        const platforms = req.body.platforms;
        const customization = req.body.customization;
        
        // Processar imagem se foi enviada
        let imageUrl = '';
        if (req.files && req.files.image && req.files.image[0]) {
            imageUrl = `/uploads/${req.files.image[0].filename}`;
            console.log('📸 Imagem salva:', imageUrl);
        }

        // Processar vídeo se foi enviado
        let videoUrl = '';
        console.log('🔍 Verificando arquivos recebidos:', req.files);
        if (req.files && req.files.video && req.files.video[0]) {
            videoUrl = `/uploads/${req.files.video[0].filename}`;
            console.log('🎬 Vídeo salvo:', videoUrl);
            console.log('🎬 Arquivo original:', req.files.video[0].originalname);
            console.log('🎬 Tamanho do arquivo:', req.files.video[0].size);
            console.log('🎬 Tipo MIME:', req.files.video[0].mimetype);
            
            // Se vier um JSON de customização, substituir marcador "uploaded"
            if (customization) {
                try {
                    const c = JSON.parse(customization);
                    console.log('🔍 Customização original:', c);
                    if (c.video === 'uploaded') {
                        c.video = videoUrl;
                        req.body.customization = JSON.stringify(c);
                        console.log('🔄 Vídeo substituído na customização:', c.video);
                    }
                } catch (e) {
                    console.error('❌ Erro ao processar customização:', e);
                }
            }
        } else {
            console.log('⚠️ Nenhum vídeo encontrado nos arquivos');
        }

        // Processar imagem de fundo se foi enviada
        let backgroundImageUrl = '';
        if (req.files && req.files.backgroundImage && req.files.backgroundImage[0]) {
            backgroundImageUrl = `/uploads/${req.files.backgroundImage[0].filename}`;
            console.log('🖼️ Imagem de fundo salva:', backgroundImageUrl);
            
            // Se vier um JSON de customização, substituir marcador "uploaded"
            if (customization) {
                try {
                    const c = JSON.parse(customization);
                    if (c.backgroundImage === 'uploaded') {
                        c.backgroundImage = backgroundImageUrl;
                        req.body.customization = JSON.stringify(c);
                        console.log('🔄 Imagem de fundo substituída na customização:', c.backgroundImage);
                    }
                } catch (e) {
                    console.error('❌ Erro ao processar customização da imagem de fundo:', e);
                }
            }
        }
        
        // Processar imagem do Pexels se foi enviada
        if (req.body.pexelsBackgroundImage) {
            console.log('🖼️ Imagem do Pexels recebida:', req.body.pexelsBackgroundImage);
            
            // Se vier um JSON de customização, substituir marcador "pexels"
            if (customization) {
                try {
                    const c = JSON.parse(customization);
                    c.backgroundImage = req.body.pexelsBackgroundImage;
                    req.body.customization = JSON.stringify(c);
                    console.log('🔄 Imagem do Pexels adicionada na customização:', c.backgroundImage);
                } catch (e) {
                    console.error('❌ Erro ao processar customização da imagem do Pexels:', e);
                }
            }
        }

        // Processar imagem parcial do Pexels se foi enviada
        if (req.body.pexelsPartialImage) {
            console.log('🖼️ Imagem parcial do Pexels recebida:', req.body.pexelsPartialImage);
            
            if (customization) {
                try {
                    const c = JSON.parse(customization);
                    c.partialImage = req.body.pexelsPartialImage;
                    req.body.customization = JSON.stringify(c);
                    console.log('🔄 Imagem parcial do Pexels adicionada na customização:', c.partialImage);
                } catch (e) {
                    console.error('❌ Erro ao processar customização da imagem parcial do Pexels:', e);
                }
            }
        }
        
        // Processar áudio de narração se foi enviado
        let narrationAudioUrl = '';
        if (req.files && req.files.narrationAudio && req.files.narrationAudio[0]) {
            narrationAudioUrl = `/uploads/${req.files.narrationAudio[0].filename}`;
            console.log('🎤 Áudio de narração salvo:', narrationAudioUrl);
            console.log('🎤 Arquivo original:', req.files.narrationAudio[0].originalname);
            console.log('🎤 Tamanho do arquivo:', req.files.narrationAudio[0].size);
            console.log('🎤 Tipo MIME:', req.files.narrationAudio[0].mimetype);
        }
        
        // Processar dados de narração se foram enviados
        if (req.body.narration) {
            console.log('🎤 Dados de narração recebidos:', req.body.narration);
            
            if (customization) {
                try {
                    const c = JSON.parse(customization);
                    c.narration = req.body.narration;
                    
                    // Adicionar URL do áudio se foi salvo
                    if (narrationAudioUrl) {
                        c.narration.audioUrl = narrationAudioUrl;
                        c.narration.hasAudio = true;
                        console.log('🔄 URL do áudio adicionada na narração:', narrationAudioUrl);
                    }
                    
                    req.body.customization = JSON.stringify(c);
                    console.log('🔄 Narração adicionada na customização:', c.narration);
                } catch (e) {
                    console.error('❌ Erro ao processar customização da narração:', e);
                }
            }
        }
        
        // Garantir que usamos a versão mais recente da customização (após possível substituição do vídeo)
        const effectiveCustomization = req.body.customization || customization || '';
        
        // Debug: verificar dados recebidos
        console.log('🔍 Debug - Dados recebidos no servidor:');
        console.log('Título:', title);
        console.log('Conteúdo:', content);
        console.log('Hashtags:', hashtags);
        console.log('Template:', template);
        console.log('Plataformas:', platforms);
        console.log('Customização:', effectiveCustomization);
        console.log('Body completo:', req.body);
        console.log('📁 Arquivo recebido:', req.file);
        console.log('👤 Sessão do usuário:', req.session);
        
        // Verificar se o usuário está logado
        if (!req.session.userId) {
            console.log('❌ Usuário não autenticado - Sessão:', req.session);
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }
        
        console.log('✅ Usuário autenticado:', req.session.userId);
        
        // Validar dados obrigatórios
        if (!title || !content) {
            console.log('❌ Validação falhou - Título:', title, 'Conteúdo:', content);
            console.log('❌ Título vazio?', !title);
            console.log('❌ Conteúdo vazio?', !content);
            return res.status(400).json({ message: 'Título e conteúdo são obrigatórios' });
        }
        
        console.log('✅ Validação passou - Título e conteúdo presentes');
        
        let postId = null;
        let postCreated = false;
        
        try {
            console.log('🔄 Tentando salvar no banco de dados...');
            console.log('📝 Dados para inserir:', {
                user_id: req.session.userId,
                title: title,
                content: content,
                hashtags: hashtags || '',
                template: template || '',
                platforms: platforms || '',
                image_url: imageUrl,
                customization: effectiveCustomization
            });
            
            // Tentar salvar no banco de dados
            console.log('📝 Inserindo post único no banco...');
            console.log('🔍 Customização final sendo salva:', effectiveCustomization);
            const [result] = await pool.execute(
                'INSERT INTO posts (user_id, title, content, hashtags, template, platforms, image_url, customization, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
                [req.session.userId, title, content, hashtags || '', template || '', platforms || '', imageUrl, effectiveCustomization, 'draft']
            );
            
            postId = result.insertId;
            postCreated = true;
            console.log('✅ Post salvo no banco com ID:', postId);
            
            // Log da atividade (opcional - não quebrar se tabela não existir)
            try {
                await pool.execute(
                    'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
                    [req.session.userId, 'post_created', `Post criado: ${title}`, new Date()]
                );
            } catch (logError) {
                console.log('⚠️ Tabela activity_logs não encontrada, pulando log...');
            }
            
        } catch (dbError) {
            console.log('❌ Erro ao salvar no banco:', dbError.message);
            console.log('❌ Stack trace:', dbError.stack);
            console.log('🔄 Tentando salvar em modo demo...');
            
            // Salvar em modo demo
            try {
                if (!global.demoPosts) {
                    global.demoPosts = [];
                }
                
                const newPost = {
                    id: Date.now(),
                    user_id: req.session.userId,
                    title: title,
                    content: content,
                    hashtags: hashtags || '',
                    template: template || '',
                    platforms: platforms || '',
                    image_url: imageUrl,
                    customization: effectiveCustomization,
                    status: 'draft',
                    created_at: new Date().toISOString()
                };
                
                global.demoPosts.push(newPost);
                console.log('📝 Post adicionado ao modo demo:', newPost.id);
                
                // Salvar no arquivo
                await fs.writeFile('demo-posts.json', JSON.stringify(global.demoPosts, null, 2));
                console.log('💾 Arquivo demo-posts.json atualizado');
                
                postId = newPost.id;
                postCreated = true;
                console.log('✅ Post salvo em modo demo com ID:', postId);
                
            } catch (demoError) {
                console.error('❌ Erro ao salvar em modo demo:', demoError);
                return res.status(500).json({ message: 'Erro ao salvar post em modo demo' });
            }
        }
        
        if (postCreated) {
            res.json({ 
                message: 'Post criado com sucesso!', 
                postId: postId,
                post: {
                    id: postId,
                    title: title,
                    content: content,
                    hashtags: hashtags,
                    template: template,
                    platforms: platforms,
                    image_url: imageUrl
                }
            });
        } else {
            res.status(500).json({ message: 'Erro ao criar post' });
        }
        
    } catch (error) {
        console.error('❌ Erro geral ao criar post:', error);
        console.error('❌ Stack trace:', error.stack);
        console.error('❌ Error details:', {
            message: error.message,
            name: error.name,
            code: error.code
        });
        
        // Tentar retornar erro mais específico
        if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(500).json({ 
                message: 'Tabela não encontrada no banco de dados',
                error: 'ER_NO_SUCH_TABLE'
            });
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
            res.status(500).json({ 
                message: 'Coluna não encontrada na tabela',
                error: 'ER_BAD_FIELD_ERROR'
            });
        } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            console.error('❌ Erro de conexão detectado:', error.code);
            res.status(408).json({ 
                message: 'Timeout na conexão',
                error: 'A conexão foi perdida. Tente novamente.',
                code: error.code
            });
        } else {
            res.status(500).json({ 
                message: 'Erro interno do servidor',
                error: error.message,
                code: error.code || 'UNKNOWN'
            });
        }
    }
});

// Atualizar post existente
app.put('/api/posts/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'backgroundImage', maxCount: 1 }]), async (req, res) => {
    try {
        console.log('🔄 PUT /api/posts/:id - Iniciando atualização');
        const postId = req.params.id;
        console.log('📝 Post ID:', postId);
        console.log('📝 Body recebido:', req.body);
        console.log('📝 Files recebidos:', req.files);
        console.log('👤 Sessão:', req.session);
        
        // Debug detalhado dos arquivos
        if (req.files) {
            console.log('📁 Debug - req.files keys:', Object.keys(req.files));
            if (req.files.image) {
                console.log('📸 Debug - req.files.image:', req.files.image);
                console.log('📸 Debug - req.files.image[0]:', req.files.image[0]);
            }
        } else {
            console.log('📁 Debug - req.files é null/undefined');
        }
        
        const { title, content, hashtags, template, platforms, customization, status } = req.body;

        if (!req.session.userId) {
            console.log('❌ Usuário não autenticado');
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        if (!title || !content) {
            return res.status(400).json({ message: 'Título e conteúdo são obrigatórios' });
        }

        // Processar imagem se enviada
        let imageUrl = undefined;
        if (req.files && req.files.image && req.files.image[0]) {
            console.log('📸 Nova imagem detectada - iniciando processo de substituição');
            
            // Deletar imagem anterior se existir (tanto image_url quanto backgroundImage)
            try {
                const [currentPost] = await pool.execute('SELECT image_url, customization FROM posts WHERE id = ? AND user_id = ?', [postId, req.session.userId]);
                console.log('🔍 Post atual encontrado:', currentPost.length > 0);
                
                if (currentPost.length > 0) {
                    // Deletar imagem inteira anterior (image_url)
                    if (currentPost[0].image_url && currentPost[0].image_url !== 'imagem_uploaded' && currentPost[0].image_url.startsWith('/uploads/')) {
                        const oldImagePath = currentPost[0].image_url.replace('/uploads/', 'uploads/');
                        const fs = require('fs');
                        const path = require('path');
                        const fullPath = path.join(__dirname, oldImagePath);
                        
                        console.log('🔍 Tentando deletar imagem inteira anterior:', fullPath);
                        console.log('🔍 Arquivo existe:', fs.existsSync(fullPath));
                        
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                            console.log('✅ Imagem inteira anterior deletada:', oldImagePath);
                        } else {
                            console.log('⚠️ Imagem inteira anterior não encontrada:', fullPath);
                        }
                    }
                    
                    // Deletar imagem parcial anterior (backgroundImage na customização)
                    if (currentPost[0].customization) {
                        try {
                            const custom = JSON.parse(currentPost[0].customization);
                            if (custom.backgroundImage && custom.backgroundImage !== 'uploaded' && custom.backgroundImage.startsWith('/uploads/')) {
                                const oldBackgroundPath = custom.backgroundImage.replace('/uploads/', 'uploads/');
                                const fs = require('fs');
                                const path = require('path');
                                const fullPath = path.join(__dirname, oldBackgroundPath);
                                
                                console.log('🔍 Tentando deletar imagem parcial anterior:', fullPath);
                                console.log('🔍 Arquivo existe:', fs.existsSync(fullPath));
                                
                                if (fs.existsSync(fullPath)) {
                                    fs.unlinkSync(fullPath);
                                    console.log('✅ Imagem parcial anterior deletada:', oldBackgroundPath);
                                } else {
                                    console.log('⚠️ Imagem parcial anterior não encontrada:', fullPath);
                                }
                            }
                        } catch (parseError) {
                            console.log('⚠️ Erro ao processar customização para deleção:', parseError.message);
                        }
                    }
                } else {
                    console.log('ℹ️ Nenhuma imagem anterior encontrada');
                }
            } catch (deleteError) {
                console.log('❌ Erro ao deletar imagem anterior:', deleteError.message);
                console.log('❌ Stack trace:', deleteError.stack);
            }
            
            imageUrl = `/uploads/${req.files.image[0].filename}`;
            console.log('📸 Nova imagem salva como:', imageUrl);
            console.log('📸 Arquivo original:', req.files.image[0].originalname);
        } else {
            console.log('ℹ️ Nenhuma nova imagem enviada - mantendo imagem atual');
        }
        let videoUrl = undefined;
        if (req.files && req.files.video && req.files.video[0]) {
            console.log('🎬 Novo vídeo detectado - iniciando processo de substituição');
            
            // Deletar vídeo anterior se existir
            try {
                const [currentPost] = await pool.execute('SELECT customization FROM posts WHERE id = ? AND user_id = ?', [postId, req.session.userId]);
                console.log('🔍 Post atual encontrado para vídeo:', currentPost.length > 0);
                
                if (currentPost.length > 0 && currentPost[0].customization) {
                    const custom = JSON.parse(currentPost[0].customization);
                    console.log('🔍 Vídeo atual:', custom.video);
                    
                    if (custom.video && custom.video !== 'uploaded' && custom.video.startsWith('/uploads/')) {
                        const oldVideoPath = custom.video.replace('/uploads/', 'uploads/');
                        const fs = require('fs');
                        const path = require('path');
                        const fullPath = path.join(__dirname, oldVideoPath);
                        
                        console.log('🔍 Tentando deletar vídeo:', fullPath);
                        console.log('🔍 Vídeo existe:', fs.existsSync(fullPath));
                        
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                            console.log('✅ Vídeo anterior deletado com sucesso:', oldVideoPath);
                        } else {
                            console.log('⚠️ Vídeo anterior não encontrado:', fullPath);
                        }
                    } else {
                        console.log('ℹ️ Vídeo atual é placeholder ou inválido, pulando deleção');
                    }
                } else {
                    console.log('ℹ️ Nenhum vídeo anterior encontrado');
                }
            } catch (deleteError) {
                console.log('❌ Erro ao deletar vídeo anterior:', deleteError.message);
                console.log('❌ Stack trace:', deleteError.stack);
            }
            
            videoUrl = `/uploads/${req.files.video[0].filename}`;
            if (customization) {
                try {
                    const c = JSON.parse(customization);
                    c.video = videoUrl; // sobrescreve para a nova URL
                    req.body.customization = JSON.stringify(c);
                } catch (e) {}
            }
            console.log('🎬 Novo vídeo salvo como:', videoUrl);
        }

        // Processar imagem de fundo se foi enviada
        let backgroundImageUrl = undefined;
        console.log('🔍 Debug - Verificando imagem de fundo:');
        console.log('🔍 Debug - req.files:', req.files);
        console.log('🔍 Debug - req.files.backgroundImage:', req.files ? req.files.backgroundImage : 'null');
        
        if (req.files && req.files.backgroundImage && req.files.backgroundImage[0]) {
            console.log('🖼️ Nova imagem de fundo detectada - iniciando processo de substituição');
            
            // Deletar imagem de fundo anterior se existir (tanto backgroundImage quanto image_url)
            try {
                const [currentPost] = await pool.execute('SELECT image_url, customization FROM posts WHERE id = ? AND user_id = ?', [postId, req.session.userId]);
                console.log('🔍 Post atual encontrado para imagem de fundo:', currentPost.length > 0);
                
                if (currentPost.length > 0) {
                    // Deletar imagem inteira anterior (image_url) se existir
                    if (currentPost[0].image_url && currentPost[0].image_url !== 'imagem_uploaded' && currentPost[0].image_url.startsWith('/uploads/')) {
                        const oldImagePath = currentPost[0].image_url.replace('/uploads/', 'uploads/');
                        const fs = require('fs');
                        const path = require('path');
                        const fullPath = path.join(__dirname, oldImagePath);
                        
                        console.log('🔍 Tentando deletar imagem inteira anterior:', fullPath);
                        console.log('🔍 Arquivo existe:', fs.existsSync(fullPath));
                        
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                            console.log('✅ Imagem inteira anterior deletada:', oldImagePath);
                        } else {
                            console.log('⚠️ Imagem inteira anterior não encontrada:', fullPath);
                        }
                    }
                    
                    // Deletar imagem parcial anterior (backgroundImage na customização)
                    if (currentPost[0].customization) {
                        try {
                            const custom = JSON.parse(currentPost[0].customization);
                            if (custom.backgroundImage && custom.backgroundImage !== 'uploaded' && custom.backgroundImage.startsWith('/uploads/')) {
                                const oldBackgroundPath = custom.backgroundImage.replace('/uploads/', 'uploads/');
                                const fs = require('fs');
                                const path = require('path');
                                const fullPath = path.join(__dirname, oldBackgroundPath);
                                
                                console.log('🔍 Tentando deletar imagem parcial anterior:', fullPath);
                                console.log('🔍 Arquivo existe:', fs.existsSync(fullPath));
                                
                                if (fs.existsSync(fullPath)) {
                                    fs.unlinkSync(fullPath);
                                    console.log('✅ Imagem parcial anterior deletada:', oldBackgroundPath);
                                } else {
                                    console.log('⚠️ Imagem parcial anterior não encontrada:', fullPath);
                                }
                            }
                        } catch (parseError) {
                            console.log('⚠️ Erro ao processar customização para deleção:', parseError.message);
                        }
                    }
                } else {
                    console.log('ℹ️ Nenhuma imagem anterior encontrada para imagem de fundo');
                }
            } catch (deleteError) {
                console.log('❌ Erro ao deletar imagem anterior:', deleteError.message);
                console.log('❌ Stack trace:', deleteError.stack);
            }
            
            backgroundImageUrl = `/uploads/${req.files.backgroundImage[0].filename}`;
            console.log('🖼️ Nova imagem de fundo detectada:', backgroundImageUrl);
            console.log('🖼️ Arquivo original:', req.files.backgroundImage[0].originalname);
            console.log('🖼️ Tamanho do arquivo:', req.files.backgroundImage[0].size);
            
            if (customization) {
                try {
                    const c = JSON.parse(customization);
                    console.log('🔍 Debug - Customização original:', c);
                    c.backgroundImage = backgroundImageUrl;
                    req.body.customization = JSON.stringify(c);
                    console.log('✅ Customização atualizada com nova imagem de fundo:', c.backgroundImage);
                    console.log('🔍 Debug - Customização final:', req.body.customization);
                } catch (e) {
                    console.error('❌ Erro ao processar customização:', e);
                }
            } else {
                // Se não há customização, criar uma nova
                const newCustomization = { backgroundImage: backgroundImageUrl };
                req.body.customization = JSON.stringify(newCustomization);
                console.log('✅ Nova customização criada com imagem de fundo:', newCustomization);
                console.log('🔍 Debug - Nova customização JSON:', req.body.customization);
            }
        } else {
            console.log('ℹ️ Nenhuma nova imagem de fundo enviada - mantendo imagem atual');
        }
        
        // Processar imagem do Pexels se foi enviada
        if (req.body.pexelsBackgroundImage) {
            console.log('🖼️ Imagem do Pexels recebida na atualização:', req.body.pexelsBackgroundImage);
            
            if (customization) {
                try {
                    const c = JSON.parse(customization);
                    c.backgroundImage = req.body.pexelsBackgroundImage;
                    req.body.customization = JSON.stringify(c);
                    console.log('🔄 Imagem do Pexels adicionada na customização (atualização):', c.backgroundImage);
                } catch (e) {
                    console.error('❌ Erro ao processar customização da imagem do Pexels (atualização):', e);
                }
            }
        }

        // Processar imagem parcial do Pexels se foi enviada
        if (req.body.pexelsPartialImage) {
            console.log('🖼️ Imagem parcial do Pexels recebida na atualização:', req.body.pexelsPartialImage);
            
            if (customization) {
                try {
                    const c = JSON.parse(customization);
                    c.partialImage = req.body.pexelsPartialImage;
                    req.body.customization = JSON.stringify(c);
                    console.log('🔄 Imagem parcial do Pexels adicionada na customização (atualização):', c.partialImage);
                } catch (e) {
                    console.error('❌ Erro ao processar customização da imagem parcial do Pexels (atualização):', e);
                }
            }
        }

        let updated = false;
        try {
            // Montar campos dinamicamente
            const fields = [
                'title = ?',
                'content = ?',
                'hashtags = ?',
                'template = ?',
                'platforms = ?',
                'customization = ?',
                'status = ?'
            ];
            // Usar a customização atualizada (que pode ter sido modificada pelo processamento de imagem de fundo)
            const finalCustomization = req.body.customization || customization || '';
            console.log('🔧 Debug - Customização final sendo salva:', finalCustomization);
            
            const params = [title, content, hashtags || '', template || '', platforms || '', finalCustomization, status || 'draft'];
            if (imageUrl !== undefined) {
                fields.push('image_url = ?');
                params.push(imageUrl);
                console.log('📸 Atualizando imagem do post para:', imageUrl);
            } else {
                console.log('ℹ️ Mantendo imagem atual do post');
            }
            // vídeo embutido está dentro de customization; não há coluna separada
            params.push(req.session.userId, postId);

            console.log('🔍 Debug - Query SQL:', `UPDATE posts SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ? AND id = ?`);
            console.log('🔍 Debug - Parâmetros:', params);
            
            const [result] = await pool.execute(
                `UPDATE posts SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ? AND id = ?`,
                params
            );
            
            console.log('🔍 Debug - Resultado da query:', result);
            console.log('🔍 Debug - Linhas afetadas:', result.affectedRows);
            
            if (result.affectedRows > 0) {
                updated = true;
                console.log('✅ Post atualizado com sucesso no banco de dados');
            } else {
                console.log('⚠️ Nenhuma linha foi atualizada no banco de dados');
            }
        } catch (dbError) {
            console.log('🔄 Modo demo - Atualizando post');
            // Modo demo
            if (!global.demoPosts) global.demoPosts = [];
            const idx = global.demoPosts.findIndex(p => String(p.id) === String(postId) && p.user_id === req.session.userId);
            if (idx !== -1) {
                const current = global.demoPosts[idx];
                
                // Processar customização corretamente
                let finalCustomization = current.customization || '{}';
                if (customization) {
                    try {
                        const currentCustom = JSON.parse(finalCustomization);
                        const newCustom = JSON.parse(customization);
                        finalCustomization = JSON.stringify({ ...currentCustom, ...newCustom });
                        console.log('✅ Customização mesclada no modo demo:', finalCustomization);
                    } catch (e) {
                        console.error('❌ Erro ao mesclar customização:', e);
                        finalCustomization = customization;
                    }
                }
                
                global.demoPosts[idx] = {
                    ...current,
                    title,
                    content,
                    hashtags: hashtags || '',
                    template: template || '',
                    platforms: platforms || current.platforms || '',
                    customization: finalCustomization,
                    status: status || current.status || 'draft',
                    image_url: imageUrl !== undefined ? imageUrl : current.image_url,
                    updated_at: new Date().toISOString()
                };
                await fs.writeFile('demo-posts.json', JSON.stringify(global.demoPosts, null, 2));
                updated = true;
                console.log('✅ Post atualizado no modo demo');
            }
        }

        if (updated) {
            return res.json({ message: 'Post atualizado com sucesso' });
        } else {
            return res.status(404).json({ message: 'Post não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao atualizar post:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para buscar posts do usuário
app.get('/api/posts', async (req, res) => {
    try {
        console.log('🔍 GET /api/posts chamada');
        console.log('🔍 Sessão completa:', req.session);
        console.log('🔍 User ID na sessão:', req.session.userId);
        console.log('🔍 Sessão existe?', !!req.session);
        
        // Verificar se o usuário está logado
        if (!req.session.userId) {
            console.log('❌ Usuário não autenticado - retornando 401');
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }
        
        console.log('✅ Usuário autenticado:', req.session.userId);

        let posts = [];

        try {
            // Tentar buscar no banco de dados
            const [rows] = await pool.execute(
                'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
                [req.session.userId]
            );
            posts = rows;
            console.log(`📊 ${posts.length} posts encontrados no banco de dados`);
        } catch (dbError) {
            console.log('🔄 Banco não disponível, usando modo demo...');
            console.log('🔍 global.demoPosts existe?', !!global.demoPosts);
            console.log('🔍 global.demoPosts length:', global.demoPosts ? global.demoPosts.length : 'undefined');
            console.log('🔍 Usuário atual:', req.session.userId);
            
            // Usar posts demo se banco não estiver disponível
            if (global.demoPosts && global.demoPosts.length > 0) {
                posts = global.demoPosts.filter(post => post.user_id === req.session.userId);
                console.log('🔍 Posts filtrados para usuário:', posts);
            } else {
                posts = [];
                console.log('⚠️ Nenhum post demo encontrado');
            }
            console.log(`📊 ${posts.length} posts encontrados no modo demo`);
        }

        res.json(posts);
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para gerar imagem de fundo baseada no conteúdo
app.post('/api/generate-background', async (req, res) => {
    try {
        const { content, template, title } = req.body;
        
        // Verificar se o usuário está logado
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Gerar imagem de fundo baseada no template e conteúdo
        const backgroundImage = generateBackgroundImage(template, content, title);
        
        res.json({ 
            backgroundImage,
            message: 'Imagem de fundo gerada com sucesso'
        });
        
    } catch (error) {
        console.error('Erro ao gerar imagem de fundo:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para buscar imagens do Unsplash (com fallback para imagens de exemplo)
app.get('/api/unsplash/search', async (req, res) => {
    try {
        const { query, page = 1, per_page = 20 } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Query é obrigatória' });
        }
        
        console.log('🔍 Buscando imagens para:', { query, page, per_page });
        
        // Por enquanto, retornar imagens de exemplo até a chave ser corrigida
        const exampleImages = generateExampleImages(query, parseInt(per_page));
        
        console.log(`✅ Retornando ${exampleImages.length} imagens de exemplo`);
        
        res.json({
            images: exampleImages,
            total: 100,
            total_pages: 5,
            current_page: parseInt(page),
            note: 'Usando imagens de exemplo - chave Unsplash inválida'
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar imagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Função para gerar imagens de exemplo
function generateExampleImages(query, count) {
    const baseImages = [
        {
            id: '1',
            url: 'https://picsum.photos/800/600?random=1',
            thumb: 'https://picsum.photos/300/200?random=1',
            full: 'https://picsum.photos/1920/1080?random=1',
            description: `Imagem de exemplo para "${query}"`,
            author: 'Picsum Photos',
            authorUrl: 'https://picsum.photos',
            downloadUrl: 'https://picsum.photos/800/600?random=1'
        },
        {
            id: '2',
            url: 'https://picsum.photos/800/600?random=2',
            thumb: 'https://picsum.photos/300/200?random=2',
            full: 'https://picsum.photos/1920/1080?random=2',
            description: `Imagem de exemplo para "${query}"`,
            author: 'Picsum Photos',
            authorUrl: 'https://picsum.photos',
            downloadUrl: 'https://picsum.photos/800/600?random=2'
        },
        {
            id: '3',
            url: 'https://picsum.photos/800/600?random=3',
            thumb: 'https://picsum.photos/300/200?random=3',
            full: 'https://picsum.photos/1920/1080?random=3',
            description: `Imagem de exemplo para "${query}"`,
            author: 'Picsum Photos',
            authorUrl: 'https://picsum.photos',
            downloadUrl: 'https://picsum.photos/800/600?random=3'
        },
        {
            id: '4',
            url: 'https://picsum.photos/800/600?random=4',
            thumb: 'https://picsum.photos/300/200?random=4',
            full: 'https://picsum.photos/1920/1080?random=4',
            description: `Imagem de exemplo para "${query}"`,
            author: 'Picsum Photos',
            authorUrl: 'https://picsum.photos',
            downloadUrl: 'https://picsum.photos/800/600?random=4'
        },
        {
            id: '5',
            url: 'https://picsum.photos/800/600?random=5',
            thumb: 'https://picsum.photos/300/200?random=5',
            full: 'https://picsum.photos/1920/1080?random=5',
            description: `Imagem de exemplo para "${query}"`,
            author: 'Picsum Photos',
            authorUrl: 'https://picsum.photos',
            downloadUrl: 'https://picsum.photos/800/600?random=5'
        }
    ];
    
    return baseImages.slice(0, count);
}

// Rota para baixar imagem do Unsplash
app.post('/api/unsplash/download', async (req, res) => {
    try {
        const { downloadUrl } = req.body;
        
        if (!downloadUrl) {
            return res.status(400).json({ error: 'URL de download é obrigatória' });
        }
        
        console.log('📥 Baixando imagem do Unsplash:', downloadUrl);
        
        // Fazer download da imagem
        const response = await fetch(downloadUrl, {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });
        
        if (!response.ok) {
            console.error('❌ Erro ao baixar imagem:', response.status);
            return res.status(500).json({ error: 'Erro ao baixar imagem' });
        }
        
        const imageBuffer = await response.buffer();
        const filename = `unsplash-${Date.now()}.jpg`;
        const filepath = path.join(__dirname, 'uploads', filename);
        
        await fs.writeFile(filepath, imageBuffer);
        
        console.log('✅ Imagem baixada e salva:', filename);
        
        res.json({
            filename,
            url: `/uploads/${filename}`,
            message: 'Imagem baixada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao baixar imagem do Unsplash:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


// Função para gerar imagem de fundo baseada no conteúdo
function generateBackgroundImage(template, content, title) {
    // Mapear templates para cores e padrões
    const templateStyles = {
        'Post Motivacional': {
            gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
            pattern: 'motivational',
            keywords: ['inspiração', 'sucesso', 'motivação', 'energia']
        },
        'Dica de Negócio': {
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            pattern: 'business',
            keywords: ['negócios', 'empreendedorismo', 'crescimento', 'estratégia']
        },
        'Pergunta Engajamento': {
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            pattern: 'engagement',
            keywords: ['comunidade', 'interação', 'pergunta', 'engajamento']
        },
        'Promoção de Produto': {
            gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            pattern: 'promotion',
            keywords: ['oferta', 'desconto', 'promoção', 'venda']
        },
        'Dica Técnica': {
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            pattern: 'technical',
            keywords: ['tecnologia', 'código', 'programação', 'tutorial']
        },
        'Post Pessoal': {
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            pattern: 'personal',
            keywords: ['pessoal', 'vida', 'experiência', 'história']
        }
    };

    const style = templateStyles[template] || templateStyles['Post Pessoal'];
    
    // Retornar dados da imagem de fundo
    return {
        gradient: style.gradient,
        pattern: style.pattern,
        keywords: style.keywords,
        template: template,
        generatedAt: new Date().toISOString()
    };
}

// Start server
async function startServer() {
    console.log('🔄 Testando conexão com banco de dados...');
    
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
        console.log('⚠️ AVISO: Banco de dados não disponível!');
        console.log('💡 Continuando em modo demo com dados locais...');
        console.log('🔄 Carregando dados demo...');
        await loadDemoData();
    } else {
        console.log('✅ Conectado ao banco MySQL');
    }
    
    app.listen(PORT, () => {
        console.log(`🚀 ContentFlow AI rodando na porta ${PORT}`);
        console.log(`📱 Acesse: http://localhost:${PORT}`);
        if (dbConnected) {
            console.log('✅ Conectado ao banco MySQL');
        } else {
            console.log('📁 Modo demo ativo - dados salvos localmente');
        }
    });
}

startServer().catch(console.error);
