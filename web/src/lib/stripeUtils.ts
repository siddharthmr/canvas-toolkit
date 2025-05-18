import Stripe from 'stripe';
import { getStripe } from './stripeServer';

export interface ProductPriceDetails {
    name: string;
    price: string;
    priceId: string | null;
    error?: string;
}

export async function getProductPriceDetails(productId: string): Promise<ProductPriceDetails> {
    try {
        const stripe = getStripe();
        const product = await stripe.products.retrieve(productId, {
            expand: ['default_price']
        });
        
        const defaultPrice = product.default_price as Stripe.Price | null;

        if (!defaultPrice || defaultPrice.deleted || typeof defaultPrice.unit_amount !== 'number') {
            return {
                name: product.name ?? 'Product',
                price: 'Price not available',
                priceId: null,
                error: 'Default price not found, deleted, or invalid for this product.'
            };
        }

        return {
            name: product.name ?? 'Subscription',
            price: (defaultPrice.unit_amount / 100).toLocaleString('en-US', {
                style: 'currency',
                currency: defaultPrice.currency
            }),
            priceId: defaultPrice.id
        };
    } catch (error) {
        console.error(`Stripe API error fetching product details for (${productId}):`, error);
        let message = 'An unexpected error occurred while fetching price information.';
        if (error instanceof Stripe.errors.StripeError) {
            message = error.message;
        } else if (error instanceof Error) {
            message = error.message;
        }
        return { name: '', price: '', priceId: null, error: message };
    }
}
