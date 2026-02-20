const FooterSection = () => {
    return (
        <footer className="w-full border-t border-[#2a2a2a] bg-[#101010]">
            <div className="mx-auto max-w-5xl px-6 md:px-8 py-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                    <p className="text-[#E5E5E5] text-lg md:text-xl font-semibold tracking-[-0.02em]">
                        CanvasToolkit
                    </p>
                    <p className="mt-2 text-[#B0B0B0] text-sm md:text-[15px] leading-relaxed max-w-2xl">
                        CanvasToolkit is a product developed and operated by Viper Industries, focused on delivering reliable and discreet student productivity tools.
                    </p>
                </div>

                <div className="flex items-center gap-3 md:justify-end">
                    <a
                        href="/privacy"
                        className="inline-flex items-center rounded-full border border-[#344451]/65 bg-[#101419] px-4 py-2 text-xs text-[#c5d0d8] hover:border-[#344451] hover:text-[#dbe4ea] transition-colors"
                    >
                        Privacy Policy
                    </a>
                </div>
            </div>

            <div className="border-t border-[#2a2a2a]">
                <div className="mx-auto max-w-5xl px-6 md:px-8 py-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                    <p className="text-[11px] text-[#E5E5E5]/35">
                        © {new Date().getFullYear()} CanvasToolkit. All rights reserved.
                    </p>
                    <p className="text-[11px] text-[#E5E5E5]/30">
                        Viper Industries
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
