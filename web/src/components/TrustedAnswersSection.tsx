const modelOptions = [
    'Gemini 3.0 Pro',
    'GPT 5.2',
    'DeepSeek V.3.2',
    'DeepSeek R1',
];

const TrustedAnswersSection = () => {
    return (
        <section className="relative pt-14 md:pt-16 pb-40 md:pb-48 w-full overflow-visible">
            <div className="w-full px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-[#E5E5E5] text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-tight">
                            Every Leading Model. One Click.
                        </h2>

                        <div className="mt-6 inline-flex items-center rounded-full border border-[#E5E5E5]/[0.06] px-4 py-2 text-xs">
                            <span className="text-[#E5E5E5]/40">While competitors rely on just GPT 5.2</span>
                            <span className="mx-2.5 w-px h-3 bg-[#E5E5E5]/10" />
                            <span className="text-[#E5E5E5]/70 font-medium">We leverage the very best models</span>
                        </div>
                        <p className="text-[#E5E5E5]/30 text-[11px] md:text-xs leading-relaxed mt-3 max-w-2xl mx-auto">
                            Model options shown here are current examples. CanvasToolkit continuously updates available models to the latest supported versions.
                        </p>
                    </div>

                    <div className="relative mx-auto max-w-2xl overflow-visible">
                        <div className="relative rounded-xl border border-[#2a2a2a] bg-[#101010] p-4 md:p-5">
                            <p className="text-[#8E8E8E] text-xs md:text-sm mb-2">Primary model</p>

                            <div className="relative">
                                <button className="w-full rounded-lg border border-[#2a2a2a] bg-[#111111] px-4 py-2.5 text-left text-[#E5E5E5] text-[16px] flex items-center justify-between">
                                    Gemini 3.0 Pro
                                    <span className="text-[#7a7a7a] text-lg">⌄</span>
                                </button>

                                <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#111111] shadow-[0_16px_32px_rgba(0,0,0,0.55)] z-10">
                                    {modelOptions.map((model, idx) => (
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
