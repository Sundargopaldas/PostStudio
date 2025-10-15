# 🔑 Verificação da API Key ElevenLabs

## ❌ Problema Identificado
A API key `sk_913f7bc37d29ff05ed43175dd4ebbfc0148d8937b36f7cf6` está retornando erro **401 Unauthorized**.

## 🔍 Possíveis Causas

### 1. **Formato da API Key**
- ✅ Formato correto: `sk_` seguido de caracteres alfanuméricos
- ✅ Sua chave tem o formato correto: `sk_913f7bc37d29ff05ed43175dd4ebbfc0148d8937b36f7cf6`

### 2. **Status da Conta ElevenLabs**
- ❓ Verifique se sua conta ElevenLabs está ativa
- ❓ Confirme se o plano está ativo e não expirado
- ❓ Verifique se há créditos disponíveis

### 3. **Localização da API Key**
- ❓ A chave pode estar incompleta
- ❓ Pode ter caracteres extras ou faltando

## 🛠️ Como Verificar

### 1. **Acesse o Dashboard ElevenLabs**
1. Vá para: https://elevenlabs.io/app/settings
2. Faça login na sua conta
3. Vá para a seção "API Keys"

### 2. **Verifique a API Key**
- Copie a chave completa
- Certifique-se de que não há espaços extras
- A chave deve começar com `sk_`

### 3. **Teste a Chave**
- Use o dashboard ElevenLabs para testar
- Verifique se há créditos disponíveis
- Confirme se o plano está ativo

## 🔧 Próximos Passos

### Se a API Key estiver correta:
1. Verifique se o plano ElevenLabs está ativo
2. Confirme se há créditos disponíveis
3. Teste novamente

### Se a API Key estiver incorreta:
1. Copie a chave correta do dashboard
2. Atualize nos arquivos do sistema
3. Execute o teste novamente

## 📁 Arquivos que Precisam ser Atualizados

Se você tiver uma nova API key, atualize estes arquivos:

1. **`public/text-to-speech.js`** (linha 4)
2. **`public/developer-test-fixed.html`** (linha 202)

## 🧪 Teste Manual

Para testar manualmente, você pode usar este comando curl:

```bash
curl -X GET "https://api.elevenlabs.io/v1/voices" \
  -H "xi-api-key: SUA_API_KEY_AQUI"
```

## 📞 Suporte

Se o problema persistir:
- Verifique o status da conta ElevenLabs
- Entre em contato com o suporte ElevenLabs
- Confirme se há problemas conhecidos no serviço

---

**Status Atual:** ❌ API Key inválida ou expirada
**Ação Necessária:** Verificar e atualizar a API key
