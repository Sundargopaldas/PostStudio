// Google Fonts Manager
class FontsManager {
    constructor() {
        this.googleFonts = [];
        this.loadedFonts = new Set();
        this.apiKey = 'AIzaSyAJbt3T_JmzzAmtDsMYKA6_FtH6XZWfsuo';
        this.loadGoogleFonts();
    }

    async loadGoogleFonts() {
        try {
            const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${this.apiKey}&sort=popularity`);
            const data = await response.json();
            this.googleFonts = data.items.slice(0, 100); // Primeiras 100 fontes mais populares
            console.log('✅ Google Fonts carregadas:', this.googleFonts.length);
        } catch (error) {
            console.error('❌ Erro ao carregar Google Fonts:', error);
            // Fallback para fontes básicas
            this.googleFonts = [
                { family: 'Inter', category: 'sans-serif' },
                { family: 'Poppins', category: 'sans-serif' },
                { family: 'Montserrat', category: 'sans-serif' },
                { family: 'Playfair Display', category: 'serif' },
                { family: 'Roboto', category: 'sans-serif' }
            ];
        }
    }

    getFontsByCategory(category) {
        return this.googleFonts.filter(font => font.category === category);
    }

    getPopularFonts(limit = 20) {
        return this.googleFonts.slice(0, limit);
    }

    searchFonts(query) {
        return this.googleFonts.filter(font => 
            font.family.toLowerCase().includes(query.toLowerCase())
        );
    }

    loadFont(fontFamily) {
        if (this.loadedFonts.has(fontFamily)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
            link.rel = 'stylesheet';
            
            link.onload = () => {
                this.loadedFonts.add(fontFamily);
                console.log('✅ Fonte carregada:', fontFamily);
                resolve();
            };
            
            link.onerror = () => {
                console.error('❌ Erro ao carregar fonte:', fontFamily);
                reject();
            };
            
            document.head.appendChild(link);
        });
    }

    async loadMultipleFonts(fontFamilies) {
        const promises = fontFamilies.map(font => this.loadFont(font));
        return Promise.all(promises);
    }

    getFontPreview(fontFamily, text = 'Aa') {
        return `
            <div class="font-preview" style="font-family: '${fontFamily}', sans-serif;">
                <div class="text-2xl font-bold">${text}</div>
                <div class="text-sm opacity-70">${fontFamily}</div>
            </div>
        `;
    }

    createFontSelector(containerId, onSelect) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="font-selector">
                <div class="mb-4">
                    <input type="text" id="font-search" placeholder="Buscar fontes..." 
                           class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30">
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto" id="font-list">
                    <!-- Fonts will be loaded here -->
                </div>
            </div>
        `;

        this.renderFontList();
        this.setupSearch();
    }

    renderFontList(fonts = null) {
        const fontList = document.getElementById('font-list');
        if (!fontList) return;

        const fontsToShow = fonts || this.getPopularFonts(20);
        
        fontList.innerHTML = fontsToShow.map(font => `
            <div class="font-option p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" 
                 data-font="${font.family}" onclick="selectFont('${font.family}')">
                <div class="font-preview text-white" style="font-family: '${font.family}', sans-serif;">
                    <div class="text-lg font-medium">${font.family}</div>
                    <div class="text-sm opacity-70">${font.category}</div>
                </div>
            </div>
        `).join('');

        // Load fonts as they become visible
        this.setupIntersectionObserver();
    }

    setupSearch() {
        const searchInput = document.getElementById('font-search');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value;
                if (query.length > 2) {
                    const filteredFonts = this.searchFonts(query);
                    this.renderFontList(filteredFonts);
                } else if (query.length === 0) {
                    this.renderFontList();
                }
            }, 300);
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fontFamily = entry.target.dataset.font;
                    if (fontFamily) {
                        this.loadFont(fontFamily);
                    }
                }
            });
        });

        document.querySelectorAll('.font-option').forEach(option => {
            observer.observe(option);
        });
    }
}

// Global function for font selection
function selectFont(fontFamily) {
    // Remove previous selection
    document.querySelectorAll('.font-option').forEach(option => {
        option.classList.remove('bg-white/20', 'border-white/30');
        option.classList.add('bg-white/5');
    });

    // Add selection to clicked option
    const selectedOption = document.querySelector(`[data-font="${fontFamily}"]`);
    if (selectedOption) {
        selectedOption.classList.remove('bg-white/5');
        selectedOption.classList.add('bg-white/20', 'border-white/30');
    }

    // Load font if not already loaded
    if (window.fontsManager) {
        window.fontsManager.loadFont(fontFamily).then(() => {
            // Apply font to preview
            applyFontToPreview(fontFamily);
        });
    }
}

function applyFontToPreview(fontFamily) {
    // Apply font to preview elements
    const previewElements = document.querySelectorAll('.font-preview, .preview-title, .preview-text');
    previewElements.forEach(element => {
        element.style.fontFamily = `'${fontFamily}', sans-serif`;
    });

    // Store selected font
    window.selectedFont = fontFamily;
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('fontSelected', { 
        detail: { fontFamily } 
    }));
}

// Initialize fonts manager
document.addEventListener('DOMContentLoaded', function() {
    window.fontsManager = new FontsManager();
    
    // Wait for fonts to load
    setTimeout(() => {
        if (window.fontsManager.googleFonts.length > 0) {
            console.log('✅ Fonts Manager inicializado com', window.fontsManager.googleFonts.length, 'fontes');
        }
    }, 1000);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FontsManager;
}
