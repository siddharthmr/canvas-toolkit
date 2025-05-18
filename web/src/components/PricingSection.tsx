import CheckoutButton from './CheckoutButton';
import { getProductPriceDetails } from '@/lib/stripeUtils';

const FeatureItem = ({ text }: { text: string }) => {
    return (
        <div className="flex items-center mt-3">
            <div className="w-5 h-5 bg-blue-500/40 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </div>
            <span className="text-gray-300 text-sm">{text}</span>
        </div>
    );
};

const PRODUCT_ID = 'prod_SKf5FosciyojiY';

const PricingSection = async () => {
    const { name, price, priceId, error } = await getProductPriceDetails(PRODUCT_ID);

    return (
        <section className="relative py-24 w-full overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />

            <div className="w-full px-4 text-center">
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
                    <h1 className="text-5xl bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-8 py-1 title">Unlock Premium Features</h1>

                    <p className="text-center mb-12 max-w-2xl mx-auto subtitle">Get access to our advanced AI tools and premium features with a simple monthly subscription.</p>

                    <div className="bg-black/30 backdrop-blur-md rounded-lg border border-[rgb(35,35,35)] max-w-4xl mx-auto w-full">
                        <div className="flex flex-col md:flex-row overflow-hidden">
                            <div className="p-8 md:w-3/5 text-left bg-[rgb(15,15,15)] rounded-l-lg">
                                <h2 className="text-3xl font-bold text-[rgb(220,220,220)] mb-6">{name || 'Canvas AI Toolkit'}</h2>
                                <p className="text-gray-400 mb-6">Take your learning experience to the next level with our AI-powered toolkit.</p>

                                <div className="mt-8">
                                    <FeatureItem text="Access to all AI models for optimal answer generation" />
                                    <FeatureItem text="Stealth mode for proctored environments" />
                                    <FeatureItem text="Real-time answer assistance during quizzes" />
                                    <FeatureItem text="Priority support via Discord" />
                                </div>

                                <div className="mt-8 pt-6 border-t border-[rgb(35,35,35)] text-xs text-gray-500">Cancel anytime. No hidden fees. All prices in USD.</div>
                            </div>

                            <div className="p-8 md:w-2/5 items-center flex flex-col justify-center gap-5">
                                <div className="mb-6">
                                    <div className="flex items-end">
                                        {error ? (
                                            <span className="text-xl font-bold text-red-400">{error}</span>
                                        ) : (
                                            <>
                                                <span className="text-5xl font-bold text-[rgb(220,220,220)]">{price}</span>
                                                <span className="text-gray-400 ml-1 mb-1">/month</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {priceId ? (
                                    <CheckoutButton priceId={priceId} />
                                ) : (
                                    <button disabled className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium shadow-lg transition-all duration-300 text-center opacity-50 cursor-not-allowed">
                                        Buy Now (Currently Unavailable)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
