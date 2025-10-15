// Social Media Integration Manager
class SocialIntegrationManager {
    constructor() {
        this.connectedAccounts = {};
        this.socialPlatforms = {
            facebook: {
                name: 'Facebook',
                icon: 'fab fa-facebook',
                color: '#1877F2',
                apiUrl: 'https://graph.facebook.com/v18.0',
                scopes: ['pages_manage_posts', 'pages_read_engagement']
            },
            instagram: {
                name: 'Instagram',
                icon: 'fab fa-instagram',
                color: '#E4405F',
                apiUrl: 'https://graph.facebook.com/v18.0',
                scopes: ['instagram_basic', 'instagram_content_publish']
            },
            twitter: {
                name: 'Twitter',
                icon: 'fab fa-twitter',
                color: '#1DA1F2',
                apiUrl: 'https://api.twitter.com/2',
                scopes: ['tweet.read', 'tweet.write', 'users.read']
            },
            linkedin: {
                name: 'LinkedIn',
                icon: 'fab fa-linkedin',
                color: '#0077B5',
                apiUrl: 'https://api.linkedin.com/v2',
                scopes: ['w_member_social']
            },
            youtube: {
                name: 'YouTube',
                icon: 'fab fa-youtube',
                color: '#FF0000',
                apiUrl: 'https://www.googleapis.com/youtube/v3',
                scopes: ['https://www.googleapis.com/auth/youtube.upload']
            },
            tiktok: {
                name: 'TikTok',
                icon: 'fab fa-tiktok',
                color: '#000000',
                apiUrl: 'https://open-api.tiktok.com',
                scopes: ['user.info.basic', 'video.publish']
            }
        };
        
        this.loadConnectedAccounts();
    }

    loadConnectedAccounts() {
        const saved = localStorage.getItem('connectedSocialAccounts');
        if (saved) {
            this.connectedAccounts = JSON.parse(saved);
        }
    }

    saveConnectedAccounts() {
        localStorage.setItem('connectedSocialAccounts', JSON.stringify(this.connectedAccounts));
    }

    async connectAccount(platform) {
        const platformConfig = this.socialPlatforms[platform];
        if (!platformConfig) {
            throw new Error('Plataforma não suportada');
        }

        try {
            // Simular processo de autenticação OAuth
            const authUrl = this.buildAuthUrl(platform, platformConfig);
            
            // Em um ambiente real, você abriria uma popup ou redirecionaria
            const result = await this.simulateOAuthFlow(platform, authUrl);
            
            if (result.success) {
                this.connectedAccounts[platform] = {
                    connected: true,
                    username: result.username,
                    userId: result.userId,
                    accessToken: result.accessToken,
                    connectedAt: new Date().toISOString()
                };
                
                this.saveConnectedAccounts();
                return result;
            } else {
                throw new Error(result.error || 'Falha na autenticação');
            }
        } catch (error) {
            console.error(`❌ Erro ao conectar ${platform}:`, error);
            throw error;
        }
    }

    buildAuthUrl(platform, config) {
        const baseUrl = this.getOAuthBaseUrl(platform);
        const params = new URLSearchParams({
            client_id: this.getClientId(platform),
            redirect_uri: `${window.location.origin}/auth/callback/${platform}`,
            scope: config.scopes.join(' '),
            response_type: 'code',
            state: this.generateState()
        });
        
        return `${baseUrl}?${params.toString()}`;
    }

    getOAuthBaseUrl(platform) {
        const urls = {
            facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
            instagram: 'https://www.facebook.com/v18.0/dialog/oauth',
            twitter: 'https://twitter.com/i/oauth2/authorize',
            linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
            youtube: 'https://accounts.google.com/o/oauth2/v2/auth',
            tiktok: 'https://www.tiktok.com/auth/authorize'
        };
        
        return urls[platform];
    }

    getClientId(platform) {
        // Em produção, essas chaves viriam de variáveis de ambiente
        const clientIds = {
            facebook: 'YOUR_FACEBOOK_APP_ID',
            instagram: 'YOUR_INSTAGRAM_APP_ID',
            twitter: 'YOUR_TWITTER_CLIENT_ID',
            linkedin: 'YOUR_LINKEDIN_CLIENT_ID',
            youtube: 'YOUR_YOUTUBE_CLIENT_ID',
            tiktok: 'YOUR_TIKTOK_CLIENT_ID'
        };
        
        return clientIds[platform];
    }

    generateState() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    async simulateOAuthFlow(platform, authUrl) {
        // Simular processo de autenticação
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular sucesso baseado na plataforma
                const success = Math.random() > 0.2; // 80% de chance de sucesso
                
                if (success) {
                    resolve({
                        success: true,
                        username: `@user_${platform}`,
                        userId: `user_${Date.now()}`,
                        accessToken: `token_${Math.random().toString(36).substring(2, 15)}`
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Falha na autenticação'
                    });
                }
            }, 2000);
        });
    }

    disconnectAccount(platform) {
        if (this.connectedAccounts[platform]) {
            delete this.connectedAccounts[platform];
            this.saveConnectedAccounts();
            return true;
        }
        return false;
    }

    isConnected(platform) {
        return this.connectedAccounts[platform]?.connected || false;
    }

    getConnectedAccounts() {
        return Object.keys(this.connectedAccounts).filter(platform => 
            this.connectedAccounts[platform]?.connected
        );
    }

    async publishPost(platform, postData) {
        if (!this.isConnected(platform)) {
            throw new Error(`${platform} não está conectado`);
        }

        const account = this.connectedAccounts[platform];
        
        try {
            // Simular publicação
            const result = await this.simulatePublish(platform, postData, account);
            return result;
        } catch (error) {
            console.error(`❌ Erro ao publicar no ${platform}:`, error);
            throw error;
        }
    }

    async simulatePublish(platform, postData, account) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const success = Math.random() > 0.1; // 90% de chance de sucesso
                
                if (success) {
                    resolve({
                        success: true,
                        postId: `post_${Date.now()}`,
                        url: `https://${platform}.com/post/${Date.now()}`,
                        publishedAt: new Date().toISOString()
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Falha na publicação'
                    });
                }
            }, 1500);
        });
    }

    createSocialSelector(containerId, onAccountConnect) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="social-integration">
                <h3 class="text-white font-semibold mb-4">Integração com Redes Sociais</h3>
                
                <div class="space-y-4" id="social-accounts">
                    ${Object.entries(this.socialPlatforms).map(([key, platform]) => `
                        <div class="social-account-item p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <i class="${platform.icon} text-2xl" style="color: ${platform.color}"></i>
                                    <div>
                                        <h4 class="text-white font-medium">${platform.name}</h4>
                                        <p class="text-white/60 text-sm" id="status-${key}">
                                            ${this.isConnected(key) ? 'Conectado' : 'Não conectado'}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-2">
                                    ${this.isConnected(key) ? `
                                        <button onclick="disconnectSocial('${key}')" 
                                                class="bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors">
                                            <i class="fas fa-unlink mr-1"></i>Desconectar
                                        </button>
                                    ` : `
                                        <button onclick="connectSocial('${key}')" 
                                                class="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-colors">
                                            <i class="fas fa-link mr-1"></i>Conectar
                                        </button>
                                    `}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div class="flex items-start space-x-3">
                        <i class="fas fa-info-circle text-blue-400 text-lg mt-1"></i>
                        <div>
                            <h4 class="text-blue-300 font-medium">Como funciona</h4>
                            <p class="text-blue-200/80 text-sm mt-1">
                                Conecte suas redes sociais para publicar automaticamente seus posts. 
                                Suas credenciais são armazenadas de forma segura e você pode desconectar a qualquer momento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.onAccountConnect = onAccountConnect;
    }

    createPublishPanel(containerId, onPublish) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const connectedPlatforms = this.getConnectedAccounts();
        
        container.innerHTML = `
            <div class="publish-panel">
                <h3 class="text-white font-semibold mb-4">Publicar em Redes Sociais</h3>
                
                ${connectedPlatforms.length > 0 ? `
                    <div class="mb-4">
                        <label class="block text-white/80 text-sm font-medium mb-2">Selecionar plataformas</label>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                            ${connectedPlatforms.map(platform => `
                                <label class="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                    <input type="checkbox" value="${platform}" class="platform-checkbox">
                                    <i class="${this.socialPlatforms[platform].icon} text-lg" style="color: ${this.socialPlatforms[platform].color}"></i>
                                    <span class="text-white text-sm">${this.socialPlatforms[platform].name}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-white/80 text-sm font-medium mb-2">Mensagem personalizada (opcional)</label>
                        <textarea id="social-message" rows="3" placeholder="Adicione uma mensagem personalizada para suas redes sociais..." 
                                  class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none"></textarea>
                    </div>
                    
                    <button onclick="publishToSocial()" 
                            class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105">
                        <i class="fas fa-share mr-2"></i>Publicar Agora
                    </button>
                ` : `
                    <div class="text-center py-8">
                        <i class="fas fa-share-alt text-4xl text-white/40 mb-4"></i>
                        <p class="text-white/60">Conecte suas redes sociais para publicar automaticamente</p>
                        <button onclick="window.location.href='/settings'" 
                                class="mt-4 bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors">
                            <i class="fas fa-cog mr-2"></i>Ir para Configurações
                        </button>
                    </div>
                `}
            </div>
        `;

        this.onPublish = onPublish;
    }
}

// Global functions for social integration
function connectSocial(platform) {
    if (window.socialManager) {
        window.socialManager.connectAccount(platform)
            .then(result => {
                showNotification(`${platform} conectado com sucesso!`, 'success');
                updateSocialStatus(platform, true);
            })
            .catch(error => {
                showNotification(`Erro ao conectar ${platform}: ${error.message}`, 'error');
            });
    }
}

function disconnectSocial(platform) {
    if (window.socialManager) {
        const success = window.socialManager.disconnectAccount(platform);
        if (success) {
            showNotification(`${platform} desconectado com sucesso!`, 'success');
            updateSocialStatus(platform, false);
        }
    }
}

function updateSocialStatus(platform, connected) {
    const statusElement = document.getElementById(`status-${platform}`);
    if (statusElement) {
        statusElement.textContent = connected ? 'Conectado' : 'Não conectado';
    }
}

function publishToSocial() {
    if (window.socialManager) {
        const selectedPlatforms = Array.from(document.querySelectorAll('.platform-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedPlatforms.length === 0) {
            showNotification('Selecione pelo menos uma plataforma', 'error');
            return;
        }
        
        const message = document.getElementById('social-message')?.value || '';
        
        // Simular publicação
        showNotification('Publicando nas redes sociais...', 'info');
        
        selectedPlatforms.forEach(platform => {
            window.socialManager.publishPost(platform, { message })
                .then(result => {
                    if (result.success) {
                        showNotification(`Post publicado no ${platform}!`, 'success');
                    } else {
                        showNotification(`Erro ao publicar no ${platform}`, 'error');
                    }
                })
                .catch(error => {
                    showNotification(`Erro ao publicar no ${platform}: ${error.message}`, 'error');
                });
        });
    }
}

// Initialize social manager
document.addEventListener('DOMContentLoaded', function() {
    window.socialManager = new SocialIntegrationManager();
    console.log('✅ Social Integration Manager inicializado');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialIntegrationManager;
}
