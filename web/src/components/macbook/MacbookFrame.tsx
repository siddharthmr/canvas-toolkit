import { ReactNode } from 'react';

const MacbookFrame = ({ children }: { children: ReactNode }) => (
    <div className="relative w-full max-w-6xl mx-auto">
        {/* Glow layer -- offset outward so it doesn't wash out the bezel */}
        <div
            className="absolute -inset-0 rounded-t-3xl pointer-events-none"
            style={{
                boxShadow: '0 0 50px 30px rgba(255,255,255,0.07), 0 0 40px 8px rgba(255,255,255,0.05)',
            }}
        />

        <div
            className="macbook-fade-bottom relative rounded-t-2xl overflow-hidden border border-[#333]/30 border-b-0"
            style={{ background: '#000000' }}
        >
            <div className="relative p-[10px]">
                <div className="relative overflow-hidden rounded-t-lg">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-[180px] h-[22px] bg-[#000000] rounded-b-xl">
                        <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full bg-[#111]" />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    </div>
);

export default MacbookFrame;
