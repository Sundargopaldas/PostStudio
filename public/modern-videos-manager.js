// Modern Videos Manager - Vídeos mais atuais e modernos
class ModernVideosManager {
    constructor() {
        this.accessKey = 'f0djuVMOG9iW68zHOsbZmk2yt5ip7wbajvoPz10jMOhVDtg7yihzmRjJ';
        this.baseURL = 'https://api.pexels.com/v1';
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutos
    }

    // Categorias modernas e atuais
    getModernCategories() {
        return [
            { name: 'Tecnologia', query: 'technology modern digital', icon: '💻' },
            { name: 'Cidade Moderna', query: 'modern city urban architecture', icon: '🏙️' },
            { name: 'Negócios', query: 'business corporate office modern', icon: '💼' },
            { name: 'Lifestyle', query: 'lifestyle modern fashion', icon: '👔' },
            { name: 'Esportes', query: 'sports fitness modern gym', icon: '🏃' },
            { name: 'Comida', query: 'food modern restaurant cuisine', icon: '🍽️' },
            { name: 'Viagem', query: 'travel modern destination', icon: '✈️' },
            { name: 'Arte', query: 'art modern creative design', icon: '🎨' },
            { name: 'Música', query: 'music modern concert', icon: '🎵' },
            { name: 'Saúde', query: 'health wellness modern', icon: '💪' }
        ];
    }

    // Buscar vídeos modernos por categoria
    async getModernVideosByCategory(category, page = 1) {
        const cacheKey = `modern_${category}_${page}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            console.log('📦 Vídeos modernos carregados do cache');
            return cached;
        }

        try {
            console.log(`🔍 Buscando vídeos modernos: ${category}`);
            const response = await fetch(
                `${this.baseURL}/videos/search?query=${encodeURIComponent(category)}&page=${page}&per_page=15&orientation=landscape&size=large`,
                {
                    headers: {
                        'Authorization': this.accessKey
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const result = {
                videos: data.videos,
                total: data.total_results,
                totalPages: Math.ceil(data.total_results / 15)
            };

            this.setCachedData(cacheKey, result);
            return result;
        } catch (error) {
            console.error('❌ Erro ao buscar vídeos modernos:', error);
            return { videos: [], total: 0, totalPages: 0 };
        }
    }

    // Buscar vídeos trending/atuais
    async getTrendingVideos(page = 1) {
        const cacheKey = `trending_${page}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            console.log('📦 Vídeos trending carregados do cache');
            return cached;
        }

        try {
            console.log('🔥 Buscando vídeos trending...');
            const response = await fetch(
                `${this.baseURL}/videos/popular?page=${page}&per_page=15&orientation=landscape&size=large`,
                {
                    headers: {
                        'Authorization': this.accessKey
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const result = {
                videos: data.videos,
                total: data.total_results,
                totalPages: Math.ceil(data.total_results / 15)
            };

            this.setCachedData(cacheKey, result);
            return result;
        } catch (error) {
            console.error('❌ Erro ao buscar vídeos trending:', error);
            return { videos: [], total: 0, totalPages: 0 };
        }
    }

    // Buscar vídeos por tema moderno
    async searchModernVideos(query, page = 1) {
        const cacheKey = `search_${query}_${page}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            console.log('📦 Busca moderna carregada do cache');
            return cached;
        }

        try {
            console.log(`🔍 Buscando: ${query}`);
            const response = await fetch(
                `${this.baseURL}/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=15&orientation=landscape&size=large`,
                {
                    headers: {
                        'Authorization': this.accessKey
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const result = {
                videos: data.videos,
                total: data.total_results,
                totalPages: Math.ceil(data.total_results / 15)
            };

            this.setCachedData(cacheKey, result);
            return result;
        } catch (error) {
            console.error('❌ Erro na busca moderna:', error);
            return { videos: [], total: 0, totalPages: 0 };
        }
    }

    // Filtrar vídeos por qualidade e modernidade
    filterModernVideos(videos) {
        return videos.filter(video => {
            // Filtrar por duração (não muito longos)
            const duration = parseInt(video.duration);
            if (duration > 60) return false; // Máximo 1 minuto
            
            // Filtrar por qualidade
            const hasHD = video.video_files.some(file => file.quality === 'hd');
            const hasMedium = video.video_files.some(file => file.quality === 'medium');
            
            return hasHD || hasMedium;
        });
    }

    // Otimizar URL do vídeo para qualidade moderna
    getModernVideoUrl(video, quality = 'medium') {
        const videoFiles = video.video_files || [];
        
        // Priorizar qualidade HD se disponível
        let selectedFile = videoFiles.find(file => file.quality === 'hd');
        
        if (!selectedFile) {
            selectedFile = videoFiles.find(file => file.quality === quality);
        }
        
        if (!selectedFile) {
            selectedFile = videoFiles[0];
        }
        
        return selectedFile?.link || '';
    }

    // Obter thumbnail otimizada
    getOptimizedThumbnail(video) {
        const pictures = video.video_pictures || [];
        
        // Priorizar imagens maiores
        const sortedPictures = pictures.sort((a, b) => b.width - a.width);
        return sortedPictures[0]?.picture || video.image || '';
    }

    // Cache com timeout
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Limpar cache
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache de vídeos modernos limpo');
    }

    // Obter estatísticas
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Exportar para uso global
window.ModernVideosManager = ModernVideosManager;
