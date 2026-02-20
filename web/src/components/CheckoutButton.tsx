'use client';

import { useState } from 'react';
import { getStripeJs } from '../lib/stripeClient';
import { Button } from '@/components/ui/button';

interface CheckoutButtonProps {
    priceId: string;
    label?: string;
    className?: string;
}

interface CheckoutSessionResponse {
    sessionId: string;
    url?: string;
    error?: string;
}

const CheckoutButton = ({ priceId, label = 'Subscribe', className = '' }: CheckoutButtonProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);

        if (!priceId) {
            setError('Price ID is missing.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
                redirect: 'manual'
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 302) {
                    window.location.assign('/login');
                    return;
                }
                const errorText = await response.text();
                throw new Error(errorText || `API responded with status ${response.status}`);
            }

            const sessionResponse = (await response.json()) as CheckoutSessionResponse;
            if (sessionResponse.error) throw new Error(sessionResponse.error);
            if (!sessionResponse.sessionId) throw new Error('Session ID was not returned.');

            const stripe = await getStripeJs();
            if (!stripe) throw new Error('Stripe.js failed to load.');

            const { error: stripeError } = await stripe.redirectToCheckout({
                sessionId: sessionResponse.sessionId
            });

            if (stripeError) {
                setError(stripeError.message ?? 'Failed to redirect to Stripe.');
            }
        } catch (err: unknown) {
            console.error('Checkout error:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Button
                onClick={handleClick}
                disabled={loading || !priceId}
                className={`bg-foreground text-background hover:bg-foreground/90 text-xs font-medium px-4 py-2 rounded-lg cursor-pointer ${className}`}
            >
                {loading ? 'Processing...' : label}
            </Button>
            {error && (
                <p role="alert" className="text-red-400 text-xs mt-1.5">{error}</p>
            )}
        </div>
    );
};

export default CheckoutButton;
