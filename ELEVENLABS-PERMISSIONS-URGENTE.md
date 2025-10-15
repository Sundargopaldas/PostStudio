# 🔑 Guia Urgente: Corrigir Permissões ElevenLabs

## ❌ **Problema Atual**
A nova API key `cbd6126f20d33eff563d35d1ec2853da2884e3b50dac89206420196b6ec390de` ainda está faltando a permissão `voices_read`.

**Erro:** `"The API key you used is missing the permission voices_read to execute this operation."`

## 🛠️ **Solução Passo-a-Passo**

### **Passo 1: Acessar o Dashboard ElevenLabs**
1. Vá para: https://elevenlabs.io/app/settings
2. Faça login na sua conta
3. Clique em **"API Keys"** no menu lateral

### **Passo 2: Encontrar sua Nova API Key**
1. Procure pela API key: `cbd6126f20d33eff563d35d1ec2853da2884e3b50dac89206420196b6ec390de`
2. Você deve ver uma lista com:
   - Nome da chave
   - Data de criação
   - **Permissões atuais** (IMPORTANTE!)

### **Passo 3: Verificar Permissões Atuais**
A API key provavelmente tem apenas:
- ❌ `text_to_speech` (para gerar áudio)
- ❌ `user_read` (para informações da conta)

**MAS FALTA:**
- ❌ `voices_read` (para listar vozes disponíveis)

### **Passo 4: Adicionar Permissões**
1. Clique em **"Edit"** ou **"Configure"** na sua API key
2. Você verá uma lista de permissões
3. **MARQUE TODAS AS PERMISSÕES:**
   - ✅ `voices_read` (IMPORTANTE!)
   - ✅ `text_to_speech`
   - ✅ `user_read`
   - ✅ Qualquer outra permissão disponível
4. Clique em **"Save"** ou **"Update"**

### **Passo 5: Salvar Alterações**
1. Clique em **"Save"** ou **"Update"**
2. Confirme as alterações
3. A API key agora deve ter todas as permissões

## 🔄 **Alternativa: Criar Nova API Key**

Se não conseguir editar a API key existente:

### **Passo 1: Criar Nova API Key**
1. No dashboard, clique em **"Create New API Key"**
2. Dê um nome: **"PostStudio Integration"**
3. **IMPORTANTE:** Marque TODAS as permissões disponíveis:
   - ✅ `voices_read` (IMPORTANTE!)
   - ✅ `text_to_speech`
   - ✅ `user_read`
   - ✅ Qualquer outra permissão
4. Clique em **"Create"**

### **Passo 2: Copiar Nova API Key**
1. Copie a nova API key
2. **IMPORTANTE:** Salve em local seguro

### **Passo 3: Atualizar no Sistema**
Se você criar uma nova API key, atualize estes arquivos:

1. **`public/text-to-speech.js`** (linha 4)
2. **`public/developer-test-fixed.html`** (linha 202)

## 🧪 **Teste Após Correção**

Após corrigir as permissões, execute:

```bash
node test-api-key-final.js
```

**Resultado esperado:**
- ✅ Status 200 (sucesso)
- ✅ Lista de vozes carregada
- ✅ Geração de áudio funcionando

## 📞 **Se o Problema Persistir**

### **Verificações Adicionais:**
1. **Plano ElevenLabs:** Confirme se tem um plano ativo
2. **Créditos:** Verifique se há créditos disponíveis
3. **Conta:** Confirme se a conta está ativa

### **Contato Suporte ElevenLabs:**
- Email: support@elevenlabs.io
- Discord: https://discord.gg/elevenlabs
- Documentação: https://docs.elevenlabs.io/

## 🎯 **Resultado Final**

Após corrigir as permissões:
- ✅ Text-to-Speech funcionando
- ✅ Vozes de alta qualidade disponíveis
- ✅ Integração completa no PostStudio
- ✅ Narrações automáticas funcionando

---

**Status Atual:** ❌ Permissões insuficientes
**Ação Necessária:** Adicionar permissão `voices_read`
**Tempo Estimado:** 2-3 minutos
