import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '../../../lib/stripeServer';
import { getSupabaseAdminClient } from '../../../lib/supabaseAdmin';

const stripe = getStripe();
const supabaseAdmin = getSupabaseAdminClient();

const PRICE_TO_TIER: Record<string, string> = {
    price_1T1gs9GGuo9uqrPQ5St2K4ih: 'stealth',
    price_1T1gsFGGuo9uqrPQ5IjrrlD1: 'ai',
    price_1RPzlNGGuo9uqrPQRPUlTuwh: 'ai' // legacy price
};

const PRICE_TO_CREDITS: Record<string, number> = {
    price_1T1gs9GGuo9uqrPQ5St2K4ih: 0,
    price_1T1gsFGGuo9uqrPQ5IjrrlD1: 2.5,
    price_1RPzlNGGuo9uqrPQRPUlTuwh: 2.5 // legacy price
};

function extractSubAndCust(obj: any): { subscriptionId?: string; customerId?: string } {
    let subscriptionId: string | undefined;
    let customerId: string | undefined;

    if (typeof obj.customer === 'string') {
        customerId = obj.customer;
    } else if (obj.customer?.id) {
        customerId = obj.customer.id;
    }

    if (typeof obj.subscription === 'string') {
        subscriptionId = obj.subscription;
    } else if (obj.parent?.subscription_details?.subscription) {
        subscriptionId = obj.parent.subscription_details.subscription;
    } else if (obj.lines?.data?.[0]?.parent?.subscription_item_details?.subscription) {
        subscriptionId = obj.lines.data[0].parent.subscription_item_details.subscription;
    }

    return { subscriptionId, customerId };
}

function toISOStringOrNull(ts?: number): string | null {
    return ts ? new Date(ts * 1000).toISOString() : null;
}

async function updateProfile(userId: string, payload: Record<string, any>) {
    const { error } = await supabaseAdmin.from('profiles').update(payload).eq('id', userId);

    if (error) {
        console.error(`DB Error updating profile ${userId}: ${error.message}`);
        throw new Error(error.message);
    }
}

async function findProfileByCustomer(customerId: string) {
    const { data, error } = await supabaseAdmin.from('profiles').select('id, credits, plan_tier').eq('stripe_customer_id', customerId).single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

async function syncSubscription(sub: Stripe.Subscription) {
    const { id: subscriptionId, status } = sub;
    const current_period_end = sub.items.data[0]?.current_period_end;
    const priceId = sub.items.data[0]?.price?.id ?? sub.items.data[0]?.price;
    const { customerId } = extractSubAndCust(sub);

    if (!customerId) {
        console.warn(`Missing customerId for sub ${subscriptionId}, skipping sync.`);
        return;
    }

    const profile = await findProfileByCustomer(customerId);
    if (!profile) {
        console.warn(`No profile for customer ${customerId}, skipping sync.`);
        return;
    }

    const tier = typeof priceId === 'string' ? (PRICE_TO_TIER[priceId] ?? null) : null;

    const payload: Record<string, any> = {
        stripe_subscription_id: subscriptionId,
        subscription_status: status,
        current_period_end: toISOStringOrNull(current_period_end),
        plan_tier: tier
    };

    if (['canceled', 'incomplete_expired'].includes(status)) {
        payload.credits = 0;
        payload.current_period_end = null;
        payload.plan_tier = null;
    }

    await updateProfile(profile.id, payload);
    console.log(`Synced sub ${subscriptionId} (${status}, tier=${tier}) for user ${profile.id}.`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const { subscriptionId, customerId } = extractSubAndCust(invoice);
    if (!subscriptionId || !customerId) {
        console.warn(`Cannot extract IDs for invoice ${invoice.id}, skipping credit grant.`);
        return;
    }

    const sub = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price']
    });
    if (sub.status !== 'active') {
        console.warn(`Sub ${subscriptionId} is ${sub.status}, syncing only.`);
        await syncSubscription(sub);
        return;
    }

    const profile = await findProfileByCustomer(customerId);
    if (!profile) {
        console.warn(`No profile for customer ${customerId}, cannot grant credits.`);
        return;
    }

    const priceId = sub.items.data[0]?.price.id;
    const tier = PRICE_TO_TIER[priceId] ?? null;
    const credits = PRICE_TO_CREDITS[priceId] ?? 0;
    if (!tier) console.warn(`Unknown priceId ${priceId}, no tier or credits assigned.`);

    const periodEnd = toISOStringOrNull(sub.items.data[0]?.current_period_end);

    const payload: Record<string, any> = {
        credits,
        subscription_status: 'active',
        current_period_end: periodEnd,
        stripe_subscription_id: subscriptionId,
        plan_tier: tier
    };

    await updateProfile(profile.id, payload);

    // Increment billing cycle counter for AI plan users
    if (tier === 'ai') {
        await supabaseAdmin.rpc('increment_ai_billing_cycles', { p_user_id: profile.id });
    }

    console.log(`Granted ${credits} credits (tier=${tier}) to user ${profile.id} for invoice ${invoice.id}.`);
}

export async function POST(req: NextRequest) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('Webhook secret not set');
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const sig = req.headers.get('stripe-signature');
    const body = await req.text();
    if (!sig) {
        console.error('Missing stripe-signature header');
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Invalid signature: ${err.message}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                await syncSubscription(event.data.object as Stripe.Subscription);
                break;

            case 'invoice.payment_succeeded':
                await handleInvoicePaid(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_failed': {
                const inv = event.data.object as Stripe.Invoice;
                const { subscriptionId } = extractSubAndCust(inv);
                if (subscriptionId) {
                    const sub = await stripe.subscriptions.retrieve(subscriptionId);
                    await syncSubscription(sub);
                }
                break;
            }

            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.mode === 'subscription' && typeof session.subscription === 'string') {
                    await syncSubscription(await stripe.subscriptions.retrieve(session.subscription));
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error(`Handler error: ${err.message}`);
        return NextResponse.json({ error: 'Handler failure' }, { status: 500 });
    }
}
