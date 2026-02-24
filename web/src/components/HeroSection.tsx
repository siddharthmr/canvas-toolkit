import MacbookMockup from './macbook/MacbookMockup';
import { ModelData } from '@/lib/getModels';

const HeroSection = ({ models }: { models: ModelData }) => (
    <section className="relative w-full overflow-hidden -mt-[4.5rem] sm:-mt-20 pb-20">
        <div className="flex flex-col items-center pt-28 sm:pt-32 gap-3 md:gap-4">
            {/* Heading */}
            <h1 className="text-center select-none px-6 text-6xl font-extrabold tracking-[-0.03em] leading-[0.98]">
                <span className="hero-heading-ghost block mb-4">
                    Invisible Assistance
                </span>
                <span className="block text-[#E5E5E5]">
                    Visible Results
                </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-center text-[#E5E5E5]/70 text-xs md:text-[13px] leading-relaxed font-mono px-6 mt-6">
            Built in undetected AI assistance. Seamless tab tracking bypass.
            </p>

            {/* CTA group */}
            <div className="flex justify-center w-full px-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href="https://chromewebstore.google.com/detail/canvastoolkit/pahbokefgdmeialdpkjknghmfnnbllme"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2.5 bg-[#000] text-[#E5E5E5] pl-5 pr-6 py-2.5 rounded-lg text-sm font-medium tracking-tight hover:bg-accent/50 transition-colors duration-200 border border-[#E5E5E5]/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="18" width="18">
                                <defs>
                                    <linearGradient id="chr-a" x1="3.2173" y1="15" x2="44.7812" y2="15" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#d93025" />
                                        <stop offset="1" stopColor="#ea4335" />
                                    </linearGradient>
                                    <linearGradient id="chr-b" x1="20.7219" y1="47.6791" x2="41.5039" y2="11.6837" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#fcc934" />
                                        <stop offset="1" stopColor="#fbbc04" />
                                    </linearGradient>
                                    <linearGradient id="chr-c" x1="26.5981" y1="46.5015" x2="5.8161" y2="10.506" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#1e8e3e" />
                                        <stop offset="1" stopColor="#34a853" />
                                    </linearGradient>
                                </defs>
                                <circle cx="24" cy="23.9947" r="12" style={{fill:"#fff"}} />
                                <path d="M3.2154,36A24,24,0,1,0,12,3.2154,24,24,0,0,0,3.2154,36ZM34.3923,18A12,12,0,1,1,18,13.6077,12,12,0,0,1,34.3923,18Z" style={{fill:"none"}} />
                                <path d="M24,12H44.7812a23.9939,23.9939,0,0,0-41.5639.0029L13.6079,30l.0093-.0024A11.9852,11.9852,0,0,1,24,12Z" style={{fill:"url(#chr-a)"}} />
                                <circle cx="24" cy="24" r="9.5" style={{fill:"#1a73e8"}} />
                                <path d="M34.3913,30.0029,24.0007,48A23.994,23.994,0,0,0,44.78,12.0031H23.9989l-.0025.0093A11.985,11.985,0,0,1,34.3913,30.0029Z" style={{fill:"url(#chr-b)"}} />
                                <path d="M13.6086,30.0031,3.218,12.006A23.994,23.994,0,0,0,24.0025,48L34.3931,30.0029l-.0067-.0068a11.9852,11.9852,0,0,1-20.7778.007Z" style={{fill:"url(#chr-c)"}} />
                            </svg>
                            Add to Chrome
                        </a>
                        <a
                            href="https://discord.gg/XSaS2kQUPF"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2.5 bg-[#000] text-[#E5E5E5] pl-5 pr-6 py-2.5 rounded-lg text-sm font-medium tracking-tight border border-[#E5E5E5]/10 hover:bg-accent/50 hover:border-[#E5E5E5]/20 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 127.14 96.36" fill="currentColor">
                                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                            </svg>
                            Join Discord
                        </a>
                    </div>
                    <p className="text-[10px] font-mono text-[#E5E5E5]/25 tracking-wide mt-6 mb-6">
                        CanvasToolkit © {new Date().getFullYear()} · Viper Industries
                    </p>
                </div>
            </div>

            {/* MacBook mockup */}
            <div className="w-full mt-8 md:mt-10 px-6 md:px-12 lg:px-20">
                <MacbookMockup models={models} />
            </div>
        </div>

        {/* Blend hero into next section */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 md:h-40">
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent via-[#0a0a0a]/78 to-[#0a0a0a]" />
            <div className="absolute left-0 bottom-0 h-full w-32 md:w-52 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
            <div className="absolute right-0 bottom-0 h-full w-32 md:w-52 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
        </div>
        <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-3 md:bottom-5 h-16 w-[62vw] max-w-3xl rounded-full bg-[#0a0a0a] blur-2xl"
        />
    </section>
);

export default HeroSection;
