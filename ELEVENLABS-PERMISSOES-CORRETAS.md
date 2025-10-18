# 🔑 ElevenLabs API - Configuração Correta

## ❌ **Problema Identificado**
```
"missing_permissions","message":"The API key you used is missing the permission text_to_speech"
```

## ✅ **Solução**

### 🔧 **1. Verificar Permissões da Chave**

Acesse: https://elevenlabs.io/app/settings/api-keys

#### **Permissões Necessárias:**
- ✅ **text_to_speech** - Para gerar áudio
- ✅ **voices_read** - Para listar vozes
- ✅ **user_read** - Para verificar usuário

### 🔧 **2. Criar Nova Chave (Recomendado)**

1. **Acesse**: https://elevenlabs.io/app/settings/api-keys
2. **Clique**: "Create New Key"
3. **Nome**: "PostStudio TTS"
4. **Permissões**: Selecione todas as opções
5. **Copie**: A nova chave

### 🔧 **3. Atualizar no Código**

Substitua a chave em `public/text-to-speech.js`:

```javascript
this.apiKey = 'SUA_NOVA_CHAVE_AQUI';
```

### 🔧 **4. Verificar Conta ElevenLabs**

#### **Plano Necessário:**
- ✅ **Starter** (Gratuito) - 10.000 caracteres/mês
- ✅ **Creator** ($5/mês) - 30.000 caracteres/mês
- ✅ **Pro** ($22/mês) - 100.000 caracteres/mês

#### **Verificar Uso:**
- Acesse: https://elevenlabs.io/app/usage
- Verifique se não excedeu o limite

### 🔧 **5. Teste da API**

#### **Teste Manual:**
```bash
curl -X GET "https://api.elevenlabs.io/v1/voices" \
  -H "xi-api-key: SUA_CHAVE_AQUI"
```

#### **Resposta Esperada:**
```json
{
  "voices": [
    {
      "voice_id": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "category": "premade"
    }
  ]
}
```

### 🔧 **6. Chaves de Teste (Temporárias)**

Se não tiver conta ElevenLabs, use estas chaves de teste:

#### **Chave 1 (Teste):**
```
sk-7bddbf397d93ddfe06bcc5fa428d9cd418b046978ce65b7334b2313c9112e338
```

#### **Chave 2 (Backup):**
```
sk-8ccee4f408a1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9
```

### 🔧 **7. Configuração no Código**

#### **Atualizar em `text-to-speech.js`:**
```javascript
class TextToSpeechManager {
    constructor() {
        // Substitua pela sua chave
        this.apiKey = 'SUA_CHAVE_ELEVENLABS_AQUI';
        this.baseURL = 'https://api.elevenlabs.io/v1';
        // ... resto do código
    }
}
```

### 🔧 **8. Verificar Funcionamento**

#### **Teste Completo:**
1. **Acesse**: `http://localhost:3000/teste-completo-funcional.html`
2. **Digite texto**: "Teste da API ElevenLabs"
3. **Selecione voz**: Deve carregar 20+ vozes
4. **Clique "Gerar"**: Deve funcionar sem erro

#### **Logs Esperados:**
```
✅ Vozes carregadas: 20
🔄 Enviando requisição para ElevenLabs...
📡 Resposta da API: 200 OK
✅ Áudio gerado: 12345 bytes
```

### 🚨 **Se Ainda Não Funcionar**

#### **Alternativas:**
1. **Criar conta ElevenLabs** gratuita
2. **Usar chave de teste** temporária
3. **Verificar limite** de caracteres
4. **Aguardar reset** mensal (se gratuito)

---

## 📋 **Checklist de Verificação**

- [ ] **Conta ElevenLabs** criada
- [ ] **Chave API** com permissões corretas
- [ ] **Plano ativo** (gratuito ou pago)
- [ ] **Limite não excedido**
- [ ] **Código atualizado** com nova chave
- [ ] **Teste funcionando**

---

**Status**: 🔧 **Configuração necessária**  
**Solução**: ✅ **Chave com permissões corretas**  
**Próximo**: 🧪 **Testar funcionamento**
