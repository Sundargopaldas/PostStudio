// Pexels Integration Manager
class PexelsManager {
    constructor() {
        this.accessKey = 'f0djuVMOG9iW68zHOsbZmk2yt5ip7wbajvoPz10jMOhVDtg7yihzmRjJ';
        this.baseURL = 'https://api.pexels.com/v1';
        this.currentPage = 1;
        this.perPage = 20;
        this.currentQuery = '';
        this.isLoading = false;
    }

    async searchPhotos(query, page = 1) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentQuery = query;
        this.currentPage = page;

        try {
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
            
            return {
                photos: data.photos,
                total: data.total_results,
                totalPages: Math.ceil(data.total_results / this.perPage)
            };
        } catch (error) {
            console.error('❌ Erro ao buscar imagens do Pexels:', error);
            this.isLoading = false;
            return { photos: [], total: 0, totalPages: 0 };
        }
    }

    async getPopularPhotos(page = 1) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage = page;

        try {
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
            
            return {
                photos: data.photos,
                total: data.total_results,
                totalPages: Math.ceil(data.total_results / this.perPage)
            };
        } catch (error) {
            console.error('❌ Erro ao buscar fotos populares:', error);
            this.isLoading = false;
            return { photos: [], total: 0, totalPages: 0 };
        }
    }

    async getPhotosByCategory(category, page = 1) {
        const categories = {
            'nature': 'nature landscape',
            'people': 'portrait people',
            'architecture': 'architecture building',
            'food': 'food restaurant',
            'technology': 'technology computer',
            'business': 'business office',
            'travel': 'travel vacation',
            'abstract': 'abstract art',
            'minimal': 'minimal simple',
            'vintage': 'vintage retro'
        };

        const query = categories[category] || category;
        return await this.searchPhotos(query, page);
    }

    createImageCard(photo) {
        return `
            <div class="pexels-image-card bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all cursor-pointer group" 
                 data-photo-id="${photo.id}" onclick="selectPexelsImage('${photo.id}', '${photo.src.medium}', '${photo.alt || 'Pexels Image'}')">
                <div class="relative">
                    <img src="${photo.src.medium}" 
                         alt="${photo.alt || 'Pexels Image'}" 
                         class="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <i class="fas fa-plus text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl"></i>
                    </div>
                </div>
                <div class="p-3">
                    <div class="text-white text-sm font-medium truncate">${photo.alt || 'Imagem sem descrição'}</div>
                    <div class="text-white/60 text-xs mt-1">por ${photo.photographer}</div>
                </div>
            </div>
        `;
    }

    createImageSelector(containerId, onImageSelect) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="unsplash-selector">
                <div class="mb-4">
                    <div class="flex space-x-2 mb-4">
                        <input type="text" id="unsplash-search" placeholder="Buscar imagens..." 
                               class="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30">
                        <button onclick="searchUnsplashImages()" 
                                class="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        <button onclick="loadUnsplashCategory('popular')" 
                                class="category-btn px-3 py-1 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                            Populares
                        </button>
                        <button onclick="loadUnsplashCategory('nature')" 
                                class="category-btn px-3 py-1 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                            Natureza
                        </button>
                        <button onclick="loadUnsplashCategory('people')" 
                                class="category-btn px-3 py-1 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                            Pessoas
                        </button>
                        <button onclick="loadUnsplashCategory('architecture')" 
                                class="category-btn px-3 py-1 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                            Arquitetura
                        </button>
                        <button onclick="loadUnsplashCategory('food')" 
                                class="category-btn px-3 py-1 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                            Comida
                        </button>
                        <button onclick="loadUnsplashCategory('business')" 
                                class="category-btn px-3 py-1 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                            Negócios
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto" id="unsplash-grid">
                    <div class="col-span-full text-center text-white/60 py-8">
                        <i class="fas fa-images text-4xl mb-2"></i>
                        <p>Digite algo para buscar ou escolha uma categoria</p>
                    </div>
                </div>
                
                <div class="flex justify-center mt-4" id="unsplash-pagination" style="display: none;">
                    <button onclick="loadMoreUnsplashImages()" 
                            class="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-colors">
                        <i class="fas fa-plus mr-2"></i>Carregar Mais
                    </button>
                </div>
            </div>
        `;

        // Store callback
        this.onImageSelect = onImageSelect;
        
        // Setup search
        this.setupSearch();
    }

    setupSearch() {
        const searchInput = document.getElementById('unsplash-search');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value;
                if (query.length > 2) {
                    this.searchAndDisplay(query);
                }
            }, 500);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value;
                if (query.length > 0) {
                    this.searchAndDisplay(query);
                }
            }
        });
    }

    async searchAndDisplay(query) {
        const grid = document.getElementById('unsplash-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="col-span-full text-center text-white/60 py-8"><i class="fas fa-spinner fa-spin text-2xl"></i><p class="mt-2">Buscando imagens...</p></div>';

        const result = await this.searchPhotos(query);
        this.displayResults(result);
    }

    async loadCategoryAndDisplay(category) {
        const grid = document.getElementById('unsplash-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="col-span-full text-center text-white/60 py-8"><i class="fas fa-spinner fa-spin text-2xl"></i><p class="mt-2">Carregando imagens...</p></div>';

        const result = await this.getPhotosByCategory(category);
        this.displayResults(result);
    }

    displayResults(result) {
        const grid = document.getElementById('unsplash-grid');
        const pagination = document.getElementById('unsplash-pagination');
        
        if (!grid) return;

        if (result.photos.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-white/60 py-8"><i class="fas fa-search text-4xl mb-2"></i><p>Nenhuma imagem encontrada</p></div>';
            if (pagination) pagination.style.display = 'none';
            return;
        }

        grid.innerHTML = result.photos.map(photo => this.createImageCard(photo)).join('');
        
        if (result.totalPages > 1 && pagination) {
            pagination.style.display = 'flex';
        }
    }

    async loadMoreImages() {
        if (this.isLoading) return;

        const grid = document.getElementById('unsplash-grid');
        if (!grid) return;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'col-span-full text-center text-white/60 py-4';
        loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin text-xl"></i>';
        grid.appendChild(loadingDiv);

        let result;
        if (this.currentQuery) {
            result = await this.searchPhotos(this.currentQuery, this.currentPage + 1);
        } else {
            result = await this.getPopularPhotos(this.currentPage + 1);
        }

        loadingDiv.remove();
        
        if (result.photos.length > 0) {
            const newCards = result.photos.map(photo => this.createImageCard(photo)).join('');
            grid.insertAdjacentHTML('beforeend', newCards);
        }
    }
}

// Global functions for Pexels interaction
function searchPexelsImages() {
    const query = document.getElementById('pexels-search').value;
    if (query.trim()) {
        if (window.pexelsManager) {
            window.pexelsManager.searchAndDisplay(query);
        }
    }
}

function loadPexelsCategory(category) {
    if (window.pexelsManager) {
        window.pexelsManager.loadCategoryAndDisplay(category);
    }
    
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-white/20');
        btn.classList.add('bg-white/10');
    });
    
    event.target.classList.remove('bg-white/10');
    event.target.classList.add('bg-white/20');
}

function loadMorePexelsImages() {
    if (window.pexelsManager) {
        window.pexelsManager.loadMoreImages();
    }
}

function selectPexelsImage(photoId, imageUrl, description) {
    if (window.pexelsManager && window.pexelsManager.onImageSelect) {
        window.pexelsManager.onImageSelect({
            id: photoId,
            url: imageUrl,
            description: description,
            source: 'pexels'
        });
    }
    
    // Update UI to show selection
    document.querySelectorAll('.pexels-image-card').forEach(card => {
        card.classList.remove('ring-2', 'ring-white/50');
    });
    
    const selectedCard = document.querySelector(`[data-photo-id="${photoId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('ring-2', 'ring-white/50');
    }
}

// Initialize Pexels manager
document.addEventListener('DOMContentLoaded', function() {
    window.pexelsManager = new PexelsManager();
    console.log('✅ Pexels Manager inicializado');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PexelsManager;
}
