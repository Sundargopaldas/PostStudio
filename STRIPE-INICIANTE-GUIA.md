# 🚀 Guia Stripe para Iniciantes - PostStudio I.A

## 🎯 **Você está na Área de Teste - Perfeito!**

### ✅ **Por que Área de Teste é Ideal:**
- **🔒 Seguro** - Nenhuma cobrança real
- **🧪 Experimentação** - Teste sem riscos
- **📚 Aprendizado** - Entenda como funciona
- **🛠️ Desenvolvimento** - Desenvolva tranquilamente

## 📋 **Passo a Passo Completo**

### **1. Obter Chaves de API**

1. No dashboard do Stripe, vá em **"Desenvolvedores"** → **"Chaves da API"**
2. Você verá duas chaves:
   - **Chave Pública:** `pk_test_xxxxxxxxxxxxx`
   - **Chave Secreta:** `sk_test_xxxxxxxxxxxxx`

**⚠️ IMPORTANTE:** 
- **Chave Pública** pode ser exposta no frontend
- **Chave Secreta** NUNCA deve ser exposta (apenas no servidor)

### **2. Criar Produtos de Teste**

#### **Produto 1: Plano Básico**
1. Vá em **"Produtos"** → **"Adicionar produto"**
2. Preencha:
   - **Nome:** `PostStudio I.A - Plano Básico`
   - **Descrição:** `10 posts por mês, templates básicos`
   - **Preço:** `R$ 29,90`
   - **Cobrança:** `Recorrente` → `Mensal`
   - **Moeda:** `BRL (Real Brasileiro)`
3. Clique em **"Salvar produto"**
4. **Copie o Price ID** que aparece (começa com `price_`)

#### **Produto 2: Plano Premium**
1. Repita o processo:
   - **Nome:** `PostStudio I.A - Plano Premium`
   - **Descrição:** `50 posts por mês, Text-to-Speech`
   - **Preço:** `R$ 59,90`
   - **Cobrança:** `Recorrente` → `Mensal`
   - **Moeda:** `BRL (Real Brasileiro)`

#### **Produto 3: Plano Pro**
1. Repita o processo:
   - **Nome:** `PostStudio I.A - Plano Pro`
   - **Descrição:** `Posts ilimitados, API personalizada`
   - **Preço:** `R$ 99,90`
   - **Cobrança:** `Recorrente` → `Mensal`
   - **Moeda:** `BRL (Real Brasileiro)`

### **3. Configurar no Projeto**

1. **Copie o arquivo de exemplo:**
   ```bash
   copy stripe-test-config.env .env
   ```

2. **Edite o arquivo `.env`** com suas chaves:
   ```env
   STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI
   STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICA_AQUI
   STRIPE_BASIC_PRICE_ID=price_SUA_CHAVE_BASICO_AQUI
   STRIPE_PREMIUM_PRICE_ID=price_SUA_CHAVE_PREMIUM_AQUI
   STRIPE_PRO_PRICE_ID=price_SUA_CHAVE_PRO_AQUI
   ```

3. **Atualize o código** com os IDs reais:
   - Abra `routes/payment.js`
   - Substitua os IDs dos produtos (linha ~40)

### **4. Testar Pagamentos**

#### **Cartões de Teste:**
- **Sucesso:** `4242 4242 4242 4242`
- **Falha:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

#### **Fluxo de Teste:**
1. Acesse: http://localhost:3000/payment
2. Selecione um plano
3. Use cartão de teste
4. Preencha dados
5. Clique em "Pagar"
6. Verifique redirecionamento

## 🔧 **Configuração de Webhooks (Opcional)**

### **Para Desenvolvimento Local:**
1. Instale o **Stripe CLI**
2. Execute: `stripe listen --forward-to localhost:3000/api/webhook`
3. Copie o webhook secret

### **Para Produção:**
1. Vá em **"Desenvolvedores"** → **"Webhooks"**
2. Clique em **"Adicionar endpoint"**
3. URL: `https://seudominio.com/api/webhook`
4. Eventos: `customer.subscription.*`, `invoice.payment_*`

## 🧪 **Testando Assinaturas**

### **Cenários de Teste:**

#### **1. Assinatura Bem-sucedida**
- Use cartão: `4242 4242 4242 4242`
- Verifique criação da assinatura
- Confirme renovação automática

#### **2. Falha no Pagamento**
- Use cartão: `4000 0000 0000 0002`
- Verifique tratamento de erro
- Teste retry de pagamento

#### **3. 3D Secure**
- Use cartão: `4000 0025 0000 3155`
- Complete autenticação
- Verifique aprovação

## 📊 **Monitoramento**

### **Dashboard do Stripe:**
- **Assinaturas:** Visualize todas as assinaturas
- **Pagamentos:** Histórico de transações
- **Clientes:** Lista de clientes
- **Eventos:** Log de webhooks

### **Métricas Importantes:**
- **MRR:** Receita recorrente mensal
- **Churn:** Taxa de cancelamento
- **LTV:** Valor vitalício do cliente

## 🚀 **Próximos Passos**

### **Desenvolvimento:**
1. ✅ Configurar chaves de teste
2. ✅ Criar produtos de teste
3. ✅ Testar fluxo completo
4. ✅ Implementar lógica de banco

### **Produção (Futuro):**
1. 🔄 Configurar chaves de produção
2. 🔄 Criar produtos reais
3. 🔄 Configurar webhooks
4. 🔄 Testar com cartões reais

## 🆘 **Dúvidas Comuns**

### **P: Posso usar cartões reais na área de teste?**
**R:** Não! A área de teste só aceita cartões de teste.

### **P: Quando devo migrar para produção?**
**R:** Quando estiver satisfeito com os testes e pronto para clientes reais.

### **P: Posso perder dinheiro na área de teste?**
**R:** Não! A área de teste é 100% segura.

### **P: Como sei se está funcionando?**
**R:** Verifique o dashboard do Stripe e os logs do servidor.

---

**🎉 Parabéns! Você está configurando um sistema profissional de pagamentos!**
