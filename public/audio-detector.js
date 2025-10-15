// Audio Detection and Management System
class AudioDetector {
    constructor() {
        this.audioEnabled = true;
        this.detectedAudio = new Map();
    }

    // Detect if video has audio
    async detectVideoAudio(videoElement) {
        return new Promise((resolve) => {
            const video = videoElement;
            
            // Check if video has audio tracks
            const hasAudio = video.webkitAudioDecodedByteCount > 0 || 
                            video.mozHasAudio || 
                            video.audioTracks?.length > 0 ||
                            this.checkAudioStream(video);

            // Store detection result
            const videoId = video.src || video.currentSrc;
            this.detectedAudio.set(videoId, hasAudio);

            resolve({
                hasAudio: hasAudio,
                videoId: videoId,
                duration: video.duration || 0,
                size: this.getVideoSize(video)
            });
        });
    }

    // Check audio stream using Web Audio API
    checkAudioStream(video) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(video);
            const analyser = audioContext.createAnalyser();
            
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            
            // Check if there's any audio data
            const hasAudioData = dataArray.some(value => value > 0);
            
            audioContext.close();
            return hasAudioData;
        } catch (error) {
            console.log('⚠️ Web Audio API não disponível:', error);
            return false;
        }
    }

    // Get video file size
    getVideoSize(video) {
        if (video.files && video.files[0]) {
            return video.files[0].size;
        }
        return 0;
    }

    // Add audio indicator to video element
    addAudioIndicator(videoElement, hasAudio) {
        const container = videoElement.parentElement;
        if (!container) return;

        // Remove existing indicator
        const existingIndicator = container.querySelector('.audio-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'audio-indicator';
        indicator.innerHTML = `
            <div class="flex items-center space-x-2 px-3 py-2 rounded-lg ${hasAudio ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}">
                <i class="fas ${hasAudio ? 'fa-volume-up' : 'fa-volume-mute'}"></i>
                <span class="text-sm font-medium">${hasAudio ? 'Com Áudio' : 'Sem Áudio'}</span>
            </div>
        `;

        // Position indicator
        indicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 10;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        container.style.position = 'relative';
        container.appendChild(indicator);
    }

    // Show audio status in video list
    showAudioStatus(videos) {
        const statusContainer = document.getElementById('audioStatusContainer');
        if (!statusContainer) return;

        let audioCount = 0;
        let noAudioCount = 0;

        videos.forEach(video => {
            if (this.detectedAudio.get(video.src || video.url)) {
                audioCount++;
            } else {
                noAudioCount++;
            }
        });

        statusContainer.innerHTML = `
            <div class="bg-white/10 rounded-lg p-4 mb-4">
                <h3 class="text-white font-semibold mb-2">📊 Status de Áudio</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-400">${audioCount}</div>
                        <div class="text-white/70 text-sm">Com Áudio</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-400">${noAudioCount}</div>
                        <div class="text-white/70 text-sm">Sem Áudio</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Add audio controls to video
    addAudioControls(videoElement) {
        const container = videoElement.parentElement;
        if (!container) return;

        // Remove existing controls
        const existingControls = container.querySelector('.audio-controls');
        if (existingControls) {
            existingControls.remove();
        }

        // Create audio controls
        const controls = document.createElement('div');
        controls.className = 'audio-controls';
        controls.innerHTML = `
            <div class="flex items-center space-x-2 px-3 py-2 rounded-lg bg-black/50">
                <button onclick="toggleVideoAudio(this)" class="text-white hover:text-blue-400 transition-colors">
                    <i class="fas fa-volume-up"></i>
                </button>
                <input type="range" min="0" max="1" step="0.1" value="1" 
                       onchange="setVideoVolume(this.value)" 
                       class="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer">
                <span class="text-white text-sm">100%</span>
            </div>
        `;

        controls.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 10px;
            z-index: 10;
        `;

        container.style.position = 'relative';
        container.appendChild(controls);
    }

    // Toggle video audio
    toggleVideoAudio(button) {
        const video = button.closest('.video-container').querySelector('video');
        if (video.muted) {
            video.muted = false;
            button.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            video.muted = true;
            button.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }

    // Set video volume
    setVideoVolume(volume) {
        const video = document.querySelector('video');
        if (video) {
            video.volume = parseFloat(volume);
            const percentage = Math.round(volume * 100);
            const span = document.querySelector('.audio-controls span');
            if (span) {
                span.textContent = `${percentage}%`;
            }
        }
    }

    // Generate audio report
    generateAudioReport(videos) {
        const report = {
            total: videos.length,
            withAudio: 0,
            withoutAudio: 0,
            details: []
        };

        videos.forEach((video, index) => {
            const hasAudio = this.detectedAudio.get(video.src || video.url);
            report.details.push({
                index: index + 1,
                src: video.src || video.url,
                hasAudio: hasAudio,
                duration: video.duration || 0
            });

            if (hasAudio) {
                report.withAudio++;
            } else {
                report.withoutAudio++;
            }
        });

        return report;
    }

    // Export audio report
    exportAudioReport(videos) {
        const report = this.generateAudioReport(videos);
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `audio-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Global functions for video controls
function toggleVideoAudio(button) {
    const audioDetector = window.audioDetector;
    if (audioDetector) {
        audioDetector.toggleVideoAudio(button);
    }
}

function setVideoVolume(volume) {
    const audioDetector = window.audioDetector;
    if (audioDetector) {
        audioDetector.setVideoVolume(volume);
    }
}

// Initialize audio detector
document.addEventListener('DOMContentLoaded', function() {
    window.audioDetector = new AudioDetector();
    console.log('🎵 Audio Detector inicializado');
});
