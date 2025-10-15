// Text-to-Speech Alternative - Gratuito e Confiável
class AlternativeTTSManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.isPlaying = false;
        this.audioContext = null;
        
        this.loadVoices();
    }

    async loadVoices() {
        try {
            // Carregar vozes disponíveis
            this.voices = this.synthesis.getVoices();
            
            // Se não há vozes ainda, aguardar o evento
            if (this.voices.length === 0) {
                this.synthesis.onvoiceschanged = () => {
                    this.voices = this.synthesis.getVoices();
                    console.log('✅ Vozes carregadas:', this.voices.length);
                };
            } else {
                console.log('✅ Vozes carregadas:', this.voices.length);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar vozes:', error);
            // Fallback voices
            this.voices = [
                { name: 'Voz Padrão', lang: 'pt-BR', default: true },
                { name: 'Voz Masculina', lang: 'pt-BR', gender: 'male' },
                { name: 'Voz Feminina', lang: 'pt-BR', gender: 'female' }
            ];
        }
    }

    getVoicesByLanguage(lang = 'pt-BR') {
        return this.voices.filter(voice => voice.lang.startsWith(lang));
    }

    getPopularVoices(limit = 10) {
        return this.voices.slice(0, limit);
    }

    async generateSpeech(text, voiceId = null, options = {}) {
        if (!text.trim()) {
            throw new Error('Texto não pode estar vazio');
        }

        return new Promise((resolve, reject) => {
            try {
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Configurar voz
                if (voiceId) {
                    const voice = this.voices.find(v => v.name === voiceId || v.voiceURI === voiceId);
                    if (voice) {
                        utterance.voice = voice;
                    }
                } else if (this.currentVoice) {
                    utterance.voice = this.currentVoice;
                }

                // Configurar opções
                utterance.rate = options.rate || 1.0;
                utterance.pitch = options.pitch || 1.0;
                utterance.volume = options.volume || 1.0;
                utterance.lang = options.lang || 'pt-BR';

                // Eventos
                utterance.onstart = () => {
                    this.isPlaying = true;
                    console.log('🎵 Iniciando reprodução...');
                };

                utterance.onend = () => {
                    this.isPlaying = false;
                    console.log('✅ Reprodução finalizada');
                    resolve(true);
                };

                utterance.onerror = (error) => {
                    this.isPlaying = false;
                    console.error('❌ Erro na reprodução:', error);
                    reject(error);
                };

                // Iniciar reprodução
                this.synthesis.speak(utterance);

            } catch (error) {
                console.error('❌ Erro ao gerar fala:', error);
                reject(error);
            }
        });
    }

    async playSpeech(audioBlob) {
        if (this.isPlaying) {
            this.stopSpeech();
        }

        try {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                this.isPlaying = false;
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = (error) => {
                console.error('❌ Erro ao reproduzir áudio:', error);
                this.isPlaying = false;
                URL.revokeObjectURL(audioUrl);
            };

            await audio.play();
            this.isPlaying = true;
            
            return audio;
        } catch (error) {
            console.error('❌ Erro ao reproduzir áudio:', error);
            this.isPlaying = false;
            throw error;
        }
    }

    stopSpeech() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        this.isPlaying = false;
    }

    async speakText(text, voiceId = null, options = {}) {
        try {
            await this.generateSpeech(text, voiceId, options);
            return true;
        } catch (error) {
            console.error('❌ Erro ao falar texto:', error);
            throw error;
        }
    }

    createVoiceSelector(containerId, onVoiceSelect) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="tts-selector">
                <h3 class="text-white font-semibold mb-4">Text-to-Speech (Gratuito)</h3>
                
                <div class="mb-4">
                    <label class="block text-white/80 text-sm font-medium mb-2">Texto para falar</label>
                    <textarea id="tts-text" rows="3" placeholder="Digite o texto que você quer converter em fala..." 
                              class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none"></textarea>
                </div>
                
                <div class="mb-4">
                    <label class="block text-white/80 text-sm font-medium mb-2">Voz</label>
                    <select id="tts-voice" class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent">
                        <option value="">Carregando vozes...</option>
                    </select>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-white/80 text-sm font-medium mb-2">Velocidade</label>
                        <input type="range" min="0.5" max="2" step="0.1" value="1.0" 
                               class="w-full" id="rate-slider">
                        <div class="text-white/60 text-xs mt-1">0.5x - 2.0x</div>
                    </div>
                    <div>
                        <label class="block text-white/80 text-sm font-medium mb-2">Tom</label>
                        <input type="range" min="0" max="2" step="0.1" value="1.0" 
                               class="w-full" id="pitch-slider">
                        <div class="text-white/60 text-xs mt-1">0.0 - 2.0</div>
                    </div>
                    <div>
                        <label class="block text-white/80 text-sm font-medium mb-2">Volume</label>
                        <input type="range" min="0" max="1" step="0.1" value="1.0" 
                               class="w-full" id="volume-slider">
                        <div class="text-white/60 text-xs mt-1">0.0 - 1.0</div>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="playAlternativeTTS()" 
                            class="flex-1 bg-white/20 text-white px-4 py-3 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center">
                        <i class="fas fa-play mr-2"></i>Falar
                    </button>
                    <button onclick="stopAlternativeTTS()" 
                            class="flex-1 bg-red-500/20 text-red-300 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center">
                        <i class="fas fa-stop mr-2"></i>Parar
                    </button>
                </div>
                
                <div class="mt-4">
                    <div class="text-white/60 text-sm">
                        <i class="fas fa-info-circle mr-1"></i>
                        Text-to-Speech gratuito usando Web Speech API
                    </div>
                </div>
            </div>
        `;

        this.populateVoiceSelector();
        this.onVoiceSelect = onVoiceSelect;
    }

    populateVoiceSelector() {
        const voiceSelect = document.getElementById('tts-voice');
        if (!voiceSelect) return;

        voiceSelect.innerHTML = '<option value="">Selecione uma voz...</option>';
        
        // Filtrar vozes em português
        const portugueseVoices = this.voices.filter(voice => 
            voice.lang.startsWith('pt') || voice.lang.includes('pt')
        );
        
        if (portugueseVoices.length > 0) {
            portugueseVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            });
        } else {
            // Fallback para todas as vozes
            this.voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            });
        }
    }

    getCurrentSettings() {
        return {
            text: document.getElementById('tts-text')?.value || '',
            voice: document.getElementById('tts-voice')?.value || '',
            rate: parseFloat(document.getElementById('rate-slider')?.value || 1.0),
            pitch: parseFloat(document.getElementById('pitch-slider')?.value || 1.0),
            volume: parseFloat(document.getElementById('volume-slider')?.value || 1.0)
        };
    }
}

// Global functions for TTS interaction
let currentAlternativeAudio = null;

function playAlternativeTTS() {
    if (window.alternativeTTSManager) {
        const settings = window.alternativeTTSManager.getCurrentSettings();
        
        if (!settings.text.trim()) {
            showNotification('Digite um texto para converter em fala', 'error');
            return;
        }
        
        const options = {
            rate: settings.rate,
            pitch: settings.pitch,
            volume: settings.volume,
            lang: 'pt-BR'
        };
        
        window.alternativeTTSManager.speakText(settings.text, settings.voice, options)
            .then(() => {
                showNotification('Reproduzindo áudio...', 'success');
            })
            .catch(error => {
                showNotification('Erro ao gerar fala: ' + error.message, 'error');
            });
    }
}

function stopAlternativeTTS() {
    if (window.alternativeTTSManager) {
        window.alternativeTTSManager.stopSpeech();
        if (currentAlternativeAudio) {
            currentAlternativeAudio.pause();
            currentAlternativeAudio = null;
        }
        showNotification('Áudio parado', 'info');
    }
}

// Initialize Alternative TTS manager
document.addEventListener('DOMContentLoaded', function() {
    window.alternativeTTSManager = new AlternativeTTSManager();
    console.log('✅ Alternative Text-to-Speech Manager inicializado');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlternativeTTSManager;
}
