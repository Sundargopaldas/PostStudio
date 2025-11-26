# 🚀 Configuração Rápida de Pagamentos - PostStudio

## ⚡ Configuração em 2 Minutos

### Opção 1: Usar Script Automático (RECOMENDADO)

Execute este comando no terminal:

```bash
node setup-payment-keys.js
```

Isso criará automaticamente o arquivo `.env` com chaves de teste do Stripe.

### Opção 2: Configuração Manual

1. **Copie o arquivo de exemplo:**
   ```bash
   copy env.example .env
   ```

2. **Abra o arquivo `.env` e adicione estas chaves de TESTE:**

```env
# Stripe Configuration (Substitua pelas suas chaves reais)
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui
```

3. **Salve o arquivo**

4. **Reinicie o servidor:**
   ```bash
   npm start
   ```

## 🧪 Testar Pagamentos

1. Acesse: http://localhost:3000/payment
2. Use o cartão de teste: `4242 4242 4242 4242`
3. Data: Qualquer data futura (ex: 12/25)
4. CVV: Qualquer 3 dígitos (ex: 123)
5. Nome: Qualquer nome

## ✅ Verificar se Funcionou

Se a página de pagamento carregar sem a mensagem de erro "Configure as chaves", está funcionando! ✨

## 🇧🇷 Para Usar Mercado Pago (Pagamentos no Brasil)

Se você preferir Mercado Pago (PIX, Boleto, etc):

1. Crie conta em: https://www.mercadopago.com.br
2. Obtenha suas chaves em: Desenvolvedores → Suas integrações
3. Adicione no `.env`:
```env
MERCADO_PAGO_PUBLIC_KEY=APP_USR_sua_chave_aqui
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_seu_token_aqui
```
4. Use a página: http://localhost:3000/payment-mercado-pago

## 🆘 Problemas?

### Erro: "Stripe não configurado"
- ✅ Verifique se o arquivo `.env` existe na raiz do projeto
- ✅ Verifique se as chaves estão corretas no `.env`
- ✅ Reinicie o servidor (Ctrl+C e depois `npm start`)

### Erro: "Module not found"
```bash
npm install
```

### Servidor não inicia
```bash
npm install
node server.js
```

