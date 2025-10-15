// Pexels Integration Manager - Optimized Version
class PexelsOptimizedManager {
    constructor() {
        this.accessKey = 'f0djuVMOG9iW68zHOsbZmk2yt5ip7wbajvoPz10jMOhVDtg7yihzmRjJ';
        this.baseURL = 'https://api.pexels.com/v1';
        this.currentPage = 1;
        this.perPage = 15; // Reduzido para carregar mais rápido
        this.currentQuery = '';
        this.isLoading = false;
        this.cache = new Map(); // Cache para evitar requisições repetidas
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
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

    async searchPhotos(query, page = 1) {
        if (this.isLoading) return;
        
        const cacheKey = `photos_${query}_${page}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            console.log('📦 Dados carregados do cache');
            return cached;
        }
        
        this.isLoading = true;
        this.currentQuery = query;
        this.currentPage = page;

        try {
            console.log('🔍 Buscando fotos no Pexels...');
            const response = await fetch(
                `${this.baseURL}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${this.perPage}`,
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
            this.isLoading = false;
            
            const result = {
                photos: data.photos,
                total: data.total_results,
                totalPages: Math.ceil(data.total_results / this.perPage)
            };

            // Salvar no cache
            this.setCachedData(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error('❌ Erro ao buscar imagens do Pexels:', error);
            this.isLoading = false;
            return { photos: [], total: 0, totalPages: 0 };
        }
    }

    async searchVideos(query, page = 1) {
        if (this.isLoading) return;
        
        const cacheKey = `videos_${query}_${page}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            console.log('📦 Vídeos carregados do cache');
            return cached;
        }
        
        this.isLoading = true;
        this.currentQuery = query;
        this.currentPage = page;

        try {
            console.log('🎬 Buscando vídeos no Pexels...');
            const response = await fetch(
                `${this.baseURL}/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${this.perPage}`,
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
            this.isLoading = false;
            
            const result = {
                videos: data.videos,
                total: data.total_results,
                totalPages: Math.ceil(data.total_results / this.perPage)
            };

            // Salvar no cache
            this.setCachedData(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error('❌ Erro ao buscar vídeos do Pexels:', error);
            this.isLoading = false;
            return { videos: [], total: 0, totalPages: 0 };
        }
    }

    async getPopularPhotos(page = 1) {
        const cacheKey = `popular_photos_${page}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            console.log('📦 Fotos populares carregadas do cache');
            return cached;
        }

        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage = page;

        try {
            console.log('⭐ Buscando fotos populares...');
            const response = await fetch(
                `${this.baseURL}/curated?page=${page}&per_page=${this.perPage}`,
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
            this.isLoading = false;
            
            const result = {
                photos: data.photos,
                total: data.total_results,
                totalPages: Math.ceil(data.total_results / this.perPage)
            };

            // Salvar no cache
            this.setCachedData(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error('❌ Erro ao buscar fotos populares:', error);
            this.isLoading = false;
            return { photos: [], total: 0, totalPages: 0 };
        }
    }

    async getPopularVideos(page = 1) {
        const cacheKey = `popular_videos_${page}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            console.log('📦 Vídeos populares carregados do cache');
            return cached;
        }

        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage = page;

        try {
            console.log('⭐ Buscando vídeos populares...');
            const response = await fetch(
                `${this.baseURL}/videos/popular?page=${page}&per_page=${this.perPage}`,
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
            this.isLoading = false;
            
            const result = {
                videos: data.videos,
                total: data.total_results,
                totalPages: Math.ceil(data.total_results / this.perPage)
            };

            // Salvar no cache
            this.setCachedData(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error('❌ Erro ao buscar vídeos populares:', error);
            this.isLoading = false;
            return { videos: [], total: 0, totalPages: 0 };
        }
    }

    // Otimizar URLs de vídeo para carregamento mais rápido
    optimizeVideoUrl(video, quality = 'medium') {
        const videoFiles = video.video_files || [];
        
        // Priorizar vídeos menores e mais rápidos
        const qualityOrder = ['small', 'medium', 'large', 'hd'];
        let selectedQuality = quality;
        
        if (!qualityOrder.includes(quality)) {
            selectedQuality = 'medium';
        }
        
        // Encontrar o melhor vídeo baseado na qualidade
        let bestVideo = videoFiles.find(file => file.quality === selectedQuality);
        
        if (!bestVideo) {
            // Fallback para o menor vídeo disponível
            bestVideo = videoFiles.sort((a, b) => a.width - b.width)[0];
        }
        
        if (!bestVideo) {
            return video.video_files[0]?.link || '';
        }
        
        return bestVideo.link;
    }

    // Lazy loading para vídeos
    createLazyVideoElement(video, container) {
        const videoElement = document.createElement('video');
        videoElement.className = 'w-full h-48 object-cover rounded-lg';
        videoElement.controls = true;
        videoElement.preload = 'none'; // Não carregar automaticamente
        videoElement.poster = video.image; // Thumbnail como poster
        
        // Carregar vídeo apenas quando visível
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    videoElement.src = this.optimizeVideoUrl(video);
                    videoElement.load();
                    observer.unobserve(videoElement);
                }
            });
        });
        
        observer.observe(videoElement);
        container.appendChild(videoElement);
        
        return videoElement;
    }

    // Limpar cache
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache limpo');
    }

    // Obter estatísticas do cache
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Exportar para uso global
window.PexelsOptimizedManager = PexelsOptimizedManager;
