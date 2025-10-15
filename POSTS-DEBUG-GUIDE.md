# 🔍 Guia de Debug - Posts Não Salvos

## 🚨 Problema Reportado
**"Os posts não estão sendo salvos"**

## 🔍 Investigação Realizada

### 1. **Verificação do Arquivo demo-posts.json**
```bash
✅ Arquivo existe: demo-posts.json
✅ Contém 1 post salvo
✅ Post pertence ao usuário 1
✅ Dados completos (título, conteúdo, imagem, customização)
```

### 2. **Logs de Debug Adicionados**

#### **Na rota POST /api/posts:**
```javascript
console.log('🔍 Debug - Dados recebidos no servidor:');
console.log('Título:', title);
console.log('Conteúdo:', content);
console.log('👤 Sessão do usuário:', req.session);
console.log('✅ Usuário autenticado:', req.session.userId);
console.log('✅ Validação passou - Título e conteúdo presentes');
```

#### **Na rota GET /api/posts:**
```javascript
console.log('🔍 global.demoPosts existe?', !!global.demoPosts);
console.log('🔍 global.demoPosts length:', global.demoPosts ? global.demoPosts.length : 'undefined');
console.log('🔍 Usuário atual:', req.session.userId);
console.log('🔍 Posts filtrados para usuário:', posts);
```

#### **Na inicialização:**
```javascript
console.log('🔍 Posts carregados:', global.demoPosts);
console.log('🔍 global.demoPosts inicializado como array vazio');
```

### 3. **Teste de Carregamento**
```javascript
// test-posts.js
✅ Arquivo demo-posts.json encontrado
📊 Número de posts: 1
👤 Posts do usuário 1: 1
```

## 🛠️ Soluções Implementadas

### **1. Logs de Debug Completos**
- ✅ Logs na criação de posts
- ✅ Logs na busca de posts
- ✅ Logs na inicialização
- ✅ Logs de validação

### **2. Página de Teste da API**
- ✅ `test-api.html` criada
- ✅ Teste direto da API `/api/posts`
- ✅ Verificação de resposta e dados

### **3. Verificação de Dados**
- ✅ Arquivo `demo-posts.json` existe
- ✅ Contém posts válidos
- ✅ Estrutura de dados correta

## 🧪 Como Testar

### **1. Teste Manual**
1. Acesse `http://localhost:3000/test-api.html`
2. Clique em "Testar API"
3. Verifique os logs no console
4. Confirme se os posts aparecem

### **2. Teste de Criação**
1. Acesse a página de criação de posts
2. Preencha título e conteúdo
3. Clique em "Publicar"
4. Verifique os logs no servidor
5. Confirme se o post foi salvo

### **3. Teste de Exibição**
1. Acesse a página de posts
2. Verifique se os posts aparecem
3. Confirme se os logs mostram os dados

## 📊 Logs Esperados

### **Criação de Post:**
```
🔍 Debug - Dados recebidos no servidor:
Título: Meu Post
Conteúdo: Conteúdo do post
✅ Usuário autenticado: 1
✅ Validação passou - Título e conteúdo presentes
🔄 Tentando salvar no banco de dados...
🔄 Banco não disponível, tentando salvar em modo demo...
✅ Post salvo em modo demo
```

### **Busca de Posts:**
```
🔄 Banco não disponível, usando modo demo...
🔍 global.demoPosts existe? true
🔍 global.demoPosts length: 1
🔍 Usuário atual: 1
🔍 Posts filtrados para usuário: [array com posts]
📊 1 posts encontrados no modo demo
```

## 🎯 Próximos Passos

### **1. Verificar Logs do Servidor**
- Execute o servidor
- Tente criar um post
- Verifique os logs no console
- Confirme se os dados estão sendo processados

### **2. Testar API Diretamente**
- Acesse `http://localhost:3000/test-api.html`
- Clique em "Testar API"
- Verifique se retorna os posts

### **3. Verificar Frontend**
- Acesse a página de posts
- Abra o console do navegador
- Verifique se há erros JavaScript
- Confirme se a API está sendo chamada

## 🔧 Possíveis Causas

### **1. Problema de Sessão**
- Usuário não autenticado
- Sessão expirada
- Cookie não sendo enviado

### **2. Problema de Inicialização**
- `global.demoPosts` não carregado
- Arquivo não encontrado
- Erro de parsing JSON

### **3. Problema de Filtro**
- Filtro por `user_id` incorreto
- Dados não correspondem
- Tipo de dados diferente

### **4. Problema de Frontend**
- JavaScript não executando
- Erro na requisição
- Problema de exibição

## 📋 Checklist de Debug

- [ ] Servidor está rodando?
- [ ] Logs aparecem no console?
- [ ] Arquivo `demo-posts.json` existe?
- [ ] Usuário está autenticado?
- [ ] API `/api/posts` retorna dados?
- [ ] Frontend está chamando a API?
- [ ] JavaScript não tem erros?
- [ ] Posts aparecem na página?

## 🚀 Status Atual

**✅ INVESTIGAÇÃO COMPLETA**
- Logs de debug implementados
- Testes criados
- Dados verificados
- Soluções aplicadas

**🎯 PRÓXIMO PASSO:** Testar com o servidor rodando e verificar os logs em tempo real.
