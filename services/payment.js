const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

// Subscription plans configuration
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '5 posts per month',
      'Basic templates',
      'Email support'
    ],
    limits: {
      posts: 5,
      templates: 3,
      teamMembers: 1
    }
  },
  basic: {
    name: 'Basic',
    price: 29,
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: [
      '50 posts per month',
      'All templates',
      'Social media integration',
      'Priority support'
    ],
    limits: {
      posts: 50,
      templates: -1, // unlimited
      teamMembers: 3
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Custom branding'
    ],
    limits: {
      posts: -1,
      templates: -1,
      teamMembers: -1
    }
  }
};

// Create Stripe customer
const createCustomer = async (user) => {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
        plan: user.plan || 'free'
      }
    });

    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
};

// Create subscription
const createSubscription = async (customerId, priceId, userId) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId
      }
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
};

// Create payment intent for one-time payments
const createPaymentIntent = async (amount, currency = 'usd', customerId, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
};

// Handle webhook events
const handleWebhook = async (event) => {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};

// Subscription event handlers
const handleSubscriptionCreated = async (subscription) => {
  const userId = subscription.metadata.userId;
  const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
  
  await updateUserPlan(userId, plan, subscription.id);
  console.log(`Subscription created for user ${userId} with plan ${plan}`);
};

const handleSubscriptionUpdated = async (subscription) => {
  const userId = subscription.metadata.userId;
  const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
  
  await updateUserPlan(userId, plan, subscription.id);
  console.log(`Subscription updated for user ${userId} to plan ${plan}`);
};

const handleSubscriptionDeleted = async (subscription) => {
  const userId = subscription.metadata.userId;
  
  await updateUserPlan(userId, 'free', null);
  console.log(`Subscription cancelled for user ${userId}`);
};

const handlePaymentSucceeded = async (invoice) => {
  const userId = invoice.metadata.userId;
  
  // Send confirmation email
  await sendPaymentConfirmationEmail(userId, invoice);
  console.log(`Payment succeeded for user ${userId}`);
};

const handlePaymentFailed = async (invoice) => {
  const userId = invoice.metadata.userId;
  
  // Send payment failed notification
  await sendPaymentFailedEmail(userId, invoice);
  console.log(`Payment failed for user ${userId}`);
};

// Helper functions
const getPlanFromPriceId = (priceId) => {
  for (const [plan, config] of Object.entries(PLANS)) {
    if (config.stripePriceId === priceId) {
      return plan;
    }
  }
  return 'free';
};

const updateUserPlan = async (userId, plan, subscriptionId) => {
  // Update user plan in database
  // This would be implemented with your database logic
  console.log(`Updating user ${userId} to plan ${plan}`);
};

const sendPaymentConfirmationEmail = async (userId, invoice) => {
  // Send email notification
  console.log(`Sending payment confirmation to user ${userId}`);
};

const sendPaymentFailedEmail = async (userId, invoice) => {
  // Send payment failed notification
  console.log(`Sending payment failed notification to user ${userId}`);
};

// Get subscription status
const getSubscriptionStatus = async (customerId) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active'
    });

    if (subscriptions.data.length === 0) {
      return { status: 'inactive', plan: 'free' };
    }

    const subscription = subscriptions.data[0];
    const plan = getPlanFromPriceId(subscription.items.data[0].price.id);

    return {
      status: subscription.status,
      plan: plan,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw new Error('Failed to get subscription status');
  }
};

// Cancel subscription
const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    return subscription;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
};

module.exports = {
  PLANS,
  createCustomer,
  createSubscription,
  createPaymentIntent,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription
};
