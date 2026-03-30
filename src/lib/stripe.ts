import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2026-03-25.dahlia' as any,
    appInfo: {
        name: 'Mentor CRM',
        version: '0.1.0'
    }
});

export const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;
