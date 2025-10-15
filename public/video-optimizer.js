// Video Optimizer - Solução para vídeos em câmera lenta
class VideoOptimizer {
    constructor() {
        this.optimizedVideos = new Map();
        this.qualitySettings = {
            'low': { width: 480, height: 320 },
            'medium': { width: 720, height: 480 },
            'high': { width: 1280, height: 720 }
        };
    }

    // Otimizar vídeo para reprodução mais rápida
    optimizeVideoForPlayback(videoElement, quality = 'medium') {
        if (!videoElement) return;

        // Configurações para reprodução otimizada
        videoElement.preload = 'metadata'; // Carregar apenas metadados
        videoElement.playsInline = true; // Reproduzir inline no mobile
        videoElement.muted = true; // Sem áudio para reprodução automática
        videoElement.controls = true;
        
        // Configurações de performance
        videoElement.style.objectFit = 'cover';
        videoElement.style.width = '100%';
        videoElement.style.height = 'auto';
        
        // Eventos para otimização
        this.setupVideoEvents(videoElement);
        
        return videoElement;
    }

    setupVideoEvents(videoElement) {
        // Otimizar quando o vídeo está pronto
        videoElement.addEventListener('loadedmetadata', () => {
            console.log('📹 Metadados do vídeo carregados');
            this.optimizeVideoQuality(videoElement);
        });

        // Pausar quando não visível (economia de recursos)
        videoElement.addEventListener('pause', () => {
            console.log('⏸️ Vídeo pausado');
        });

        // Otimizar quando reproduzindo
        videoElement.addEventListener('play', () => {
            console.log('▶️ Vídeo reproduzindo');
            this.ensureSmoothPlayback(videoElement);
        });

        // Detectar problemas de performance
        videoElement.addEventListener('waiting', () => {
            console.log('⏳ Vídeo aguardando buffer...');
            this.handleBuffering(videoElement);
        });

        // Otimizar quando carregado
        videoElement.addEventListener('canplay', () => {
            console.log('✅ Vídeo pronto para reprodução');
        });
    }

    // Otimizar qualidade do vídeo
    optimizeVideoQuality(videoElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionar se necessário
        const maxWidth = 1280;
        const maxHeight = 720;
        
        if (videoElement.videoWidth > maxWidth || videoElement.videoHeight > maxHeight) {
            const ratio = Math.min(maxWidth / videoElement.videoWidth, maxHeight / videoElement.videoHeight);
            const newWidth = videoElement.videoWidth * ratio;
            const newHeight = videoElement.videoHeight * ratio;
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // Aplicar redimensionamento
            videoElement.style.width = newWidth + 'px';
            videoElement.style.height = newHeight + 'px';
        }
    }

    // Garantir reprodução suave
    ensureSmoothPlayback(videoElement) {
        // Configurações para reprodução suave
        videoElement.playbackRate = 1.0; // Velocidade normal
        
        // Otimizar para performance
        if (videoElement.requestVideoFrameCallback) {
            videoElement.requestVideoFrameCallback(() => {
                // Frame otimizado
            });
        }
    }

    // Lidar com buffering
    handleBuffering(videoElement) {
        // Mostrar indicador de carregamento
        const loadingIndicator = this.createLoadingIndicator();
        videoElement.parentElement.appendChild(loadingIndicator);
        
        // Remover quando carregado
        const removeLoading = () => {
            if (loadingIndicator && loadingIndicator.parentElement) {
                loadingIndicator.remove();
            }
        };
        
        videoElement.addEventListener('canplay', removeLoading, { once: true });
        videoElement.addEventListener('error', removeLoading, { once: true });
    }

    // Criar indicador de carregamento
    createLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'video-loading-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10;
        `;
        indicator.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Carregando...';
        return indicator;
    }

    // Detectar e corrigir problemas de velocidade
    detectAndFixSpeedIssues(videoElement) {
        // Verificar se o vídeo está em câmera lenta
        const checkSpeed = () => {
            if (videoElement.playbackRate !== 1.0) {
                console.log('🔧 Corrigindo velocidade do vídeo');
                videoElement.playbackRate = 1.0;
            }
        };

        // Verificar periodicamente
        const speedCheckInterval = setInterval(checkSpeed, 1000);
        
        // Parar verificação quando vídeo pausar
        videoElement.addEventListener('pause', () => {
            clearInterval(speedCheckInterval);
        });
    }

    // Otimizar vídeo para diferentes dispositivos
    optimizeForDevice(videoElement) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowEnd = navigator.hardwareConcurrency < 4; // Poucos cores de CPU
        
        if (isMobile || isLowEnd) {
            // Configurações para dispositivos menos potentes
            videoElement.preload = 'none';
            videoElement.playsInline = true;
            videoElement.muted = true;
            
            // Reduzir qualidade se necessário
            if (videoElement.videoWidth > 720) {
                videoElement.style.maxWidth = '720px';
            }
        }
    }

    // Criar vídeo otimizado
    createOptimizedVideo(videoUrl, container, options = {}) {
        const videoElement = document.createElement('video');
        videoElement.src = videoUrl;
        videoElement.className = options.className || 'w-full h-auto rounded-lg';
        
        // Aplicar otimizações
        this.optimizeVideoForPlayback(videoElement, options.quality);
        this.optimizeForDevice(videoElement);
        this.detectAndFixSpeedIssues(videoElement);
        
        // Adicionar ao container
        if (container) {
            container.appendChild(videoElement);
        }
        
        return videoElement;
    }

    // Método para corrigir vídeos existentes
    fixExistingVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            this.optimizeVideoForPlayback(video);
            this.detectAndFixSpeedIssues(video);
        });
    }

    // Configurações avançadas de performance
    setAdvancedPerformanceSettings() {
        // Otimizar para performance
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.fixExistingVideos();
            });
        } else {
            setTimeout(() => {
                this.fixExistingVideos();
            }, 100);
        }
    }
}

// Exportar para uso global
window.VideoOptimizer = VideoOptimizer;
