import CheckoutButton from './CheckoutButton';
import { getProductPriceDetails } from '@/lib/stripeUtils';

const FeatureItem = ({ text, included = true }: { text: string; included?: boolean }) => {
    return (
        <div className="flex items-center mt-3">
            <div className={`w-5 h-5 ${included ? 'bg-blue-500/40' : 'bg-gray-700/40'} rounded-full flex items-center justify-center mr-3 shrink-0`}>
                {included ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <span className={`text-sm ${included ? 'text-gray-300' : 'text-gray-600'}`}>{text}</span>
        </div>
    );
};

const STEALTH_PRODUCT_ID = 'prod_TzgEBiCV7UhyXS';
const AI_PRODUCT_ID = 'prod_TzgEPgGosGk6DQ';

const PricingSection = async () => {
    const [stealth, ai] = await Promise.all([
        getProductPriceDetails(STEALTH_PRODUCT_ID),
        getProductPriceDetails(AI_PRODUCT_ID)
    ]);

    return (
        <section className="relative py-24 w-full overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />

            <div className="w-full px-4 text-center">
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
                    <h1 className="text-5xl bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-8 py-1 title">Unlock Premium Features</h1>

                    <p className="text-center mb-12 max-w-2xl mx-auto subtitle">Choose the plan that fits your needs. Upgrade anytime.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                        {/* Stealth Mode Card */}
                        <div className="bg-black/30 backdrop-blur-md rounded-lg border border-[rgb(35,35,35)] flex flex-col overflow-hidden">
                            <div className="p-8 flex-1 text-left bg-[rgb(15,15,15)]">
                                <h2 className="text-2xl font-bold text-[rgb(220,220,220)] mb-2">{stealth.name || 'Stealth Mode'}</h2>
                                <p className="text-gray-500 text-sm mb-6">Stay undetected during quizzes</p>

                                <div className="flex items-end mb-6">
                                    {stealth.error ? (
                                        <span className="text-xl font-bold text-red-400">{stealth.error}</span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-bold text-[rgb(220,220,220)]">{stealth.price}</span>
                                            <span className="text-gray-400 ml-1 mb-1">/month</span>
                                        </>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <FeatureItem text="Disable tab switch detection" />
                                    <FeatureItem text="Stealth mode for proctored environments" />
                                    <FeatureItem text="AI quiz answering" included={false} />
                                    <FeatureItem text="Access to AI models" included={false} />
                                </div>
                            </div>

                            <div className="p-6 border-t border-[rgb(35,35,35)] bg-[rgb(12,12,12)]">
                                {stealth.priceId ? (
                                    <CheckoutButton priceId={stealth.priceId} />
                                ) : (
                                    <button disabled className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium opacity-50 cursor-not-allowed">
                                        Currently Unavailable
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* AI Integration Card */}
                        <div className="bg-black/30 backdrop-blur-md rounded-lg border border-blue-500/30 flex flex-col overflow-hidden relative">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                RECOMMENDED
                            </div>

                            <div className="p-8 flex-1 text-left bg-[rgb(15,15,15)]">
                                <h2 className="text-2xl font-bold text-[rgb(220,220,220)] mb-2">{ai.name || 'AI Integration'}</h2>
                                <p className="text-gray-500 text-sm mb-6">Full AI-powered toolkit experience</p>

                                <div className="flex items-end mb-6">
                                    {ai.error ? (
                                        <span className="text-xl font-bold text-red-400">{ai.error}</span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-bold text-[rgb(220,220,220)]">{ai.price}</span>
                                            <span className="text-gray-400 ml-1 mb-1">/month</span>
                                        </>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <FeatureItem text="Disable tab switch detection" />
                                    <FeatureItem text="Stealth mode for proctored environments" />
                                    <FeatureItem text="AI-powered real-time quiz answering" />
                                    <FeatureItem text="Access to all AI models (GPT-4o, Gemini, etc.)" />
                                    <FeatureItem text="Priority support via Discord" />
                                </div>
                            </div>

                            <div className="p-6 border-t border-blue-500/20 bg-[rgb(12,12,12)]">
                                {ai.priceId ? (
                                    <CheckoutButton priceId={ai.priceId} />
                                ) : (
                                    <button disabled className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium opacity-50 cursor-not-allowed">
                                        Currently Unavailable
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-xs text-gray-500">Cancel anytime. No hidden fees. All prices in USD.</div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
