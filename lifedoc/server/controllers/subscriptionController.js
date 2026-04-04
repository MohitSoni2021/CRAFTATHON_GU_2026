const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

exports.createCheckoutSession = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Create customer if not exists
        let customerId = user.subscription.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user.id }
            });
            customerId = customer.id;
            user.subscription.stripeCustomerId = customerId;
            await user.save();
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer: customerId,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'LifeDoc Premium',
                            description: 'Unlimited AI Consultations & Advanced Health Analytics',
                        },
                        unit_amount: 999, // $9.99/month
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/pricing`,
            metadata: {
                userId: user.id
            }
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe Session Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.warn("Stripe Webhook Secret not set. Skipping verification (UNSAFE).");
            event = req.body;
        } else {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata.userId;

            await User.findByIdAndUpdate(userId, {
                'subscription.plan': 'premium',
                'subscription.status': 'active',
                'subscription.stripeSubscriptionId': session.subscription,
                'subscription.startDate': new Date(),
                'subscription.endDate': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Rough Estimate, webhook 'invoice.payment_succeeded' is better for recurring
            });
        }

        // Handle recurring payments
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object;
            const customerId = invoice.customer;
            const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });

            if (user) {
                user.subscription.status = 'active';
                user.subscription.endDate = new Date(invoice.lines.data[0].period.end * 1000);
                await user.save();
            }
        }

        // Handle payment failure
        if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object;
            const customerId = invoice.customer;
            await User.findOneAndUpdate(
                { 'subscription.stripeCustomerId': customerId },
                { 'subscription.status': 'past_due' }
            );
        }

        res.json({ received: true });
    } catch (err) {
        console.error(err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

exports.getSubscriptionStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('subscription usage');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
