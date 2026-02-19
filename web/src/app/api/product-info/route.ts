import { NextResponse } from 'next/server';
import { getProductPriceDetails } from '@/lib/stripeUtils';

const VALID_PRODUCT_IDS = [
    'prod_TzgEBiCV7UhyXS', // Stealth Mode
    'prod_TzgEPgGosGk6DQ', // AI Integration
    'prod_SKf5FosciyojiY'  // Legacy product
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    if (!VALID_PRODUCT_IDS.includes(productId)) {
        return NextResponse.json({ error: 'Invalid product ID.' }, { status: 400 });
    }

    const productInfo = await getProductPriceDetails(productId);

    if (productInfo.error || !productInfo.priceId) {
        return NextResponse.json({ error: productInfo.error || 'Could not retrieve a valid price ID.' }, { status: 500 });
    }

    return NextResponse.json({
        priceId: productInfo.priceId,
        name: productInfo.name,
        price: productInfo.price
    });
}
