import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getStripe } from '../../../lib/stripeServer';
import { getSupabaseAdminClient } from '../../../lib/supabaseAdmin';
import Stripe from 'stripe';

export async function POST(request: NextRequest): Promise<NextResponse> {
    console.log('--- CUSTOMER PORTAL REQUEST RECEIVED ---');
    const cookieStore = cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            async get(name: string) {
                return (await cookieStore).get(name)?.value;
            }
        }
    });
    const supabaseAdmin = getSupabaseAdminClient();
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
        console.error('FATAL /api/customer-portal: NEXT_PUBLIC_APP_URL is not set');
        return NextResponse.json({ error: 'Application URL is not configured.' }, { status: 500 });
    }

    try {
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('/api/customer-portal: User not authenticated.', authError);
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        const userId = user.id;
        console.log(`/api/customer-portal: Authenticated user ${userId}`);

        const { data: profileData, error: profileError } = await supabaseAdmin.from('profiles').select('stripe_customer_id').eq('id', userId).single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error(`/api/customer-portal: Error fetching profile for user ${userId}:`, profileError);
            return NextResponse.json({ error: 'Could not retrieve your billing information.' }, { status: 500 });
        }

        const stripeCustomerId = profileData?.stripe_customer_id;

        if (!stripeCustomerId) {
            console.warn(`/api/customer-portal: No Stripe Customer ID found for user ${userId}.`);
            return NextResponse.json({ error: 'No billing account found. You may not have an active subscription.' }, { status: 404 });
        }
        console.log(`/api/customer-portal: Found Stripe Customer ID ${stripeCustomerId} for user ${userId}.`);

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${appUrl}/account`
        });
        console.log(`/api/customer-portal: Stripe Billing Portal session ${portalSession.id} created for customer ${stripeCustomerId}. URL: ${portalSession.url}`);

        return NextResponse.json({ url: portalSession.url });
    } catch (error: any) {
        console.error('Error in /api/customer-portal:', error);
        let errorMessage = 'Failed to create customer portal session.';
        if (error instanceof Stripe.errors.StripeError) {
            errorMessage = error.message;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
