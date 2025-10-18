// Text-to-Speech Local Alternative - Funciona sem API externa
class LocalTTSManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.isPlaying = false;
        
        this.loadVoices();
    }

    loadVoices() {
        // Carregar vozes do navegador
        const loadVoicesList = () => {
            this.voices = this.synthesis.getVoices();
            console.log('✅ Vozes locais carregadas:', this.voices.length);
            
            // Filtrar vozes em português
            this.voices = this.voices.filter(voice => 
                voice.lang.startsWith('pt') || 
                voice.name.toLowerCase().includes('portuguese') ||
                voice.name.toLowerCase().includes('brazil')
            );
            
            console.log('🇧🇷 Vozes em português:', this.voices.length);
        };

        // Carregar vozes quando estiverem disponíveis
        if (this.voices.length === 0) {
            this.synthesis.onvoiceschanged = loadVoicesList;
            loadVoicesList();
        } else {
            loadVoicesList();
        }
    }

    async generateSpeech(text, voiceId = null, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                console.log('🎤 Gerando fala local...');
                
                // Parar fala anterior se existir
                this.synthesis.cancel();
                
                // Criar utterance
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Configurar voz
                if (voiceId && this.voices.length > 0) {
                    const voice = this.voices.find(v => v.name === voiceId) || this.voices[0];
                    utterance.voice = voice;
                } else if (this.voices.length > 0) {
                    utterance.voice = this.voices[0];
                }
                
                // Configurar opções
                utterance.rate = options.speed || 1.0;
                utterance.pitch = options.pitch || 1.0;
                utterance.volume = options.volume || 0.8;
                utterance.lang = 'pt-BR';
                
                // Eventos
                utterance.onstart = () => {
                    console.log('▶️ Fala iniciada');
                    this.isPlaying = true;
                };
                
                utterance.onend = () => {
                    console.log('🏁 Fala finalizada');
                    this.isPlaying = false;
                    resolve('Fala concluída');
                };
                
                utterance.onerror = (error) => {
                    console.error('❌ Erro na fala:', error);
                    this.isPlaying = false;
                    reject(error);
                };
                
                // Iniciar fala
                this.synthesis.speak(utterance);
                
                // Simular blob de áudio para compatibilidade
                setTimeout(() => {
                    const mockBlob = new Blob(['audio-data'], { type: 'audio/wav' });
                    resolve(mockBlob);
                }, 100);
                
            } catch (error) {
                console.error('❌ Erro ao gerar fala:', error);
                reject(error);
            }
        });
    }

    async playSpeech(audioBlob) {
        // Para TTS local, não precisamos do blob
        console.log('🔊 Reproduzindo fala local');
        return Promise.resolve();
    }

    stopSpeech() {
        this.synthesis.cancel();
        this.isPlaying = false;
        console.log('⏹️ Fala interrompida');
    }

    getVoicesByCategory(category) {
        return this.voices.filter(voice => voice.name.toLowerCase().includes(category));
    }

    getPopularVoices(limit = 10) {
        return this.voices.slice(0, limit);
    }
}

// Função para testar TTS local
function testLocalTTS() {
    const tts = new LocalTTSManager();
    
    setTimeout(() => {
        console.log('🧪 Testando TTS local...');
        tts.generateSpeech('Teste do sistema de fala local funcionando perfeitamente!')
            .then(() => console.log('✅ TTS local funcionando!'))
            .catch(error => console.error('❌ Erro no TTS local:', error));
    }, 1000);
}

// Exportar para uso global
window.LocalTTSManager = LocalTTSManager;
window.testLocalTTS = testLocalTTS;
