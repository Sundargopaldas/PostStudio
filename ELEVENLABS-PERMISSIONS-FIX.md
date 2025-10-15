# 🔑 Correção de Permissões ElevenLabs

## ✅ **Problema Identificado**
A API key está funcionando, mas está faltando a permissão `voices_read` para executar operações.

**Erro específico:** `"The API key you used is missing the permission voices_read to execute this operation."`

## 🛠️ **Solução**

### 1. **Acesse o Dashboard ElevenLabs**
1. Vá para: https://elevenlabs.io/app/settings
2. Faça login na sua conta
3. Vá para a seção "API Keys"

### 2. **Verifique as Permissões da API Key**
- Procure pela sua API key: `sk_913f7bc37d29ff05ed43175dd4ebbfc0148d8937b36f7cf6`
- Verifique se as seguintes permissões estão habilitadas:
  - ✅ `voices_read` (para listar vozes)
  - ✅ `text_to_speech` (para gerar áudio)
  - ✅ `user_read` (para informações do usuário)

### 3. **Se as Permissões Estiverem Faltando**
- **Opção A:** Edite a API key existente e adicione as permissões necessárias
- **Opção B:** Crie uma nova API key com todas as permissões

### 4. **Permissões Necessárias para o PostStudio**
```
✅ voices_read - Para listar vozes disponíveis
✅ text_to_speech - Para gerar áudio
✅ user_read - Para informações da conta
```

## 🔧 **Passos Detalhados**

### **Método 1: Editar API Key Existente**
1. No dashboard ElevenLabs, vá para "API Keys"
2. Encontre sua API key atual
3. Clique em "Edit" ou "Configurar"
4. Marque todas as permissões necessárias
5. Salve as alterações

### **Método 2: Criar Nova API Key**
1. No dashboard ElevenLabs, vá para "API Keys"
2. Clique em "Create New API Key"
3. Dê um nome (ex: "PostStudio Integration")
4. **IMPORTANTE:** Marque todas as permissões:
   - ✅ voices_read
   - ✅ text_to_speech
   - ✅ user_read
5. Copie a nova API key
6. Atualize nos arquivos do sistema

## 📁 **Arquivos que Precisam ser Atualizados**

Se você criar uma nova API key, atualize estes arquivos:

1. **`public/text-to-speech.js`** (linha 4)
2. **`public/developer-test-fixed.html`** (linha 202)

## 🧪 **Teste Após Correção**

Após corrigir as permissões, execute:

```bash
node test-elevenlabs-final.js
```

**Resultado esperado:**
- ✅ Status 200 (sucesso)
- ✅ Lista de vozes carregada
- ✅ Funcionalidade completa

## 📞 **Suporte Adicional**

Se o problema persistir:
1. Verifique se sua conta ElevenLabs tem um plano ativo
2. Confirme se há créditos disponíveis
3. Entre em contato com o suporte ElevenLabs

---

**Status Atual:** ❌ Permissões insuficientes
**Ação Necessária:** Adicionar permissões `voices_read` e `text_to_speech`
**Próximo Passo:** Atualizar permissões no dashboard ElevenLabs
