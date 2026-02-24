import CheckoutButton from './CheckoutButton';
import { getProductPriceDetails, type ProductPriceDetails } from '@/lib/stripeUtils';

type PlanFeature = {
    text: string;
    included: boolean;
};

type PlanCardProps = {
    plan: ProductPriceDetails;
    description: string;
    tierLabel: string;
    sideLabel: string;
    emphasized?: boolean;
    features: PlanFeature[];
};

const FeatureRow = ({ text, included }: PlanFeature) => (
    <div className="flex items-start gap-2.5">
        <span
            className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] leading-none ${
                included
                    ? 'border-[#344451]/80 bg-[#131a20] text-[#a8bac6]'
                    : 'border-[#3d3d3d] text-[#666]'
            }`}
        >
            {included ? '✓' : '×'}
        </span>
        <span className={`text-sm leading-6 ${included ? 'text-[#D3D3D3]' : 'text-[#787878]'}`}>{text}</span>
    </div>
);

const PlanCard = ({
    plan,
    description,
    tierLabel,
    sideLabel,
    emphasized = false,
    features,
}: PlanCardProps) => {
    const cardClass = emphasized
        ? 'border-[#344451]/70 bg-[#14171a]'
        : 'border-[#2a2a2a] bg-[#0a0a0a]';

    const dividerClass = emphasized ? 'border-[#344451]/35' : 'border-[#2a2a2a]';

    return (
        <div className={`rounded-xl border ${cardClass} overflow-hidden flex flex-col min-h-[520px]`}>
            <div className={`border-b ${dividerClass} px-6 py-5`}>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${emphasized ? 'bg-[#E5E5E5]' : 'bg-[#E5E5E5]/40'}`} />
                        <span className="text-[#E5E5E5]/60 text-xs font-medium">{tierLabel}</span>
                    </div>
                    <span className={`text-[10px] font-medium tracking-wide uppercase ${emphasized ? 'text-[#E5E5E5]/50' : 'text-[#E5E5E5]/25'}`}>
                        {sideLabel}
                    </span>
                </div>

                <h3 className="text-[#E5E5E5] text-[34px] leading-none font-semibold tracking-[-0.02em]">
                    {plan.name || (emphasized ? 'AI Integration' : 'Stealth Mode')}
                </h3>
                <p className="text-[#A2A2A2] text-[15px] mt-3">{description}</p>

                <div className="mt-6 flex items-end gap-1.5">
                    {plan.error ? (
                        <span className="text-[15px] text-[#ff8e9a]">{plan.error}</span>
                    ) : (
                        <>
                            <span className="text-[#E5E5E5] text-5xl font-semibold tracking-[-0.03em]">{plan.price}</span>
                            <span className="text-[#8b8b8b] text-[28px] leading-none pb-1">/month</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 px-6 py-5">
                <div className="space-y-3.5">
                    {features.map((feature) => (
                        <FeatureRow key={feature.text} text={feature.text} included={feature.included} />
                    ))}
                </div>
            </div>

            <div className={`border-t ${dividerClass} px-6 py-5 bg-[#111111]/70`}> 
                {plan.priceId ? (
                    <div className="flex justify-center">
                        <CheckoutButton
                            priceId={plan.priceId}
                            label={emphasized ? 'Get AI Integration' : 'Get Stealth Mode'}
                            className="h-11 rounded-lg border border-[#2c353e] bg-[#0f1318] px-4 text-[13px] font-medium tracking-[0.01em] text-[#E5E5E5] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] before:content-['BUY'] before:mr-2 before:inline-flex before:h-6 before:min-w-[38px] before:items-center before:justify-center before:rounded-md before:bg-[#ECECEC] before:px-2 before:text-[11px] before:font-semibold before:tracking-wide before:text-[#111] after:content-['→'] after:ml-2 after:text-[16px] after:leading-none after:text-[#E5E5E5]/85 hover:border-[#344451] hover:bg-[#141a22]"
                        />
                    </div>
                ) : (
                    <button
                        disabled
                        className="w-full rounded-full border border-[#2f3640] bg-[#15181c] py-2.5 px-4 text-[12px] font-semibold text-[#6f7980] cursor-not-allowed"
                    >
                        Currently Unavailable
                    </button>
                )}
            </div>
        </div>
    );
};

const STEALTH_PRODUCT_ID = 'prod_TzgEBiCV7UhyXS';
const AI_PRODUCT_ID = 'prod_TzgEPgGosGk6DQ';

const PricingSection = async () => {
    const [stealth, ai] = await Promise.all([
        getProductPriceDetails(STEALTH_PRODUCT_ID),
        getProductPriceDetails(AI_PRODUCT_ID),
    ]);

    return (
        <section className="relative py-14 w-full overflow-hidden">
            <div className="w-full px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-[#E5E5E5] text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-tight">
                            Unlock Premium Features
                        </h2>
                        <p className="text-[#E5E5E5]/40 text-sm md:text-[15px] leading-relaxed mt-4 max-w-2xl mx-auto">
                            Choose the plan that matches your workflow and upgrade any time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <PlanCard
                            plan={stealth}
                            tierLabel="Stealth Tier"
                            sideLabel="Focused"
                            description="Stay undetected in proctored quizzes with stealth-only tools."
                            features={[
                                { text: 'Disable tab switch detection', included: true },
                                { text: 'Stealth mode for proctored environments', included: true },
                                { text: 'AI-powered real-time quiz answering', included: false },
                                { text: 'Access to all AI models', included: false },
                            ]}
                        />

                        <PlanCard
                            plan={ai}
                            tierLabel="Complete Tier"
                            sideLabel="Recommended"
                            emphasized
                            description="Full toolkit access with stealth + live AI assistance."
                            features={[
                                { text: 'Disable tab switch detection', included: true },
                                { text: 'Stealth mode for proctored environments', included: true },
                                { text: 'AI-powered real-time quiz answering', included: true },
                                { text: 'Access to all AI models (GPT, Gemini, etc.)', included: true },
                            ]}
                        />
                    </div>

                    <p className="mt-8 text-center text-[11px] text-[#E5E5E5]/30">
                        Cancel anytime. No hidden fees. All prices in USD.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
