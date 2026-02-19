type Feature = {
    title: string;
    description: string;
    badge: string;
    badgeType: 'free' | 'premium';
};

const features: Feature[] = [
    {
        title: 'AI Integration',
        description:
            'Advanced AI models to solve complex quiz problems with detailed explanations.',
        badge: '$4.99/mo',
        badgeType: 'premium',
    },
    {
        title: 'Tab Switch Bypass',
        description:
            'Prevent Canvas from detecting when you switch between tabs during quizzes.',
        badge: 'Free',
        badgeType: 'free',
    },
    {
        title: 'Auto-fill Answers',
        description:
            'Automatically fill in answers from previous quiz attempts to save time.',
        badge: 'Free',
        badgeType: 'free',
    },
];

const FeatureCard = ({ title, description, badge, badgeType }: Feature) => (
    <div className="bg-[#0A0A0A] p-6 md:p-8 flex flex-col gap-4 hover:bg-[#111] transition-colors duration-300">
        <div className="flex items-center justify-between">
            <h3 className="text-xs md:text-sm font-mono tracking-[0.1em] text-[#E5E5E5]">
                {title}
            </h3>
            <span
                className={`text-[10px] font-mono tracking-wider px-2 py-1 ${
                    badgeType === 'premium'
                        ? 'text-[#E5E5E5] border border-[#E5E5E5]/30'
                        : 'text-[#E5E5E5]/50 border border-[#E5E5E5]/10'
                }`}
            >
                {badge}
            </span>
        </div>
        <p className="text-[#E5E5E5]/40 text-xs font-mono leading-relaxed">
            {description}
        </p>
    </div>
);

const models = [
    { name: 'GPT 5.2', provider: 'OpenAI', selected: true },
    { name: 'Gemini 3.0 Pro', provider: 'Google', selected: false },
    { name: 'DeepSeek 3.2', provider: 'DeepSeek', selected: false },
    { name: 'DeepSeek R1', provider: 'DeepSeek', selected: false },
];

const ModelSelectorMockup = () => (
    <div className="hidden md:block pt-16 xl:pt-24 shrink-0">
        <div className="w-60 xl:w-80 select-none pointer-events-none">
            {/* Selector header */}
            <div className="hero-floating-element bg-[#141414] border border-[#E5E5E5]/[0.06] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E5E5]/[0.06]">
                    <span className="text-[10px] font-mono text-[#E5E5E5]/30 tracking-wide">
                        Select Primary Model
                    </span>
                </div>

                {/* Model options */}
                <div className="py-1">
                    {models.map((model) => (
                        <div
                            key={model.name}
                            className={`flex items-center justify-between px-4 py-2.5 ${
                                model.selected
                                    ? 'bg-[#E5E5E5]/[0.06]'
                                    : ''
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        model.selected
                                            ? 'bg-[#E5E5E5]'
                                            : 'bg-[#E5E5E5]/10'
                                    }`}
                                />
                                <span
                                    className={`text-sm ${
                                        model.selected
                                            ? 'text-[#E5E5E5] font-medium'
                                            : 'text-[#E5E5E5]/40'
                                    }`}
                                >
                                    {model.name}
                                </span>
                            </div>
                            <span className="text-[9px] font-mono text-[#E5E5E5]/20">
                                {model.provider}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Caption */}
            <div>
                <p className="text-[10px] font-mono text-[#E5E5E5]/25 mt-4 text-left tracking-wide">
                    Every leading model. One click.
                </p>
            </div>
        </div>
    </div>
);

const HeroSection = () => (
    <section className="relative w-full overflow-hidden -mt-[4.5rem] sm:-mt-20">
        {/* Full-viewport hero */}
        <div className="min-h-screen flex flex-col">
            {/* Top content — balanced layout */}
            <div className="w-full px-6 md:px-12 lg:px-16 pt-12">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10 md:gap-8">
                    {/* Left: Floating model selector mockup */}
                    <ModelSelectorMockup />

                    {/* Right: Description + prominent CTAs */}
                    <div className="max-w-xs sm:max-w-sm md:max-w-md">
                        <p className="text-[#E5E5E5] text-xs md:text-[13px] leading-relaxed mb-8">
                            CanvasToolkit is a Chrome extension that gives
                            students an invisible edge. With monitoring tools
                            tracking every tab switch, you need assistance that
                            stays hidden. We provide discreet AI-powered tools
                            that work seamlessly&nbsp;&mdash; completely
                            undetected.
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-5">
                            <a
                                href="https://chromewebstore.google.com/detail/canvastoolkit/pahbokefgdmeialdpkjknghmfnnbllme"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center justify-center gap-2 bg-[#E5E5E5] text-[#0A0A0A] px-6 py-3 text-sm font-mono font-medium tracking-tight hover:bg-white transition-colors duration-200"
                            >
                                Add to Chrome
                                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                                    →
                                </span>
                            </a>
                            <a
                                href="https://discord.gg/XSaS2kQUPF"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3 text-sm font-mono font-medium tracking-tight text-[#E5E5E5]/70 border border-[#E5E5E5]/15 hover:border-[#E5E5E5]/40 hover:text-[#E5E5E5] transition-all duration-200"
                            >
                                Join Discord
                            </a>
                        </div>

                        {/* Trust micro-copy */}
                        <p className="text-[10px] font-mono text-[#E5E5E5]/25 tracking-wide">
                            Free to install · No sign-up required · Works
                            instantly
                        </p>
                    </div>
                </div>
            </div>

            {/* Spacer — pushes typography to the bottom */}
            <div className="flex-1" />

            {/* Massive typography */}
            <div className="w-full px-6 md:px-12 lg:px-16 pb-12 md:pb-20">
                <h1 className="hero-heading select-none">
                    <span className="hero-heading-ghost block mb-3 md:mb-5">
                        Invisible Assistance
                    </span>
                    <span className="hero-heading-solid block text-[#E5E5E5]">
                        Visible Results
                    </span>
                </h1>
            </div>
        </div>

        {/* Feature cards — brutalist grid */}
        <div className="w-full px-6 md:px-12 lg:px-16 pb-12 md:pb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E5E5]/10">
                {features.map((f) => (
                    <FeatureCard key={f.title} {...f} />
                ))}
            </div>
        </div>
    </section>
);

export default HeroSection;
