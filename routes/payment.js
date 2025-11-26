const express = require('express');
const router = express.Router();

// Configuração do Stripe (usar chaves de teste por enquanto)
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? require('stripe')(stripeSecret) : null;

// Planos disponíveis
const PLANS = {
    basic: {
        name: 'Básico',
        price: 0,
        features: ['6 posts por mês', 'Templates básicos', 'Customização de cores', 'Suporte por email']
    },
    premium: {
        name: 'Premium',
        price: 39.50,
        features: ['50 posts por mês', 'Todos os templates', 'Text-to-Speech', 'Vídeos com narração', 'Suporte prioritário']
    }
};

// Config Stripe: publicar chave pública para o frontend
router.get('/config', (req, res) => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
        return res.status(500).json({ error: 'STRIPE_PUBLISHABLE_KEY ausente' });
    }
    res.json({ publishableKey });
});

// Criar Assinatura Recorrente
router.post('/create-subscription', async (req, res) => {
    try {
        const { plan, billingName, billingEmail, paymentMethodId, customerId } = req.body;
        
        console.log('💳 Criando Assinatura:', { plan, billingName, billingEmail });
        
        // Validar plano
        if (!PLANS[plan]) {
            return res.status(400).json({ error: 'Plano inválido' });
        }
        
        // IDs dos produtos no Stripe (obtenha no dashboard do Stripe)
        if (!stripe) {
            return res.status(500).json({ error: 'Stripe não configurado' });
        }
        const STRIPE_PRODUCTS = {
            basic: process.env.STRIPE_BASIC_PRICE_ID,
            premium: process.env.STRIPE_PREMIUM_PRICE_ID
        };
        if (!STRIPE_PRODUCTS[plan]) {
            return res.status(500).json({ error: 'PRICE_ID ausente para o plano' });
        }
        
        // Usar customer existente se fornecido, senão criar
        let customer;
        if (customerId) {
            customer = await stripe.customers.retrieve(customerId);
            // atualizar dados (opcional)
            await stripe.customers.update(customerId, {
                email: billingEmail,
                name: billingName,
                metadata: { userId: req.session.userId || 'demo', plan }
            });
        } else {
            customer = await stripe.customers.create({
                email: billingEmail,
                name: billingName,
                metadata: {
                    userId: req.session.userId || 'demo',
                    plan: plan
                }
            });
        }
        
        // Anexar método de pagamento ao cliente
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
        await stripe.customers.update(customer.id, {
            invoice_settings: { default_payment_method: paymentMethodId }
        });

        // Criar Assinatura
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: STRIPE_PRODUCTS[plan] }],
            metadata: { plan, userId: req.session.userId || 'demo' },
            expand: ['latest_invoice.payment_intent']
        });
        
        console.log('✅ Assinatura criada:', subscription.id);
        
        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            status: subscription.status
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar assinatura:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
});

// Webhook do Stripe (para produção)
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('❌ Erro no webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Tratar eventos de assinatura
    switch (event.type) {
        case 'customer.subscription.created':
            const subscriptionCreated = event.data.object;
            console.log('✅ Assinatura criada:', subscriptionCreated.id);
            updateUserSubscription(subscriptionCreated.metadata.userId, subscriptionCreated.metadata.plan, 'active');
            break;
            
        case 'customer.subscription.updated':
            const subscriptionUpdated = event.data.object;
            console.log('🔄 Assinatura atualizada:', subscriptionUpdated.id);
            updateUserSubscription(subscriptionUpdated.metadata.userId, subscriptionUpdated.metadata.plan, subscriptionUpdated.status);
            break;
            
        case 'customer.subscription.deleted':
            const subscriptionDeleted = event.data.object;
            console.log('❌ Assinatura cancelada:', subscriptionDeleted.id);
            updateUserSubscription(subscriptionDeleted.metadata.userId, 'basic', 'canceled');
            break;
            
        case 'invoice.payment_succeeded':
            const invoiceSucceeded = event.data.object;
            console.log('✅ Pagamento da fatura bem-sucedido:', invoiceSucceeded.id);
            break;
            
        case 'invoice.payment_failed':
            const invoiceFailed = event.data.object;
            console.log('❌ Pagamento da fatura falhou:', invoiceFailed.id);
            // Notificar usuário sobre falha no pagamento
            break;
            
        default:
            console.log(`Evento não tratado: ${event.type}`);
    }
    
    res.json({received: true});
});

// Atualizar assinatura do usuário
async function updateUserSubscription(userId, plan, status) {
    try {
        console.log(`🔄 Atualizando assinatura do usuário ${userId}: ${plan} (${status})`);
        
        // Aqui você implementaria a lógica para atualizar a assinatura no banco de dados
        // Exemplo de implementação:
        /*
        const mysql = require('mysql2/promise');
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        await pool.execute(
            'UPDATE users SET plan = ?, subscription_status = ? WHERE id = ?',
            [plan, status, userId]
        );
        */
        
        console.log(`✅ Assinatura atualizada: ${plan} (${status})`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar assinatura:', error);
    }
}

// Obter planos disponíveis
router.get('/plans', (req, res) => {
    res.json(PLANS);
});

// Gerenciar assinatura
router.get('/subscription/:subscriptionId', async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        res.json({
            id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            plan: subscription.metadata.plan,
            customer: subscription.customer
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar assinatura:', error);
        res.status(500).json({ error: 'Erro ao buscar assinatura' });
    }
});

// Cancelar assinatura
router.post('/cancel-subscription/:subscriptionId', async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });
        
        res.json({
            message: 'Assinatura será cancelada no final do período atual',
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: subscription.current_period_end
        });
        
    } catch (error) {
        console.error('❌ Erro ao cancelar assinatura:', error);
        res.status(500).json({ error: 'Erro ao cancelar assinatura' });
    }
});

// Reativar assinatura
router.post('/reactivate-subscription/:subscriptionId', async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false
        });
        
        res.json({
            message: 'Assinatura reativada com sucesso',
            cancel_at_period_end: subscription.cancel_at_period_end
        });
        
    } catch (error) {
        console.error('❌ Erro ao reativar assinatura:', error);
        res.status(500).json({ error: 'Erro ao reativar assinatura' });
    }
});

// Portal de cobrança do Stripe
router.post('/create-portal-session', async (req, res) => {
    try {
        const { customerId, returnUrl } = req.body;
        
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || 'http://localhost:3000/dashboard'
        });
        
        res.json({
            url: session.url
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar portal de cobrança:', error);
        res.status(500).json({ error: 'Erro ao criar portal de cobrança' });
    }
});

module.exports = router;
// Ativar plano gratuito (Básico)
router.post('/activate-free-plan', async (req, res) => {
    try {
        const { name, email } = req.body || {};
        const userId = req.session.userId || 'demo';
        console.log('🆓 Ativando plano gratuito para usuário:', { userId, name, email });

        // Marcar na sessão
        req.session.plan = 'basic';
        req.session.subscription_status = 'active';

        // Opcional: persistir em banco (exemplo comentado)
        // await pool.execute('UPDATE users SET plan = ?, subscription_status = ? WHERE id = ?', ['basic', 'active', userId]);

        return res.json({ success: true, plan: 'basic', status: 'active' });
    } catch (error) {
        console.error('❌ Erro ao ativar plano gratuito:', error);
        return res.status(500).json({ error: 'Erro interno ao ativar plano gratuito' });
    }
});
