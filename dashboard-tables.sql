-- ContentFlow AI - Tabelas para Dashboard Cards
-- Execute este script no MySQL para criar as tabelas necessárias

USE contentflow_ai;

-- =============================================
-- TABELAS PARA ANALYTICS
-- =============================================

-- Tabela de métricas de posts
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

-- Tabela de insights de conteúdo
CREATE TABLE IF NOT EXISTS content_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    insight_type ENUM('best_time', 'best_hashtag', 'best_template', 'engagement_trend') NOT NULL,
    insight_data JSON NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_insight (user_id, insight_type)
);

-- =============================================
-- TABELAS PARA CALENDÁRIO
-- =============================================

-- Tabela de posts agendados
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NULL, -- Pode ser NULL se for um post novo
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    platforms JSON NOT NULL, -- Array de plataformas
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

-- Tabela de calendário de conteúdo
CREATE TABLE IF NOT EXISTS content_calendar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    post_count INT DEFAULT 0,
    scheduled_count INT DEFAULT 0,
    published_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date)
);

-- =============================================
-- TABELAS PARA EDITOR VISUAL
-- =============================================

-- Tabela de templates visuais
CREATE TABLE IF NOT EXISTS visual_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    template_data JSON NOT NULL, -- Dados do template (cores, fontes, layout)
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

-- Tabela de customizações de posts
CREATE TABLE IF NOT EXISTS post_customizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    template_id INT NULL,
    customization_data JSON NOT NULL, -- Dados de customização (cores, fontes, etc.)
    preview_image VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES visual_templates(id) ON DELETE SET NULL
);

-- =============================================
-- TABELAS PARA INSIGHTS IA
-- =============================================

-- Tabela de insights gerados por IA
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

-- Tabela de histórico de sugestões da IA
CREATE TABLE IF NOT EXISTS ai_suggestions_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    suggestion_type VARCHAR(50) NOT NULL,
    original_content TEXT NULL,
    suggested_content TEXT NULL,
    was_accepted BOOLEAN DEFAULT FALSE,
    feedback_score INT NULL, -- 1-5 rating
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_type (user_id, suggestion_type),
    INDEX idx_accepted (was_accepted)
);

-- =============================================
-- TABELAS PARA CRIAÇÃO COM IA
-- =============================================

-- Tabela de prompts de IA
CREATE TABLE IF NOT EXISTS ai_prompts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    prompt_type ENUM('content_generation', 'hashtag_suggestion', 'title_optimization', 'engagement_boost') NOT NULL,
    prompt_text TEXT NOT NULL,
    generated_content TEXT NULL,
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_type (user_id, prompt_type)
);

-- Tabela de configurações de IA do usuário
CREATE TABLE IF NOT EXISTS ai_user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content_style VARCHAR(100) NULL, -- formal, casual, professional, etc.
    target_audience VARCHAR(100) NULL,
    preferred_hashtags JSON NULL,
    tone_preferences JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);

-- =============================================
-- TABELAS AUXILIARES
-- =============================================

-- Tabela de notificações
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

-- Tabela de configurações do dashboard
CREATE TABLE IF NOT EXISTS dashboard_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    widget_config JSON NOT NULL, -- Configuração dos widgets do dashboard
    theme_preferences JSON NULL,
    layout_preferences JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_dashboard (user_id)
);

-- =============================================
-- INSERIR DADOS INICIAIS
-- =============================================

-- Inserir templates visuais padrão
INSERT INTO visual_templates (user_id, name, description, template_data, category, is_public) VALUES 
(1, 'Motivacional Clássico', 'Template para posts motivacionais com gradiente azul', 
 '{"background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "textColor": "#ffffff", "fontFamily": "Poppins", "fontSize": "24px"}', 
 'motivacional', TRUE),
(1, 'Negócios Profissional', 'Template profissional para dicas de negócio', 
 '{"background": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", "textColor": "#ffffff", "fontFamily": "Inter", "fontSize": "20px"}', 
 'negocios', TRUE),
(1, 'Engajamento Vibrante', 'Template colorido para gerar engajamento', 
 '{"background": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", "textColor": "#ffffff", "fontFamily": "Montserrat", "fontSize": "22px"}', 
 'engajamento', TRUE);

-- Inserir insights de IA padrão
INSERT INTO ai_insights (user_id, insight_type, insight_text, confidence_score) VALUES 
(1, 'content_suggestion', 'Posts com perguntas geram 40% mais engajamento. Considere adicionar uma pergunta ao final do seu conteúdo.', 0.85),
(1, 'hashtag_optimization', 'Use hashtags específicas como #empreendedorismo #mindset em vez de hashtags genéricas para melhor alcance.', 0.78),
(1, 'timing_suggestion', 'Seu público está mais ativo entre 14h e 16h. Agende seus posts para esse horário.', 0.92);

-- Inserir configurações de IA padrão
INSERT INTO ai_user_preferences (user_id, content_style, target_audience, tone_preferences) VALUES 
(1, 'profissional', 'empreendedores', '{"formal": 0.3, "casual": 0.7, "motivacional": 0.8}');

-- =============================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_post_metrics_post ON post_metrics(post_id);
CREATE INDEX idx_scheduled_posts_user_date ON scheduled_posts(user_id, scheduled_at);
CREATE INDEX idx_ai_insights_user_type ON ai_insights(user_id, insight_type);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- =============================================
-- VERIFICAR TABELAS CRIADAS
-- =============================================

SHOW TABLES;

-- Mostrar estrutura das principais tabelas
DESCRIBE post_metrics;
DESCRIBE scheduled_posts;
DESCRIBE visual_templates;
DESCRIBE ai_insights;
DESCRIBE ai_prompts;
