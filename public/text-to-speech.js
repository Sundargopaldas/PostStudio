// Text-to-Speech Manager with ElevenLabs Integration
class TextToSpeechManager {
    constructor() {
        this.apiKey = 'sk_83361992bc2f7a4177040a338cad9964ce3bd9dd53d480e4'; // Nova chave ElevenLabs
        this.baseURL = 'https://api.elevenlabs.io/v1';
        this.voices = [];
        this.currentVoice = null;
        this.isPlaying = false;
        this.audioContext = null;
        
        this.loadVoices();
    }

    async loadVoices() {
        try {
            console.log('🔄 Carregando vozes da ElevenLabs...');
            console.log('🔑 Usando chave:', this.apiKey.substring(0, 10) + '...');
            
            const response = await fetch(`${this.baseURL}/voices`, {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });
            
            console.log('📡 Resposta da API:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro da API:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Dados recebidos:', data);
            
            const allVoices = data.voices || [];
            console.log('📊 Total de vozes da API:', allVoices.length);
            
            // Manter todas as vozes da ElevenLabs + adicionar vozes em português
            this.voices = this.addPortugueseVoices(allVoices);
            console.log('🎤 Total de vozes (ElevenLabs + Português):', this.voices.length);
            
            // Log das primeiras vozes para debug
            if (this.voices.length > 0) {
                console.log('🎤 Primeiras vozes (ElevenLabs):', this.voices.slice(0, 3).map(v => ({ name: v.name, category: v.category })));
                console.log('🇧🇷 Vozes em português:', this.voices.filter(v => v.voice_id.startsWith('pt-br-')).map(v => v.name));
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar vozes:', error);
            // Fallback voices em português
            this.voices = [
                { voice_id: 'pt-br-female-1', name: 'Ana (Feminina)', category: 'portuguese', gender: 'female', language: 'pt-BR' },
                { voice_id: 'pt-br-male-1', name: 'João (Masculina)', category: 'portuguese', gender: 'male', language: 'pt-BR' },
                { voice_id: 'pt-br-neutral-1', name: 'Alex (Neutra)', category: 'portuguese', gender: 'neutral', language: 'pt-BR' }
            ];
            console.log('🔄 Usando vozes de fallback em português:', this.voices.length);
        }
    }

    addPortugueseVoices(apiVoices) {
        // Vozes simuladas em português do Brasil (extras)
        const portugueseVoices = [
            { voice_id: 'pt-br-female-1', name: '🇧🇷 Ana (Feminina)', category: 'portuguese', gender: 'female', language: 'pt-BR' },
            { voice_id: 'pt-br-female-2', name: '🇧🇷 Maria (Feminina)', category: 'portuguese', gender: 'female', language: 'pt-BR' },
            { voice_id: 'pt-br-female-3', name: '🇧🇷 Sofia (Feminina)', category: 'portuguese', gender: 'female', language: 'pt-BR' },
            { voice_id: 'pt-br-male-1', name: '🇧🇷 João (Masculina)', category: 'portuguese', gender: 'male', language: 'pt-BR' },
            { voice_id: 'pt-br-male-2', name: '🇧🇷 Carlos (Masculina)', category: 'portuguese', gender: 'male', language: 'pt-BR' },
            { voice_id: 'pt-br-male-3', name: '🇧🇷 Pedro (Masculina)', category: 'portuguese', gender: 'male', language: 'pt-BR' },
            { voice_id: 'pt-br-neutral-1', name: '🇧🇷 Alex (Neutra)', category: 'portuguese', gender: 'neutral', language: 'pt-BR' },
            { voice_id: 'pt-br-neutral-2', name: '🇧🇷 Sam (Neutra)', category: 'portuguese', gender: 'neutral', language: 'pt-BR' }
        ];
        
        // Suas vozes específicas ElevenLabs
        const userSpecificVoices = [
            { voice_id: 'ohZOfA9iwlZ5nOsoY7LB', name: '🎤 Sua Voz 1', category: 'user', gender: 'unknown', language: 'multilingual' },
            { voice_id: 'oJebhZNaPllxk6W0LSBA', name: '🎤 Sua Voz 2', category: 'user', gender: 'unknown', language: 'multilingual' },
            { voice_id: 'liAlPCvGDJ0qsfPupueo', name: '🎤 Sua Voz 3', category: 'user', gender: 'unknown', language: 'multilingual' }
        ];
        
        console.log('🎤 Vozes originais da ElevenLabs:', apiVoices.length);
        console.log('🇧🇷 Vozes extras em português:', portugueseVoices.length);
        console.log('🎤 Suas vozes específicas:', userSpecificVoices.length);
        
        // Mostrar APENAS as suas 3 vozes específicas
        const allVoices = [...userSpecificVoices];
        
        console.log('🎤 Total de vozes disponíveis:', allVoices.length);
        
        return allVoices;
    }

    async generatePortugueseSpeech(text, voiceId, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                console.log('🎤 Gerando fala em português...');
                
                // Parar fala anterior se existir
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }
                
                // Criar utterance
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Configurar voz em português
                const voices = window.speechSynthesis.getVoices();
                const portugueseVoice = voices.find(v => 
                    v.lang.startsWith('pt') || 
                    v.name.toLowerCase().includes('portuguese') ||
                    v.name.toLowerCase().includes('brazil')
                ) || voices[0];
                
                if (portugueseVoice) {
                    utterance.voice = portugueseVoice;
                    console.log('🇧🇷 Usando voz:', portugueseVoice.name);
                }
                
                // Configurar opções
                utterance.rate = options.speed || 1.0;
                utterance.pitch = options.pitch || 1.0;
                utterance.volume = options.volume || 0.8;
                utterance.lang = 'pt-BR';
                
                // Eventos
                utterance.onstart = () => {
                    console.log('▶️ Fala em português iniciada');
                    this.isPlaying = true;
                };
                
                utterance.onend = () => {
                    console.log('🏁 Fala em português finalizada');
                    this.isPlaying = false;
                    resolve('Fala em português concluída');
                };
                
                utterance.onerror = (error) => {
                    console.error('❌ Erro na fala em português:', error);
                    this.isPlaying = false;
                    reject(error);
                };
                
                // Iniciar fala
                window.speechSynthesis.speak(utterance);
                
                // Simular blob de áudio para compatibilidade
                setTimeout(() => {
                    const mockBlob = new Blob(['audio-data-pt-br'], { type: 'audio/wav' });
                    resolve(mockBlob);
                }, 100);
                
            } catch (error) {
                console.error('❌ Erro ao gerar fala em português:', error);
                reject(error);
            }
        });
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

        // Verificar se é uma voz simulada em português
        if (voice.startsWith('pt-br-')) {
            console.log('🇧🇷 Usando TTS local em português...');
            return this.generatePortugueseSpeech(text, voice, options);
        }
        
        console.log('🎤 Gerando áudio com ElevenLabs API...');
        console.log('🔑 Voz selecionada:', voice);
        console.log('📝 Texto:', text);

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
            console.log('🔄 Enviando requisição para ElevenLabs...');
            console.log('📝 Texto:', text);
            console.log('🎤 Voz:', voice);
            console.log('⚙️ Opções:', options);
            
            const response = await fetch(`${this.baseURL}/text-to-speech/${voice}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📡 Resposta da API:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro da API:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const audioBlob = await response.blob();
            console.log('✅ Áudio gerado:', audioBlob.size, 'bytes');
            console.log('🎵 Tipo do áudio:', audioBlob.type);
            
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
            console.log('🎵 Criando URL do áudio...');
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log('🔗 URL criada:', audioUrl);
            
            const audio = new Audio(audioUrl);
            console.log('🎧 Elemento de áudio criado');
            
            // Aguardar o áudio estar pronto
            return new Promise((resolve, reject) => {
                let isResolved = false;
                
                audio.addEventListener('canplaythrough', async () => {
                    if (isResolved) return;
                    isResolved = true;
                    
                    try {
                        console.log('▶️ Iniciando reprodução...');
                        await audio.play();
                        this.isPlaying = true;
                        console.log('✅ Áudio reproduzindo com sucesso');
                        resolve(audio);
                    } catch (playError) {
                        console.error('❌ Erro ao iniciar reprodução:', playError);
                        this.isPlaying = false;
                        URL.revokeObjectURL(audioUrl);
                        reject(playError);
                    }
                });

                audio.addEventListener('ended', () => {
                    console.log('🏁 Áudio finalizado');
                    this.isPlaying = false;
                    URL.revokeObjectURL(audioUrl);
                });

                audio.addEventListener('error', (error) => {
                    if (isResolved) return;
                    isResolved = true;
                    
                    console.error('❌ Erro no elemento de áudio:', error);
                    this.isPlaying = false;
                    URL.revokeObjectURL(audioUrl);
                    reject(error);
                });

                // Timeout para evitar travamento (apenas se não foi resolvido)
                setTimeout(() => {
                    if (!isResolved && !this.isPlaying) {
                        console.error('⏰ Timeout ao carregar áudio');
                        isResolved = true;
                        URL.revokeObjectURL(audioUrl);
                        reject(new Error('Timeout ao carregar áudio'));
                    }
                }, 10000);
            });
            
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
