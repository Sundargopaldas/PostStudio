-- ContentFlow AI - Criar tabelas na ordem correta
USE contentflow_ai;

-- 1. Primeiro: Tabela users (sem dependências)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabela social_accounts (depende de users)
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

-- 3. Tabela posts (depende de users)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    content_type ENUM('text', 'image', 'video', 'carousel') DEFAULT 'text',
    media_urls JSON NULL,
    hashtags JSON NULL,
    mentions JSON NULL,
    status ENUM('draft', 'scheduled', 'published', 'failed') DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabela templates (depende de users)
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

-- 5. Tabela user_settings (depende de users)
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

-- 6. Tabela activity_logs (depende de users)
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

-- 7. Tabela social_posts (depende de posts e social_accounts)
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

-- 8. Tabela analytics (depende de social_posts)
CREATE TABLE IF NOT EXISTS analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    social_post_id INT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    metric_value INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (social_post_id) REFERENCES social_posts(id) ON DELETE CASCADE
);

-- 9. Criar índices para performance
CREATE INDEX idx_posts_user_status ON posts(user_id, status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_analytics_platform ON analytics(platform);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at);

-- 10. Inserir usuário admin padrão (senha: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@contentflow.ai', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- 11. Inserir alguns templates padrão
INSERT INTO templates (user_id, name, description, content, category, is_public) VALUES 
(1, 'Post Motivacional', 'Template para posts motivacionais', '🌟 {mensagem_motivacional}\n\n#motivacao #sucesso #mindset', 'motivacional', TRUE),
(1, 'Dica de Negócio', 'Template para dicas de negócio', '💡 DICA: {dica_negocio}\n\nO que você acha? Comenta aí! 👇\n\n#negocios #empreendedorismo #dicas', 'negocios', TRUE),
(1, 'Pergunta Engajamento', 'Template para gerar engajamento', '❓ {pergunta_engajamento}\n\nComenta aí sua opinião! 👇\n\n#engajamento #comunidade', 'engajamento', TRUE);

-- 12. Verificar se foi criado
SHOW TABLES;
SELECT * FROM users;
