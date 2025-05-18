import { NextResponse, NextRequest } from 'next/server';
import { getStripe } from '../../../lib/stripeServer';
import Stripe from 'stripe';
import { getSupabaseAdminClient } from '../../../lib/supabaseAdmin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface CheckoutRequestBody {
    priceId: string;
    quantity?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    console.log('--- CHECKOUT SESSION REQUEST RECEIVED ---');
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            }
        }
    });
    const supabaseAdmin = getSupabaseAdminClient();
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
        console.error('FATAL /api/checkout_sessions: NEXT_PUBLIC_APP_URL is not set');
        return NextResponse.json({ error: 'Application URL is not configured.' }, { status: 500 });
    }

    console.log('/api/checkout_sessions Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));

    try {
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('/api/checkout_sessions: User not authenticated.', authError);
            return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
        }
        const userId = user.id;
        const userEmail = user.email;
        if (!userEmail) {
            console.error(`/api/checkout_sessions: User ${userId} has no email.`);
            return NextResponse.json({ error: 'User email is required for billing.' }, { status: 400 });
        }
        console.log(`/api/checkout_sessions: Authenticated user ${userId} (${userEmail})`);

        const body = (await request.json()) as CheckoutRequestBody;
        const { priceId, quantity = 1 } = body;
        console.log(`/api/checkout_sessions: Received priceId: ${priceId}, quantity: ${quantity}`);

        if (!priceId || typeof priceId !== 'string') {
            return NextResponse.json({ error: 'Invalid or missing Price ID' }, { status: 400 });
        }

        let stripeCustomerId: string | undefined | null;
        try {
            const { data: profileData, error: profileError } = await supabaseAdmin.from('profiles').select('stripe_customer_id').eq('id', userId).single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error(`/api/checkout_sessions: Error fetching profile for user ${userId}:`, profileError);
                throw new Error(`Database error: ${profileError.message}`);
            }
            stripeCustomerId = profileData?.stripe_customer_id;
            console.log(`/api/checkout_sessions: Found profile data for ${userId}. Existing Stripe Customer ID: ${stripeCustomerId ?? 'None'}`);
        } catch (dbError: any) {}

        if (!stripeCustomerId) {
            console.log(`/api/checkout_sessions: No Stripe customer ID in profile for user ${userId}. Checking Stripe...`);
            const existingCustomers = await stripe.customers.list({ email: userEmail, limit: 1 });
            if (existingCustomers.data.length > 0) {
                stripeCustomerId = existingCustomers.data[0].id;
                console.log(`/api/checkout_sessions: Found existing Stripe customer ${stripeCustomerId}.`);
            } else {
                try {
                    const customer = await stripe.customers.create({});
                    stripeCustomerId = customer.id;
                    console.log(`/api/checkout_sessions: Created new Stripe customer ${stripeCustomerId}.`);
                } catch (stripeErr: any) {}
            }
            try {
                const { error: updateError } = await supabaseAdmin.from('profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', userId);
                if (updateError) {
                    throw new Error(`Failed to link Stripe Customer ID: ${updateError.message}`);
                }
                console.log(`/api/checkout_sessions: Updated profile ${userId} with Stripe ID ${stripeCustomerId}.`);
            } catch (dbError: any) {}
        } else {
            console.log(`/api/checkout_sessions: Using existing Stripe customer ID ${stripeCustomerId} for user ${userId}.`);
        }

        if (!stripeCustomerId) {
            throw new Error('Stripe customer ID missing. Cannot create checkout session.');
        }

        const params: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity }],
            mode: 'subscription',
            success_url: `${appUrl}/account`,
            cancel_url: `${appUrl}/account`,
            customer: stripeCustomerId,
            allow_promotion_codes: true,
            payment_method_collection: 'if_required',
            metadata: { supabaseUserId: userId }
        };
        console.log(`/api/checkout_sessions: Creating Stripe session for customer ${stripeCustomerId}...`);
        const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create(params);
        console.log(`/api/checkout_sessions: Stripe session ${session.id} created successfully.`);
        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Error in /api/checkout_sessions:', error);
        return NextResponse.json({ error: `Failed to create checkout session: ${error.message}` }, { status: 500 });
    }
}
