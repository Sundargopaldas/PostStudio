// Free Text-to-Speech Manager using Web Speech API
class FreeTTSManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.isPlaying = false;
        this.isSupported = 'speechSynthesis' in window;
        
        // Vozes padrão em português
        this.defaultVoices = [
            { name: 'Google português (Brasil)', lang: 'pt-BR', gender: 'female' },
            { name: 'Microsoft Helena - Portuguese (Brazil)', lang: 'pt-BR', gender: 'female' },
            { name: 'Microsoft Daniel - Portuguese (Brazil)', lang: 'pt-BR', gender: 'male' }
        ];
    }

    async loadVoices() {
        return new Promise((resolve) => {
            if (!this.isSupported) {
                console.warn('⚠️ Web Speech API não suportada neste navegador');
                this.voices = this.defaultVoices;
                resolve();
                return;
            }

            // Carregar vozes disponíveis
            const loadVoices = () => {
                this.voices = this.synthesis.getVoices();
                
                // Filtrar vozes em português
                this.voices = this.voices.filter(voice => 
                    voice.lang.includes('pt') || 
                    voice.name.toLowerCase().includes('portuguese') ||
                    voice.name.toLowerCase().includes('brasil')
                );

                // Se não encontrar vozes em português, usar todas
                if (this.voices.length === 0) {
                    this.voices = this.synthesis.getVoices();
                }

                console.log('✅ Vozes carregadas:', this.voices.length);
                resolve();
            };

            // Carregar vozes imediatamente se já disponíveis
            if (this.voices.length > 0) {
                loadVoices();
            } else {
                // Aguardar carregamento das vozes
                this.synthesis.onvoiceschanged = loadVoices;
            }
        });
    }

    async generateSpeech(text, voiceType = 'female', speed = 1.0, volume = 0.8) {
        return new Promise((resolve, reject) => {
            if (!this.isSupported) {
                reject(new Error('Web Speech API não suportada'));
                return;
            }

            if (!text.trim()) {
                reject(new Error('Texto vazio'));
                return;
            }

            try {
                // Parar fala anterior se estiver reproduzindo
                this.stopAudio();

                // Criar utterance
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Selecionar voz
                const selectedVoice = this.selectVoice(voiceType);
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }

                // Configurar parâmetros
                utterance.rate = speed;
                utterance.volume = volume;
                utterance.pitch = 1.0;
                utterance.lang = 'pt-BR';

                // Eventos
                utterance.onstart = () => {
                    this.isPlaying = true;
                    console.log('🎤 Iniciando narração...');
                };

                utterance.onend = () => {
                    this.isPlaying = false;
                    console.log('✅ Narração finalizada');
                    resolve(true);
                };

                utterance.onerror = (event) => {
                    this.isPlaying = false;
                    console.error('❌ Erro na narração:', event.error);
                    reject(new Error(event.error));
                };

                // Reproduzir
                this.synthesis.speak(utterance);

            } catch (error) {
                console.error('❌ Erro ao gerar fala:', error);
                reject(error);
            }
        });
    }

    selectVoice(voiceType) {
        if (this.voices.length === 0) {
            return null;
        }

        // Tentar encontrar voz específica por gênero
        let selectedVoice = this.voices.find(voice => {
            const name = voice.name.toLowerCase();
            const isFemale = name.includes('female') || name.includes('helena') || name.includes('maria');
            const isMale = name.includes('male') || name.includes('daniel') || name.includes('joão');
            
            if (voiceType === 'female' && isFemale) return true;
            if (voiceType === 'male' && isMale) return true;
            return false;
        });

        // Se não encontrar, usar primeira voz disponível
        if (!selectedVoice) {
            selectedVoice = this.voices[0];
        }

        console.log('🎤 Voz selecionada:', selectedVoice.name);
        return selectedVoice;
    }

    async playAudio(audioBlob) {
        // Web Speech API não retorna blob, reproduz diretamente
        console.log('🔊 Reproduzindo áudio via Web Speech API');
        return true;
    }

    stopAudio() {
        if (this.isPlaying) {
            this.synthesis.cancel();
            this.isPlaying = false;
            console.log('⏹️ Áudio parado');
        }
    }

    // Método para testar a API
    async testAPI() {
        try {
            console.log('🔍 Testando Web Speech API...');
            
            if (!this.isSupported) {
                throw new Error('Web Speech API não suportada');
            }

            await this.generateSpeech('Teste da Web Speech API');
            console.log('✅ Web Speech API funcionando!');
            return true;
        } catch (error) {
            console.error('❌ Erro no teste da API:', error);
            return false;
        }
    }

    // Método para obter informações de uso
    getUsageInfo() {
        return {
            limit: 'ILIMITADO',
            used: 0,
            remaining: 'ILIMITADO',
            cost: 'GRATUITO'
        };
    }

    // Listar vozes disponíveis
    listVoices() {
        console.log('🎤 Vozes disponíveis:');
        this.voices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} (${voice.lang})`);
        });
        return this.voices;
    }
}

// Exportar para uso global
window.FreeTTSManager = FreeTTSManager;
