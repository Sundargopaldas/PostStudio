# 💳 Configuração Stripe - PostStudio I.A

## 📋 **Passo a Passo para Configurar Pagamentos**

### 1. **Criar Conta no Stripe**

1. Acesse: https://stripe.com
2. Clique em "Criar conta"
3. Preencha os dados da sua empresa
4. Verifique seu email

### 2. **Obter Chaves da API**

1. No dashboard do Stripe, vá em "Desenvolvedores" → "Chaves da API"
2. Copie as chaves de **teste** (começam com `sk_test_` e `pk_test_`)

### 3. **Configurar Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Stripe
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui

# Configurações do servidor
PORT=3000
NODE_ENV=development
```

### 4. **Atualizar Chaves no Código**

**No arquivo `public/payment.html` (linha ~200):**
```javascript
const stripe = Stripe('pk_test_SUA_CHAVE_PUBLICA_AQUI');
```

**No arquivo `routes/payment.js` (linha ~5):**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

### 5. **Testar Pagamentos**

#### **Cartões de Teste:**

| Tipo | Número | CVV | Data |
|------|--------|-----|------|
| **Sucesso** | 4242 4242 4242 4242 | 123 | 12/25 |
| **Falha** | 4000 0000 0000 0002 | 123 | 12/25 |
| **3D Secure** | 4000 0025 0000 3155 | 123 | 12/25 |

#### **Fluxo de Teste:**

1. Acesse: http://localhost:3000/payment
2. Selecione um plano
3. Use cartão de teste: `4242 4242 4242 4242`
4. Preencha os dados
5. Clique em "Pagar"
6. Verifique redirecionamento para página de sucesso

### 6. **Configurar Webhooks (Produção)**

1. No dashboard Stripe, vá em "Desenvolvedores" → "Webhooks"
2. Clique em "Adicionar endpoint"
3. URL: `https://seudominio.com/api/webhook`
4. Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copie o "Signing secret"

### 7. **Configurações de Produção**

#### **Chaves de Produção:**
- Substitua `sk_test_` por `sk_live_`
- Substitua `pk_test_` por `pk_live_`
- Configure webhook com URL de produção

#### **Configurações de Segurança:**
```env
NODE_ENV=production
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_webhook_aqui
```

## 🎯 **Funcionalidades Implementadas**

✅ **Página de Pagamento** - Interface moderna e responsiva
✅ **3 Planos Disponíveis** - Básico, Premium, Pro
✅ **Stripe Elements** - Formulário de cartão seguro
✅ **Validação de Dados** - Verificação de campos obrigatórios
✅ **Página de Sucesso** - Confirmação de pagamento
✅ **Webhooks** - Processamento automático
✅ **Responsivo** - Funciona em mobile e desktop

## 💰 **Planos Disponíveis**

| Plano | Preço | Recursos |
|-------|--------|---------|
| **Básico** | R$ 29,90/mês | 10 posts, templates básicos |
| **Premium** | R$ 59,90/mês | 50 posts, Text-to-Speech |
| **Pro** | R$ 99,90/mês | Posts ilimitados, API |

## 🔧 **Troubleshooting**

### Erro: "Invalid API Key"
- Verifique se as chaves estão corretas
- Certifique-se de usar chaves de teste em desenvolvimento

### Erro: "Payment Intent not found"
- Verifique se o servidor está rodando
- Confirme se as rotas estão configuradas

### Erro: "Webhook signature verification failed"
- Verifique se o webhook secret está correto
- Confirme se a URL do webhook está acessível

## 🚀 **Próximos Passos**

1. **Configurar chaves Stripe** (siga o guia acima)
2. **Testar pagamentos** com cartões de teste
3. **Configurar webhooks** para produção
4. **Implementar lógica de assinatura** no banco de dados

---

**🎉 Sistema de pagamento configurado com sucesso!**
