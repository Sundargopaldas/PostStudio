#!/usr/bin/env node

/**
 * 🚀 Script de Configuração do Stripe - PostStudio I.A
 * 
 * Este script ajuda você a configurar o Stripe rapidamente
 * Execute: node setup-stripe.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Stripe para PostStudio I.A...\n');

// Verificar se o arquivo .env existe
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'stripe-test-config.env');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        console.log('📋 Copiando arquivo de configuração...');
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Arquivo .env criado com sucesso!');
    } else {
        console.log('❌ Arquivo de exemplo não encontrado. Criando .env básico...');
        
        const basicEnv = `# Configurações do Stripe - ÁREA DE TESTE
# Substitua pelos seus valores reais do dashboard

# Chaves de Teste (obtenha em: Desenvolvedores > Chaves da API)
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICA_AQUI

# IDs dos Produtos (obtenha em: Produtos > [seu produto] > Preços)
STRIPE_BASIC_PRICE_ID=price_SUA_CHAVE_BASICO_AQUI
STRIPE_PREMIUM_PRICE_ID=price_SUA_CHAVE_PREMIUM_AQUI
STRIPE_PRO_PRICE_ID=price_SUA_CHAVE_PRO_AQUI

# Configurações do servidor
PORT=3000
NODE_ENV=development

# Configurações do banco de dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=contentflow_ai`;

        fs.writeFileSync(envPath, basicEnv);
        console.log('✅ Arquivo .env criado com sucesso!');
    }
} else {
    console.log('✅ Arquivo .env já existe!');
}

console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Acesse: https://dashboard.stripe.com');
console.log('2. Vá em "Desenvolvedores" > "Chaves da API"');
console.log('3. Copie suas chaves de teste (pk_test_ e sk_test_)');
console.log('4. Vá em "Produtos" > "Adicionar produto"');
console.log('5. Crie 3 produtos com preços recorrentes:');
console.log('   - Básico: R$ 29,90/mês');
console.log('   - Premium: R$ 59,90/mês');
console.log('   - Pro: R$ 99,90/mês');
console.log('6. Copie os Price IDs (price_xxxxxxxxxxxxx)');
console.log('7. Edite o arquivo .env com suas chaves');
console.log('8. Execute: npm start');

console.log('\n🧪 CARTÕES DE TESTE:');
console.log('✅ Sucesso: 4242 4242 4242 4242');
console.log('❌ Falha: 4000 0000 0000 0002');
console.log('🔐 3D Secure: 4000 0025 0000 3155');

console.log('\n📚 GUIAS DISPONÍVEIS:');
console.log('- STRIPE-INICIANTE-GUIA.md (guia completo)');
console.log('- STRIPE-SUBSCRIPTIONS-GUIDE.md (assinaturas)');
console.log('- STRIPE-SETUP-GUIDE.md (configuração)');

console.log('\n🎯 TESTE EM: http://localhost:3000/payment');
console.log('\n🎉 Configuração inicial concluída!');
