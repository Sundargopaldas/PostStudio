# 🔄 Configuração de Assinaturas Recorrentes - Stripe

## 📋 **Por que Assinaturas Recorrentes?**

### ✅ **Vantagens:**
- **💰 Receita Previsível** - Renda mensal constante
- **🔄 Renovação Automática** - Usuários não precisam lembrar de pagar
- **📈 Crescimento Sustentável** - Base de clientes fiel
- **🛠️ Menos Suporte** - Menos problemas de pagamento
- **📊 Analytics Melhor** - Métricas de retenção e churn

## 🚀 **Configuração no Stripe Dashboard**

### 1. **Criar Produtos e Preços**

1. Acesse: https://dashboard.stripe.com/products
2. Clique em "Adicionar produto"

#### **Produto: PostStudio I.A - Básico**
- **Nome:** PostStudio I.A - Plano Básico
- **Descrição:** 10 posts por mês, templates básicos
- **Preço:** R$ 29,90/mês (recorrente)
- **Moeda:** BRL (Real Brasileiro)

#### **Produto: PostStudio I.A - Premium**
- **Nome:** PostStudio I.A - Plano Premium
- **Descrição:** 50 posts por mês, Text-to-Speech
- **Preço:** R$ 59,90/mês (recorrente)
- **Moeda:** BRL (Real Brasileiro)

#### **Produto: PostStudio I.A - Pro**
- **Nome:** PostStudio I.A - Plano Pro
- **Descrição:** Posts ilimitados, API personalizada
- **Preço:** R$ 99,90/mês (recorrente)
- **Moeda:** BRL (Real Brasileiro)

### 2. **Obter IDs dos Produtos**

Após criar os produtos, copie os IDs:
- **Produto ID:** `prod_xxxxxxxxxxxxx`
- **Price ID:** `price_xxxxxxxxxxxxx`

### 3. **Atualizar Código com IDs Reais**

**No arquivo `routes/payment.js` (linha ~40):**
```javascript
const STRIPE_PRODUCTS = {
    basic: 'price_xxxxxxxxxxxxx', // ID do preço do plano básico
    premium: 'price_xxxxxxxxxxxxx', // ID do preço do plano premium
    pro: 'price_xxxxxxxxxxxxx' // ID do preço do plano pro
};
```

## 🔧 **Configuração de Webhooks**

### 1. **Criar Webhook Endpoint**

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Adicionar endpoint"
3. **URL:** `https://seudominio.com/api/webhook`
4. **Eventos a escutar:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 2. **Configurar Variáveis de Ambiente**

```env
# Configurações do Stripe
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_webhook_aqui

# Configurações do servidor
PORT=3000
NODE_ENV=development
```

## 💳 **Fluxo de Assinatura**

### 1. **Usuário Seleciona Plano**
- Acessa `/payment`
- Escolhe plano (Básico, Premium, Pro)
- Preenche dados de cobrança

### 2. **Criação da Assinatura**
- Sistema cria `Customer` no Stripe
- Cria `Subscription` com o plano selecionado
- Processa pagamento inicial

### 3. **Renovação Automática**
- Stripe cobra automaticamente todo mês
- Webhook notifica sobre sucesso/falha
- Sistema atualiza status do usuário

## 🛠️ **Funcionalidades Implementadas**

### ✅ **Criação de Assinatura**
```javascript
POST /api/create-subscription
{
    "plan": "premium",
    "billingName": "João Silva",
    "billingEmail": "joao@email.com",
    "paymentMethodId": "pm_xxxxxxxxxxxxx"
}
```

### ✅ **Gerenciamento de Assinatura**
```javascript
GET /api/subscription/:subscriptionId
POST /api/cancel-subscription/:subscriptionId
POST /api/reactivate-subscription/:subscriptionId
```

### ✅ **Portal de Cobrança**
```javascript
POST /api/create-portal-session
{
    "customerId": "cus_xxxxxxxxxxxxx",
    "returnUrl": "http://localhost:3000/dashboard"
}
```

## 📊 **Eventos de Webhook**

| Evento | Descrição | Ação |
|--------|-----------|------|
| `customer.subscription.created` | Assinatura criada | Ativar plano do usuário |
| `customer.subscription.updated` | Assinatura atualizada | Atualizar status |
| `customer.subscription.deleted` | Assinatura cancelada | Rebaixar para plano básico |
| `invoice.payment_succeeded` | Pagamento bem-sucedido | Manter plano ativo |
| `invoice.payment_failed` | Pagamento falhou | Notificar usuário |

## 🧪 **Testando Assinaturas**

### **Cartões de Teste:**
- **Sucesso:** `4242 4242 4242 4242`
- **Falha:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

### **Fluxo de Teste:**
1. Acesse: http://localhost:3000/payment
2. Selecione um plano
3. Use cartão de teste
4. Verifique criação da assinatura
5. Teste renovação automática

## 🔄 **Gerenciamento de Assinaturas**

### **Portal do Cliente:**
- Usuários podem gerenciar assinaturas
- Atualizar método de pagamento
- Baixar faturas
- Cancelar assinatura

### **Dashboard Admin:**
- Visualizar todas as assinaturas
- Gerenciar cancelamentos
- Analisar métricas de retenção

## 📈 **Métricas Importantes**

### **KPIs de Assinatura:**
- **MRR (Monthly Recurring Revenue)** - Receita recorrente mensal
- **Churn Rate** - Taxa de cancelamento
- **LTV (Lifetime Value)** - Valor vitalício do cliente
- **CAC (Customer Acquisition Cost)** - Custo de aquisição

## 🚀 **Próximos Passos**

1. **Criar produtos no Stripe Dashboard**
2. **Atualizar IDs no código**
3. **Configurar webhooks**
4. **Testar fluxo completo**
5. **Implementar lógica de banco de dados**
6. **Configurar para produção**

---

**🎉 Sistema de assinaturas recorrentes configurado com sucesso!**
