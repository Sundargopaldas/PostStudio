# 🗄️ Configuração do Banco de Dados MySQL

## 📋 Pré-requisitos
- MySQL Server instalado
- Acesso ao MySQL (root ou usuário com privilégios)

## 🚀 Como configurar:

### 1. Conectar ao MySQL
```bash
mysql -u root -p
```

### 2. Executar o script SQL
```sql
source database.sql;
```

### 3. Ou executar diretamente:
```bash
mysql -u root -p < database.sql
```

## 📊 Estrutura do Banco

### Tabelas Principais:
- **users** - Usuários do sistema
- **social_accounts** - Contas de redes sociais conectadas
- **posts** - Posts criados pelos usuários
- **social_posts** - Publicações nas redes sociais
- **templates** - Templates de conteúdo
- **analytics** - Métricas e estatísticas
- **user_settings** - Configurações do usuário
- **activity_logs** - Logs de atividade

### 👤 Usuário Admin Padrão:
- **Email**: admin@contentflow.ai
- **Senha**: admin123
- **Role**: admin

## 🔧 Configuração no .env

Crie um arquivo `.env` na raiz do projeto:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=contentflow_ai

# JWT Secret
JWT_SECRET=seu-jwt-secret-aqui

# Session Secret
SESSION_SECRET=seu-session-secret-aqui

# Server Configuration
PORT=3000
```

## ✅ Verificar se funcionou:

```sql
USE contentflow_ai;
SHOW TABLES;
SELECT * FROM users;
```

## 🔄 Próximos Passos:
1. Configurar o arquivo `.env`
2. Atualizar o `server.js` para usar o banco
3. Implementar autenticação real
4. Testar login com usuário admin
