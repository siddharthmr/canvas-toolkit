import { ReactNode } from 'react';

const MacbookFrame = ({ children }: { children: ReactNode }) => (
    <div className="relative w-full max-w-6xl mx-auto">
        {/* Vertical ambient glow: bright at top, gradual fade toward bottom */}
        <div
            className="absolute -inset-x-2 -top-1 -bottom-24 rounded-[44px] pointer-events-none"
            style={{
                background:
                    'linear-gradient(to bottom, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.16) 32%, rgba(118,131,143,0.14) 50%, rgba(28,33,38,0.14) 82%, rgba(10,10,10,0.08) 92%, rgba(10,10,10,0) 100%)',
                filter: 'blur(20px)',
            }}
        />
        {/* Extra bottom falloff for smoother blend into page background */}
        <div
            className="absolute -inset-x-24 -bottom-24 h-36 pointer-events-none"
            style={{
                background:
                    'linear-gradient(to bottom, rgba(10,10,10,0.52) 0%, rgba(10,10,10,0.28) 42%, rgba(10,10,10,0) 100%)',
                filter: 'blur(14px)',
            }}
        />

        <div
            className="macbook-fade-bottom relative rounded-t-2xl overflow-hidden border border-[#333]/30 border-b-0"
            style={{ background: '#000000' }}
        >
            <div className="relative p-[10px]">
                <div className="relative overflow-hidden rounded-t-lg">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-[140px] h-[22px] bg-[#000000] rounded-b-lg">
                        <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[3.5px] h-[3.5px] rounded-full bg-[#111]" />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    </div>
);

export default MacbookFrame;
