import { NextResponse } from 'next/server';
import { getProductPriceDetails } from '@/lib/stripeUtils';

const DEFAULT_PRODUCT_ID = 'prod_SKf5FosciyojiY';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const queryProductId = searchParams.get('productId');

    const targetProductId = queryProductId || DEFAULT_PRODUCT_ID;

    if (!targetProductId) {
        return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const productInfo = await getProductPriceDetails(targetProductId);

    if (productInfo.error || !productInfo.priceId) {
        return NextResponse.json({ error: productInfo.error || 'Could not retrieve a valid price ID.' }, { status: 500 });
    }

    return NextResponse.json({
        priceId: productInfo.priceId,
        name: productInfo.name,
        price: productInfo.price
    });
}
