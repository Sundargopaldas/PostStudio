// Image Filters Manager
class ImageFiltersManager {
    constructor() {
        this.filters = {
            // Instagram-like filters
            'normal': { filter: 'none' },
            'clarendon': { filter: 'contrast(1.2) saturate(1.1) brightness(1.1)' },
            'gingham': { filter: 'contrast(0.9) saturate(0.8) brightness(1.1)' },
            'juno': { filter: 'contrast(1.1) saturate(1.2) brightness(0.9)' },
            'lark': { filter: 'contrast(1.1) saturate(1.1) brightness(1.05)' },
            'reyes': { filter: 'contrast(0.9) saturate(0.8) brightness(1.1) sepia(0.1)' },
            'slumber': { filter: 'contrast(0.9) saturate(0.8) brightness(0.9) sepia(0.2)' },
            'crema': { filter: 'contrast(1.1) saturate(0.9) brightness(1.05) sepia(0.1)' },
            'ludwig': { filter: 'contrast(1.1) saturate(1.1) brightness(0.95)' },
            'aden': { filter: 'contrast(0.9) saturate(0.8) brightness(1.1) sepia(0.1)' },
            'perpetua': { filter: 'contrast(1.1) saturate(1.1) brightness(1.05) sepia(0.1)' },
            'amaro': { filter: 'contrast(1.1) saturate(1.2) brightness(1.05) sepia(0.1)' },
            'mayfair': { filter: 'contrast(1.1) saturate(1.1) brightness(1.1) sepia(0.1)' },
            'rise': { filter: 'contrast(0.9) saturate(0.8) brightness(1.1) sepia(0.2)' },
            'valencia': { filter: 'contrast(1.1) saturate(1.1) brightness(1.1) sepia(0.1)' },
            'xpro2': { filter: 'contrast(1.1) saturate(1.2) brightness(0.9) sepia(0.2)' },
            'sierra': { filter: 'contrast(0.9) saturate(0.8) brightness(1.1) sepia(0.2)' },
            'willow': { filter: 'contrast(0.9) saturate(0.8) brightness(1.1) sepia(0.3)' },
            'lo-fi': { filter: 'contrast(1.2) saturate(1.1) brightness(0.9) sepia(0.2)' },
            'inkwell': { filter: 'contrast(1.1) saturate(0) brightness(0.9) sepia(1)' },
            'hefe': { filter: 'contrast(1.2) saturate(1.2) brightness(0.9) sepia(0.1)' },
            'nashville': { filter: 'contrast(0.9) saturate(0.8) brightness(1.1) sepia(0.2)' },
            'stinson': { filter: 'contrast(0.9) saturate(0.8) brightness(1.1) sepia(0.1)' },
            'vesper': { filter: 'contrast(1.1) saturate(1.1) brightness(1.05) sepia(0.1)' },
            'earlybird': { filter: 'contrast(0.9) saturate(0.8) brightness(1.1) sepia(0.3)' },
            'brannan': { filter: 'contrast(1.1) saturate(1.1) brightness(0.9) sepia(0.2)' },
            'sutro': { filter: 'contrast(0.9) saturate(0.8) brightness(0.9) sepia(0.2)' },
            'toaster': { filter: 'contrast(1.2) saturate(0.8) brightness(0.9) sepia(0.2)' },
            'walden': { filter: 'contrast(1.1) saturate(1.2) brightness(1.1) sepia(0.1)' },
            '1977': { filter: 'contrast(1.1) saturate(1.2) brightness(1.1) sepia(0.2)' },
            'brooklyn': { filter: 'contrast(1.1) saturate(1.1) brightness(1.05) sepia(0.1)' }
        };
        
        this.currentFilter = 'normal';
        this.adjustments = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            hue: 0,
            blur: 0,
            sepia: 0
        };
    }

    getFilterList() {
        return Object.keys(this.filters).map(key => ({
            name: key,
            displayName: this.formatFilterName(key),
            filter: this.filters[key].filter
        }));
    }

    formatFilterName(filterName) {
        return filterName.charAt(0).toUpperCase() + filterName.slice(1).replace(/([A-Z])/g, ' $1');
    }

    applyFilter(imageElement, filterName) {
        if (!imageElement) return;
        
        this.currentFilter = filterName;
        const filter = this.filters[filterName];
        
        if (filter) {
            imageElement.style.filter = filter.filter;
        }
    }

    applyCustomAdjustments(imageElement, adjustments) {
        if (!imageElement) return;
        
        this.adjustments = { ...this.adjustments, ...adjustments };
        
        const filterString = this.buildFilterString(adjustments);
        imageElement.style.filter = filterString;
    }

    buildFilterString(adjustments) {
        const { brightness, contrast, saturate, hue, blur, sepia } = adjustments;
        
        return [
            `brightness(${brightness}%)`,
            `contrast(${contrast}%)`,
            `saturate(${saturate}%)`,
            `hue-rotate(${hue}deg)`,
            `blur(${blur}px)`,
            `sepia(${sepia}%)`
        ].join(' ');
    }

    resetFilters(imageElement) {
        if (!imageElement) return;
        
        this.currentFilter = 'normal';
        this.adjustments = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            hue: 0,
            blur: 0,
            sepia: 0
        };
        
        imageElement.style.filter = 'none';
    }

    createFilterSelector(containerId, onFilterSelect) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="filter-selector">
                <h3 class="text-white font-semibold mb-4">Filtros</h3>
                <div class="grid grid-cols-4 md:grid-cols-6 gap-2 mb-6" id="filter-grid">
                    ${this.getFilterList().map(filter => `
                        <div class="filter-option p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-center" 
                             data-filter="${filter.name}" onclick="selectFilter('${filter.name}')">
                            <div class="text-xs text-white/80">${filter.displayName}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="adjustments-panel">
                    <h4 class="text-white font-medium mb-4">Ajustes Manuais</h4>
                    <div class="space-y-4">
                        <div class="adjustment-item">
                            <label class="text-white/80 text-sm">Brilho</label>
                            <input type="range" min="0" max="200" value="100" 
                                   class="w-full" id="brightness-slider" 
                                   onchange="adjustImage('brightness', this.value)">
                        </div>
                        <div class="adjustment-item">
                            <label class="text-white/80 text-sm">Contraste</label>
                            <input type="range" min="0" max="200" value="100" 
                                   class="w-full" id="contrast-slider" 
                                   onchange="adjustImage('contrast', this.value)">
                        </div>
                        <div class="adjustment-item">
                            <label class="text-white/80 text-sm">Saturação</label>
                            <input type="range" min="0" max="200" value="100" 
                                   class="w-full" id="saturate-slider" 
                                   onchange="adjustImage('saturate', this.value)">
                        </div>
                        <div class="adjustment-item">
                            <label class="text-white/80 text-sm">Matiz</label>
                            <input type="range" min="0" max="360" value="0" 
                                   class="w-full" id="hue-slider" 
                                   onchange="adjustImage('hue', this.value)">
                        </div>
                        <div class="adjustment-item">
                            <label class="text-white/80 text-sm">Desfoque</label>
                            <input type="range" min="0" max="10" value="0" 
                                   class="w-full" id="blur-slider" 
                                   onchange="adjustImage('blur', this.value)">
                        </div>
                        <div class="adjustment-item">
                            <label class="text-white/80 text-sm">Sépia</label>
                            <input type="range" min="0" max="100" value="0" 
                                   class="w-full" id="sepia-slider" 
                                   onchange="adjustImage('sepia', this.value)">
                        </div>
                    </div>
                    
                    <div class="flex space-x-2 mt-4">
                        <button onclick="resetImageFilters()" 
                                class="flex-1 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                            Resetar
                        </button>
                        <button onclick="saveImageFilters()" 
                                class="flex-1 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Store callback
        this.onFilterSelect = onFilterSelect;
    }

    getCurrentFilter() {
        return {
            name: this.currentFilter,
            adjustments: this.adjustments
        };
    }

    saveFilterSettings() {
        const settings = {
            filter: this.currentFilter,
            adjustments: this.adjustments
        };
        
        localStorage.setItem('imageFilterSettings', JSON.stringify(settings));
        return settings;
    }

    loadFilterSettings() {
        const saved = localStorage.getItem('imageFilterSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.currentFilter = settings.filter;
            this.adjustments = settings.adjustments;
            return settings;
        }
        return null;
    }
}

// Global functions for filter interaction
function selectFilter(filterName) {
    if (window.imageFiltersManager) {
        const imageElement = document.querySelector('.image-preview img, .preview-image');
        if (imageElement) {
            window.imageFiltersManager.applyFilter(imageElement, filterName);
        }
        
        // Update UI
        document.querySelectorAll('.filter-option').forEach(option => {
            option.classList.remove('bg-white/20', 'border-white/30');
            option.classList.add('bg-white/5');
        });
        
        const selectedOption = document.querySelector(`[data-filter="${filterName}"]`);
        if (selectedOption) {
            selectedOption.classList.remove('bg-white/5');
            selectedOption.classList.add('bg-white/20', 'border-white/30');
        }
        
        // Trigger callback
        if (window.imageFiltersManager.onFilterSelect) {
            window.imageFiltersManager.onFilterSelect(filterName);
        }
    }
}

function adjustImage(property, value) {
    if (window.imageFiltersManager) {
        const imageElement = document.querySelector('.image-preview img, .preview-image');
        if (imageElement) {
            const adjustments = { [property]: parseInt(value) };
            window.imageFiltersManager.applyCustomAdjustments(imageElement, adjustments);
        }
    }
}

function resetImageFilters() {
    if (window.imageFiltersManager) {
        const imageElement = document.querySelector('.image-preview img, .preview-image');
        if (imageElement) {
            window.imageFiltersManager.resetFilters(imageElement);
        }
        
        // Reset sliders
        document.getElementById('brightness-slider').value = 100;
        document.getElementById('contrast-slider').value = 100;
        document.getElementById('saturate-slider').value = 100;
        document.getElementById('hue-slider').value = 0;
        document.getElementById('blur-slider').value = 0;
        document.getElementById('sepia-slider').value = 0;
    }
}

function saveImageFilters() {
    if (window.imageFiltersManager) {
        const settings = window.imageFiltersManager.saveFilterSettings();
        showNotification('Filtros salvos com sucesso!', 'success');
        return settings;
    }
}

// Initialize filters manager
document.addEventListener('DOMContentLoaded', function() {
    window.imageFiltersManager = new ImageFiltersManager();
    console.log('✅ Image Filters Manager inicializado');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageFiltersManager;
}
