/**
 * ElevenLabs Narration Manager
 * Sistema isolado para gerenciar narração com ElevenLabs
 */

class ElevenLabsNarration {
    constructor() {
        this.apiKey = null;
        this.voices = [];
        this.isInitialized = false;
        this.currentAudio = null;
    }

    /**
     * Inicializar o sistema de narração
     */
    async initialize() {
        try {
            console.log('🎤 Inicializando ElevenLabs Narration...');
            
            // Verificar se a API key está disponível
            this.apiKey = await this.getApiKey();
            if (!this.apiKey) {
                throw new Error('API Key do ElevenLabs não encontrada');
            }

            // Carregar vozes disponíveis
            await this.loadVoices();
            
            this.isInitialized = true;
            console.log('✅ ElevenLabs Narration inicializado com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar ElevenLabs Narration:', error);
            return false;
        }
    }

    /**
     * Obter API key do ElevenLabs
     */
    async getApiKey() {
        try {
            // Tentar obter da configuração do usuário
            const response = await fetch('/api/user/settings');
            if (response.ok) {
                const settings = await response.json();
                return settings.elevenlabsApiKey;
            }
        } catch (error) {
            console.log('⚠️ Não foi possível obter API key do servidor');
        }

        // Fallback para API key padrão (chave funcional)
        return 'sk_83361992bc2f7a4177040a338cad9964ce3bd9dd53d480e4';
    }

    /**
     * Carregar vozes disponíveis
     */
    async loadVoices() {
        // SEMPRE usar vozes padrão para garantir funcionamento
        console.log('🎤 Carregando vozes padrão (modo offline)...');
        this.voices = this.getDefaultVoices();
        console.log(`✅ ${this.voices.length} vozes padrão carregadas`);
        
        // Tentar carregar do ElevenLabs em background (opcional)
        this.loadVoicesFromAPI();
    }
    
    async loadVoicesFromAPI() {
        try {
            console.log('🔄 Tentando carregar vozes do ElevenLabs em background...');
            
            const response = await fetch('https://api.elevenlabs.io/v1/voices', {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.voices && data.voices.length > 0) {
                    this.voices = data.voices;
                    console.log(`✅ ${this.voices.length} vozes do ElevenLabs carregadas em background`);
                }
            } else {
                console.log('⚠️ API ElevenLabs não disponível, mantendo vozes padrão');
            }
        } catch (error) {
            console.log('⚠️ Erro ao carregar do ElevenLabs, mantendo vozes padrão');
        }
    }

    /**
     * Obter vozes padrão caso a API falhe
     */
    getDefaultVoices() {
        return [
            { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'premade' },
            { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'premade' },
            { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'premade' },
            { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'premade' },
            { voice_id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', category: 'premade' },
            { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'premade' },
            { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', category: 'premade' },
            { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'premade' },
            { voice_id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', category: 'premade' }
        ];
    }

    /**
     * Gerar narração de texto
     */
    async generateNarration(text, voiceId, options = {}) {
        if (!this.isInitialized) {
            throw new Error('ElevenLabs Narration não foi inicializado');
        }

        if (!text || text.trim() === '') {
            throw new Error('Texto não pode estar vazio');
        }

        try {
            console.log('🎤 Gerando narração...', { text: text.substring(0, 50) + '...', voiceId });

            const requestBody = {
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: options.stability || 0.5,
                    similarity_boost: options.similarityBoost || 0.5,
                    style: options.style || 0.0,
                    use_speaker_boost: options.useSpeakerBoost || true
                }
            };

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                
                console.log('✅ Narração gerada com sucesso');
                return {
                    success: true,
                    audioUrl: audioUrl,
                    audioBlob: audioBlob,
                    duration: await this.getAudioDuration(audioUrl)
                };
            } else {
                const errorData = await response.json();
                throw new Error(`Erro na API: ${errorData.detail || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('❌ Erro ao gerar narração:', error);
            throw error;
        }
    }

    /**
     * Obter duração do áudio
     */
    async getAudioDuration(audioUrl) {
        return new Promise((resolve) => {
            const audio = new Audio(audioUrl);
            audio.addEventListener('loadedmetadata', () => {
                resolve(audio.duration);
            });
            audio.addEventListener('error', () => {
                resolve(0);
            });
        });
    }

    /**
     * Reproduzir narração
     */
    async playNarration(audioUrl) {
        try {
            // Parar áudio atual se estiver tocando
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }

            const audio = new Audio(audioUrl);
            this.currentAudio = audio;
            
            await audio.play();
            console.log('🎵 Narração reproduzida');
            return true;
        } catch (error) {
            console.error('❌ Erro ao reproduzir narração:', error);
            return false;
        }
    }

    /**
     * Parar narração atual
     */
    stopNarration() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
            console.log('⏹️ Narração parada');
        }
    }

    /**
     * Baixar narração como arquivo
     */
    downloadNarration(audioBlob, filename = 'narracao.mp3') {
        try {
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('💾 Narração baixada');
        } catch (error) {
            console.error('❌ Erro ao baixar narração:', error);
        }
    }

    /**
     * Criar vídeo com narração
     */
    async createVideoWithNarration(videoElement, audioUrl, captionText = '', captionOptions = {}) {
        try {
            console.log('🎬 Criando vídeo com narração...');

            // Configurar vídeo
            videoElement.muted = false;
            videoElement.volume = 0.8;

            // Criar elemento de áudio para narração
            const narrationAudio = new Audio(audioUrl);
            narrationAudio.volume = 0.9;

            // Sincronizar áudio com vídeo
            const syncAudio = () => {
                if (!videoElement.paused) {
                    narrationAudio.currentTime = videoElement.currentTime;
                    if (narrationAudio.paused) {
                        narrationAudio.play();
                    }
                } else {
                    narrationAudio.pause();
                }
            };

            // Event listeners para sincronização
            videoElement.addEventListener('play', () => {
                narrationAudio.play();
                syncAudio();
            });

            videoElement.addEventListener('pause', () => {
                narrationAudio.pause();
            });

            videoElement.addEventListener('timeupdate', syncAudio);

            // Adicionar legendas se especificado
            if (captionText) {
                this.addCaptionsToVideo(videoElement, captionText, captionOptions);
            }

            console.log('✅ Vídeo com narração configurado');
            return true;
        } catch (error) {
            console.error('❌ Erro ao criar vídeo com narração:', error);
            return false;
        }
    }

    /**
     * Adicionar legendas ao vídeo
     */
    addCaptionsToVideo(videoElement, captionText, options = {}) {
        const container = videoElement.parentElement;
        if (!container) return;

        // Remover legendas existentes
        const existingCaption = container.querySelector('.narration-caption');
        if (existingCaption) {
            existingCaption.remove();
        }

        // Criar elemento de legenda
        const captionElement = document.createElement('div');
        captionElement.className = 'narration-caption';
        captionElement.style.cssText = `
            position: absolute;
            ${options.position || 'bottom'}: 1rem;
            left: 1rem;
            right: 1rem;
            background: rgba(0, 0, 0, 0.8);
            color: ${options.color || 'white'};
            padding: 1rem;
            border-radius: 0.5rem;
            text-align: center;
            font-family: ${options.font || 'Arial'};
            font-size: ${options.fontSize || '1rem'};
            z-index: 10;
            display: none;
        `;
        captionElement.textContent = captionText;

        container.appendChild(captionElement);

        // Mostrar legenda quando o vídeo começar
        videoElement.addEventListener('play', () => {
            captionElement.style.display = 'block';
            this.animateCaption(captionElement, captionText);
        });

        videoElement.addEventListener('pause', () => {
            captionElement.style.display = 'none';
        });
    }

    /**
     * Animar legenda
     */
    animateCaption(element, text) {
        element.textContent = '';
        const words = text.split(' ');
        let currentIndex = 0;

        const showNextWord = () => {
            if (currentIndex < words.length) {
                element.textContent += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
                currentIndex++;
                setTimeout(showNextWord, 200);
            }
        };

        showNextWord();
    }

    /**
     * Obter vozes disponíveis
     */
    getVoices() {
        return this.voices;
    }

    /**
     * Verificar se está inicializado
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Obter status do sistema
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            voicesCount: this.voices.length,
            apiKey: this.apiKey ? 'Configurada' : 'Não configurada'
        };
    }
}

// Instância global
window.ElevenLabsNarration = new ElevenLabsNarration();

// Auto-inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando ElevenLabs Narration...');
    await window.ElevenLabsNarration.initialize();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElevenLabsNarration;
}
