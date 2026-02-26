import { ModelData } from '@/lib/getModels';

const TrustedAnswersSection = ({ models }: { models: ModelData }) => {
    return (
        <section className="relative pt-0 pb-56 w-full overflow-visible">
            <div className="w-full px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-[#E5E5E5] text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-tight">
                            Unmatched Accuracy
                        </h2>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#344451]/70 bg-[#101419] px-3 py-2 text-[12px] md:text-[13px] text-[#c5d0d8]">
                            <span className="text-[#d5dde3]">While competitors rely on outdated models</span>
                            <span className="font-semibold text-[#8fa2b0]">We leverage the very best models</span>
                        </div>
                        <p className="text-[#E5E5E5]/30 text-[11px] md:text-xs leading-relaxed mt-3 max-w-2xl mx-auto">
                            Don't see your preferred model? Reach out to us on Discord. <br></br> We are always updating our models to the latest and greatest.
                        </p>
                    </div>

                    <div className="relative mx-auto max-w-2xl overflow-visible">
                        <div className="relative rounded-xl border border-[#2a2a2a] bg-[#101010] p-4 md:p-5">
                            <p className="text-[#8E8E8E] text-xs md:text-sm mb-2">Primary model</p>

                            <div className="relative">
                                <button className="w-full rounded-lg border border-[#2a2a2a] bg-[#111111] px-4 py-2.5 text-left text-[#E5E5E5] text-[16px] flex items-center justify-between">
                                    {models.defaultPrimary}
                                    <span className="text-[#7a7a7a] text-lg">⌄</span>
                                </button>

                                <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#111111] shadow-[0_16px_32px_rgba(0,0,0,0.55)] z-10">
                                    {models.modelOptions.map((model, idx) => (
                                        <div
                                            key={model}
                                            className={`px-4 py-2 text-[14px] border-t border-[#242b33] ${
                                                idx === 0
                                                    ? 'bg-[#1a1a1a] text-[#E5E5E5]'
                                                    : 'text-[#BBBBBB]'
                                            }`}
                                        >
                                            {model}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Edge fade so UI falls into background */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-xl"
                            style={{
                                background:
                                    'radial-gradient(ellipse 90% 76% at 50% 46%, rgba(10,10,10,0) 42%, rgba(10,10,10,0.54) 78%, rgba(10,10,10,0.92) 100%)',
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedAnswersSection;
