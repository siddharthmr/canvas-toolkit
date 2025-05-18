'use client';

import { useState } from 'react';
import { getStripeJs } from '../lib/stripeClient';
import type { StripeError } from '@stripe/stripe-js';

interface CheckoutButtonProps {
    priceId: string;
}

interface CheckoutSessionResponse {
    sessionId: string;
    url?: string;
    error?: string;
}

const CheckoutButton = ({ priceId }: CheckoutButtonProps) => {
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ priceId }),
                redirect: 'manual'
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 302) {
                    console.log('User not authenticated, redirecting to login...');
                    window.location.assign('/login');
                    return;
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || `API responded with status ${response.status}`);
                }
            }

            const sessionResponse = (await response.json()) as CheckoutSessionResponse;

            if (sessionResponse.error) {
                throw new Error(sessionResponse.error);
            }

            if (!sessionResponse.sessionId) {
                throw new Error('Session ID was not returned from the API.');
            }

            const stripe = await getStripeJs();
            if (!stripe) {
                throw new Error('Stripe.js failed to load.');
            }

            const { error: stripeError } = await stripe.redirectToCheckout({
                sessionId: sessionResponse.sessionId
            });

            if (stripeError) {
                console.error('Stripe redirection error:', stripeError);
                setError(stripeError.message ?? 'Failed to redirect to Stripe.');
            }
        } catch (err: unknown) {
            console.error('Checkout error:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handleClick} disabled={loading || !priceId} className="px-4 py-2 bg-[rgb(220,220,220)] text-[rgb(15,15,15)] rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed" aria-live="polite">
                {loading ? 'Processing...' : 'Buy Now'}
            </button>
            {error && (
                <p role="alert" className="text-red-500 mt-2">
                    Error: {error}
                </p>
            )}
        </div>
    );
};

export default CheckoutButton;
