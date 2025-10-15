-- ContentFlow AI - Schema Unificado para Deploy
-- Execute este script no MySQL para criar o banco e as tabelas

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS contentflow_ai;
USE contentflow_ai;

-- =============================================
-- TABELAS PRINCIPAIS
-- =============================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    subscription_plan ENUM('free', 'premium', 'pro') DEFAULT 'free',
    subscription_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de posts (unificada)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    content_type ENUM('text', 'image', 'video', 'carousel') DEFAULT 'text',
    hashtags VARCHAR(500) NULL,
    template VARCHAR(100) NULL,
    platforms JSON NULL,
    image_url VARCHAR(500) NULL,
    video_url VARCHAR(500) NULL,
    customization JSON NULL,
    status ENUM('draft', 'published', 'scheduled', 'archived') DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de redes sociais conectadas
CREATE TABLE IF NOT EXISTS social_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    platform ENUM('twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube') NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_id VARCHAR(100) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NULL,
    token_expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_platform (user_id, platform, account_id)
);

-- Tabela de publicações nas redes sociais
CREATE TABLE IF NOT EXISTS social_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    social_account_id INT NOT NULL,
    platform_post_id VARCHAR(100) NULL,
    status ENUM('pending', 'published', 'failed') DEFAULT 'pending',
    error_message TEXT NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (social_account_id) REFERENCES social_accounts(id) ON DELETE CASCADE
);

-- Tabela de templates
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NULL,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de analytics
CREATE TABLE IF NOT EXISTS analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    social_post_id INT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    metric_value INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (social_post_id) REFERENCES social_posts(id) ON DELETE CASCADE
);

-- Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_setting (user_id, setting_key)
);

-- Tabela de logs de atividade
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NULL,
    metadata JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- TABELAS PARA VERSÃO PREMIUM/PRO
-- =============================================

-- Tabela de métricas de posts (Premium/Pro)
CREATE TABLE IF NOT EXISTS post_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    shares INT DEFAULT 0,
    comments INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_platform (post_id, platform),
    INDEX idx_recorded_at (recorded_at)
);

-- Tabela de posts agendados (Premium/Pro)
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    platforms JSON NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    status ENUM('scheduled', 'published', 'failed', 'cancelled') DEFAULT 'scheduled',
    published_at TIMESTAMP NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
    INDEX idx_user_scheduled (user_id, scheduled_at),
    INDEX idx_scheduled_status (status, scheduled_at)
);

-- Tabela de templates visuais (Premium/Pro)
CREATE TABLE IF NOT EXISTS visual_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    template_data JSON NOT NULL,
    preview_image VARCHAR(500) NULL,
    category VARCHAR(50) NULL,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_category (user_id, category),
    INDEX idx_public_usage (is_public, usage_count)
);

-- Tabela de customizações de posts (Premium/Pro)
CREATE TABLE IF NOT EXISTS post_customizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    template_id INT NULL,
    customization_data JSON NOT NULL,
    preview_image VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES visual_templates(id) ON DELETE SET NULL
);

-- Tabela de insights de IA (Pro)
CREATE TABLE IF NOT EXISTS ai_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NULL,
    insight_type ENUM('content_suggestion', 'hashtag_optimization', 'timing_suggestion', 'engagement_prediction') NOT NULL,
    insight_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
    INDEX idx_user_type (user_id, insight_type),
    INDEX idx_confidence (confidence_score)
);

-- Tabela de notificações (Premium/Pro)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('scheduled_post', 'insight_ready', 'engagement_alert', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Inserir usuário admin padrão (senha: admin123)
INSERT IGNORE INTO users (id, name, email, password, role, subscription_plan) VALUES 
(1, 'Admin', 'admin@contentflow.ai', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'pro');

-- Inserir templates padrão
INSERT IGNORE INTO templates (user_id, name, description, content, category, is_public) VALUES 
(1, 'Post Motivacional', 'Template para posts motivacionais', '🌟 {mensagem_motivacional}\n\n#motivacao #sucesso #mindset', 'motivacional', TRUE),
(1, 'Dica de Negócio', 'Template para dicas de negócio', '💡 DICA: {dica_negocio}\n\nO que você acha? Comenta aí! 👇\n\n#negocios #empreendedorismo #dicas', 'negocios', TRUE),
(1, 'Pergunta Engajamento', 'Template para gerar engajamento', '❓ {pergunta_engajamento}\n\nComenta aí sua opinião! 👇\n\n#engajamento #comunidade', 'engajamento', TRUE);

-- Inserir templates visuais padrão (Premium/Pro)
INSERT IGNORE INTO visual_templates (user_id, name, description, template_data, category, is_public) VALUES 
(1, 'Motivacional Clássico', 'Template para posts motivacionais com gradiente azul', 
 '{"background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "textColor": "#ffffff", "fontFamily": "Poppins", "fontSize": "24px"}', 
 'motivacional', TRUE),
(1, 'Negócios Profissional', 'Template profissional para dicas de negócio', 
 '{"background": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", "textColor": "#ffffff", "fontFamily": "Inter", "fontSize": "20px"}', 
 'negocios', TRUE),
(1, 'Engajamento Vibrante', 'Template colorido para gerar engajamento', 
 '{"background": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", "textColor": "#ffffff", "fontFamily": "Montserrat", "fontSize": "22px"}', 
 'engajamento', TRUE);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_posts_user_status ON posts(user_id, status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_analytics_platform ON analytics(platform);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at);
CREATE INDEX idx_post_metrics_post ON post_metrics(post_id);
CREATE INDEX idx_scheduled_posts_user_date ON scheduled_posts(user_id, scheduled_at);
CREATE INDEX idx_ai_insights_user_type ON ai_insights(user_id, insight_type);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- =============================================
-- VERIFICAR ESTRUTURA
-- =============================================

SHOW TABLES;
