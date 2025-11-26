# 🧪 Teste da Página de Pagamento - Guia Rápido

## ✅ Pré-requisitos (JÁ CONFIGURADOS):
- ✅ Servidor rodando na porta 3000
- ✅ Chaves do Stripe configuradas
- ✅ API `/api/config` funcionando

---

## 🚀 PASSO A PASSO PARA TESTAR:

### 1. **Abra a página de pagamento:**
```
http://localhost:3000/payment
```

### 2. **O que você DEVE ver:**
- ✅ Página carrega sem erros
- ✅ NÃO aparece mensagem "Configure as chaves do Stripe"
- ✅ Dois planos: Básico e Premium
- ✅ Formulário de pagamento

### 3. **Selecione um plano:**
- Clique no botão **"Escolher Plano"** do plano Premium
- O formulário de pagamento deve aparecer

### 4. **Preencha os dados de teste:**

**Dados do Cartão:**
```
Número: 4242 4242 4242 4242
Data:   12/25
CVV:    123
```

**Dados do Cliente:**
```
Nome:   João Silva
Email:  teste@exemplo.com
```

### 5. **Clique em "Pagar"**

### 6. **O que deve acontecer:**
- ✅ Aparece loading "Processando Pagamento"
- ✅ Pagamento é processado
- ✅ Redirecionamento para página de sucesso
- ✅ OU mensagem de confirmação

---

## 💳 CARTÕES DE TESTE ADICIONAIS:

### ✅ Para testar APROVAÇÃO:
```
4242 4242 4242 4242
```

### ❌ Para testar RECUSA:
```
4000 0000 0000 0002
```

### 🔐 Para testar 3D SECURE:
```
4000 0025 0000 3155
```

### 💳 Outros cartões:
```
Visa:       4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Amex:       3782 822463 10005 (CVV: 1234)
```

**Para todos:**
- **Data:** Qualquer data futura (ex: 12/25, 01/26, etc)
- **CVV:** Qualquer 3 dígitos (ou 4 para Amex)

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO:

### ✅ Sinais de SUCESSO:
1. Página carrega sem erros
2. Formulário de cartão aparece
3. Não há mensagem de erro sobre configuração
4. Console do navegador sem erros críticos

### ❌ Se algo der errado:

**1. Abra o Console do Navegador:**
- Pressione `F12`
- Vá na aba "Console"
- Veja se há erros em vermelho

**2. Erros comuns e soluções:**

| Erro | Solução |
|------|---------|
| "Stripe não configurado" | Recarregue a página (F5) |
| "Failed to fetch" | Verifique se o servidor está rodando |
| "Network error" | Verifique sua conexão de internet |
| Página em branco | Abra o console (F12) e veja os erros |

---

## 📊 VERIFICAR NO DASHBOARD DO STRIPE:

Após fazer um teste de pagamento:

1. **Acesse:** https://dashboard.stripe.com/test/payments
2. **Faça login** com sua conta Stripe
3. **Veja os pagamentos de teste** processados

Você verá todos os pagamentos de teste que fizer!

---

## 🎯 CHECKLIST DE TESTE COMPLETO:

- [ ] Página carrega sem erros
- [ ] Sem mensagem "Configure as chaves"
- [ ] Consigo selecionar um plano
- [ ] Formulário de cartão aparece
- [ ] Consigo preencher os dados do cartão
- [ ] Botão "Pagar" está habilitado
- [ ] Pagamento processa (loading aparece)
- [ ] Recebo confirmação de sucesso
- [ ] (Opcional) Pagamento aparece no dashboard Stripe

---

## 💡 DICAS:

1. **Use sempre cartões de TESTE** (que começam com 4242, 4000, etc)
2. **Não use cartões reais** enquanto estiver em modo teste
3. **Os pagamentos de teste não são cobrados**
4. **Você pode fazer quantos testes quiser**

---

## 🆘 PROBLEMAS?

Se encontrar algum erro, me informe:
- Qual erro aparece?
- Em que etapa acontece?
- O que aparece no console do navegador (F12)?

---

**🎊 Boa sorte com o teste!**

