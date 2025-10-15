// Google Cloud Text-to-Speech Manager
class GoogleTTSManager {
    constructor() {
        this.apiKey = 'YOUR_GOOGLE_CLOUD_API_KEY'; // Substitua pela sua chave
        this.baseURL = 'https://texttospeech.googleapis.com/v1';
        this.voices = [];
        this.currentVoice = null;
        this.isPlaying = false;
        this.audioContext = null;
        
        // Vozes padrão em português
        this.defaultVoices = [
            { name: 'pt-BR-Standard-A', languageCode: 'pt-BR', ssmlGender: 'FEMALE' },
            { name: 'pt-BR-Standard-B', languageCode: 'pt-BR', ssmlGender: 'MALE' },
            { name: 'pt-BR-Standard-C', languageCode: 'pt-BR', ssmlGender: 'FEMALE' },
            { name: 'pt-BR-Wavenet-A', languageCode: 'pt-BR', ssmlGender: 'FEMALE' },
            { name: 'pt-BR-Wavenet-B', languageCode: 'pt-BR', ssmlGender: 'MALE' }
        ];
    }

    async loadVoices() {
        try {
            const response = await fetch(`${this.baseURL}/voices?key=${this.apiKey}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.voices = data.voices.filter(voice => voice.languageCodes.includes('pt-BR'));
            console.log('✅ Vozes Google TTS carregadas:', this.voices.length);
        } catch (error) {
            console.error('❌ Erro ao carregar vozes Google TTS:', error);
            // Usar vozes padrão
            this.voices = this.defaultVoices;
        }
    }

    async generateSpeech(text, voiceType = 'female', speed = 1.0, volume = 0.8) {
        try {
            // Selecionar voz baseada no tipo
            let selectedVoice = this.voices.find(v => 
                v.ssmlGender === voiceType.toUpperCase() && 
                v.languageCode === 'pt-BR'
            ) || this.voices[0];

            const requestBody = {
                input: { text: text },
                voice: {
                    languageCode: 'pt-BR',
                    name: selectedVoice.name,
                    ssmlGender: selectedVoice.ssmlGender
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: speed,
                    volumeGainDb: (volume - 0.5) * 16, // Converter para dB
                    pitch: 0.0
                }
            };

            const response = await fetch(`${this.baseURL}/text:synthesize?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const audioData = data.audioContent;
            
            // Converter base64 para blob
            const binaryString = atob(audioData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            return new Blob([bytes], { type: 'audio/mp3' });

        } catch (error) {
            console.error('❌ Erro ao gerar fala Google TTS:', error);
            throw error;
        }
    }

    async playAudio(audioBlob) {
        try {
            if (this.isPlaying) {
                this.stopAudio();
            }

            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                this.isPlaying = false;
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = (error) => {
                console.error('❌ Erro ao reproduzir áudio:', error);
                this.isPlaying = false;
            };

            await audio.play();
            this.isPlaying = true;
            console.log('✅ Áudio reproduzido com sucesso');

        } catch (error) {
            console.error('❌ Erro ao reproduzir áudio:', error);
            throw error;
        }
    }

    stopAudio() {
        if (this.isPlaying) {
            // Parar todos os elementos de áudio
            const audios = document.querySelectorAll('audio');
            audios.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            this.isPlaying = false;
        }
    }

    // Método para testar a API
    async testAPI() {
        try {
            console.log('🔍 Testando Google Cloud TTS...');
            const testBlob = await this.generateSpeech('Teste da API Google Cloud Text-to-Speech');
            console.log('✅ API Google TTS funcionando!');
            return true;
        } catch (error) {
            console.error('❌ Erro no teste da API:', error);
            return false;
        }
    }

    // Método para obter informações de uso
    async getUsageInfo() {
        try {
            // Google Cloud não fornece endpoint direto para uso
            // Mas podemos estimar baseado nas chamadas
            console.log('📊 Google Cloud TTS - Limite: 4M chars/mês gratuitos');
            return {
                limit: 4000000,
                used: 0, // Seria necessário implementar tracking
                remaining: 4000000
            };
        } catch (error) {
            console.error('❌ Erro ao obter informações de uso:', error);
            return null;
        }
    }
}

// Exportar para uso global
window.GoogleTTSManager = GoogleTTSManager;
