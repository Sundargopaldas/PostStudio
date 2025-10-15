# 🎯 Guia Completo: Configurar ElevenLabs no PostStudio

## ❌ **Problema Atual**
Você tem um plano ElevenLabs ativo, mas a API key não está funcionando porque falta a permissão `voices_read`.

## 🛠️ **Solução Passo-a-Passo**

### **Passo 1: Acessar o Dashboard ElevenLabs**
1. Vá para: https://elevenlabs.io/app/settings
2. Faça login na sua conta
3. Clique em **"API Keys"** no menu lateral

### **Passo 2: Verificar sua API Key Atual**
1. Procure pela API key: `889210314c570a3222c4272b2d70cfbe36011cbc5c71442d57c804aeabeed56b`
2. Clique em **"Edit"** ou **"Configure"**

### **Passo 3: Adicionar Permissões (IMPORTANTE!)**
1. Você verá uma lista de permissões
2. **MARQUE TODAS AS PERMISSÕES:**
   - ✅ `voices_read` (IMPORTANTE!)
   - ✅ `text_to_speech`
   - ✅ `user_read`
   - ✅ Qualquer outra permissão disponível
3. Clique em **"Save"** ou **"Update"**

### **Passo 4: Testar a API Key**
Após adicionar as permissões, teste se está funcionando.

## 🔄 **Alternativa: Criar Nova API Key**

Se não conseguir editar a API key existente:

### **Passo 1: Criar Nova API Key**
1. No dashboard, clique em **"Create New API Key"**
2. Dê um nome: **"PostStudio Integration"**
3. **IMPORTANTE:** Marque TODAS as permissões disponíveis
4. Clique em **"Create"**

### **Passo 2: Copiar Nova API Key**
1. Copie a nova API key
2. **IMPORTANTE:** Salve em local seguro

## 🧪 **Teste da API Key**

Após corrigir as permissões, execute este teste:

```bash
node test-elevenlabs-final.js
```

**Resultado esperado:**
- ✅ Status 200 (sucesso)
- ✅ Lista de vozes carregada
- ✅ Geração de áudio funcionando

## 📞 **Se Ainda Não Funcionar**

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
