// Text-to-Speech Manager with ElevenLabs Integration
class TextToSpeechManager {
    constructor() {
        this.apiKey = '7bddbf397d93ddfe06bcc5fa428d9cd418b046978ce65b7334b2313c9112e338'; // Nova chave ElevenLabs
        this.baseURL = 'https://api.elevenlabs.io/v1';
        this.voices = [];
        this.currentVoice = null;
        this.isPlaying = false;
        this.audioContext = null;
        
        this.loadVoices();
    }

    async loadVoices() {
        try {
            const response = await fetch(`${this.baseURL}/voices`, {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.voices = data.voices;
            console.log('✅ Vozes carregadas:', this.voices.length);
        } catch (error) {
            console.error('❌ Erro ao carregar vozes:', error);
            // Fallback voices
            this.voices = [
                { voice_id: 'default', name: 'Voz Padrão', category: 'general' },
                { voice_id: 'male', name: 'Voz Masculina', category: 'male' },
                { voice_id: 'female', name: 'Voz Feminina', category: 'female' }
            ];
        }
    }

    getVoicesByCategory(category) {
        return this.voices.filter(voice => voice.category === category);
    }

    getPopularVoices(limit = 10) {
        return this.voices.slice(0, limit);
    }

    async generateSpeech(text, voiceId = null, options = {}) {
        if (!text.trim()) {
            throw new Error('Texto não pode estar vazio');
        }

        const voice = voiceId || this.currentVoice?.voice_id || this.voices[0]?.voice_id;
        if (!voice) {
            throw new Error('Nenhuma voz disponível');
        }

        const requestBody = {
            text: text,
            model_id: options.model || 'eleven_monolingual_v1',
            voice_settings: {
                stability: options.stability || 0.5,
                similarity_boost: options.similarityBoost || 0.5,
                style: options.style || 0.0,
                use_speaker_boost: options.useSpeakerBoost || true
            }
        };

        try {
            const response = await fetch(`${this.baseURL}/text-to-speech/${voice}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const audioBlob = await response.blob();
            return audioBlob;
        } catch (error) {
            console.error('❌ Erro ao gerar fala:', error);
            throw error;
        }
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
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.isPlaying = false;
    }

    async speakText(text, voiceId = null, options = {}) {
        try {
            const audioBlob = await this.generateSpeech(text, voiceId, options);
            const audio = await this.playSpeech(audioBlob);
            return audio;
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
                <h3 class="text-white font-semibold mb-4">Text-to-Speech</h3>
                
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
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-white/80 text-sm font-medium mb-2">Estabilidade</label>
                        <input type="range" min="0" max="1" step="0.1" value="0.5" 
                               class="w-full" id="stability-slider">
                        <div class="text-white/60 text-xs mt-1">0.0 - 1.0</div>
                    </div>
                    <div>
                        <label class="block text-white/80 text-sm font-medium mb-2">Similaridade</label>
                        <input type="range" min="0" max="1" step="0.1" value="0.5" 
                               class="w-full" id="similarity-slider">
                        <div class="text-white/60 text-xs mt-1">0.0 - 1.0</div>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="playTTS()" 
                            class="flex-1 bg-white/20 text-white px-4 py-3 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center">
                        <i class="fas fa-play mr-2"></i>Falar
                    </button>
                    <button onclick="stopTTS()" 
                            class="flex-1 bg-red-500/20 text-red-300 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center">
                        <i class="fas fa-stop mr-2"></i>Parar
                    </button>
                    <button onclick="downloadTTS()" 
                            class="flex-1 bg-green-500/20 text-green-300 px-4 py-3 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center">
                        <i class="fas fa-download mr-2"></i>Baixar
                    </button>
                </div>
                
                <div class="mt-4">
                    <div class="text-white/60 text-sm">
                        <i class="fas fa-info-circle mr-1"></i>
                        Text-to-Speech disponível apenas no plano Premium
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
        
        this.voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.voice_id;
            option.textContent = voice.name;
            voiceSelect.appendChild(option);
        });
    }

    getCurrentSettings() {
        return {
            text: document.getElementById('tts-text')?.value || '',
            voice: document.getElementById('tts-voice')?.value || '',
            stability: parseFloat(document.getElementById('stability-slider')?.value || 0.5),
            similarity: parseFloat(document.getElementById('similarity-slider')?.value || 0.5)
        };
    }

    async generateAndDownload(text, voiceId, options = {}) {
        try {
            const audioBlob = await this.generateSpeech(text, voiceId, options);
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `speech-${Date.now()}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('❌ Erro ao baixar áudio:', error);
            throw error;
        }
    }
}

// Global functions for TTS interaction
let currentAudio = null;

function playTTS() {
    if (window.ttsManager) {
        const settings = window.ttsManager.getCurrentSettings();
        
        if (!settings.text.trim()) {
            showNotification('Digite um texto para converter em fala', 'error');
            return;
        }
        
        if (!settings.voice) {
            showNotification('Selecione uma voz', 'error');
            return;
        }
        
        const options = {
            stability: settings.stability,
            similarityBoost: settings.similarity
        };
        
        window.ttsManager.speakText(settings.text, settings.voice, options)
            .then(audio => {
                currentAudio = audio;
                showNotification('Reproduzindo áudio...', 'success');
            })
            .catch(error => {
                showNotification('Erro ao gerar fala: ' + error.message, 'error');
            });
    }
}

function stopTTS() {
    if (window.ttsManager) {
        window.ttsManager.stopSpeech();
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        showNotification('Áudio parado', 'info');
    }
}

function downloadTTS() {
    if (window.ttsManager) {
        const settings = window.ttsManager.getCurrentSettings();
        
        if (!settings.text.trim()) {
            showNotification('Digite um texto para converter em fala', 'error');
            return;
        }
        
        if (!settings.voice) {
            showNotification('Selecione uma voz', 'error');
            return;
        }
        
        const options = {
            stability: settings.stability,
            similarityBoost: settings.similarity
        };
        
        window.ttsManager.generateAndDownload(settings.text, settings.voice, options)
            .then(() => {
                showNotification('Áudio baixado com sucesso!', 'success');
            })
            .catch(error => {
                showNotification('Erro ao baixar áudio: ' + error.message, 'error');
            });
    }
}

// Initialize TTS manager
document.addEventListener('DOMContentLoaded', function() {
    window.ttsManager = new TextToSpeechManager();
    console.log('✅ Text-to-Speech Manager inicializado');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextToSpeechManager;
}
