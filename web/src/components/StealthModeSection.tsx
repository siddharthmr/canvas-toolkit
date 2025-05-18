import Image from 'next/image';
import { ModePanel, ArrowIcon, ModePanelProps } from './DisplayComponents';

const StealthModeSection = () => (
    <section className="relative py-24 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-500/0 to-black/0 -z-10" />
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />
        <div className="w-full px-4 text-center">
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
                <h1 className="text-5xl title mb-8 py-1">Fully Invisible Integration</h1>
                <p className="text-center mb-12 max-w-2xl subtitle">Two customizable AI-powered buttons select correct answers automatically, then turn invisible when stealth mode activates.</p>
                <div className="bg-black/30 backdrop-blur-md rounded-lg p-8 border border-[rgb(35,35,35)] w-full">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                        <ModePanel label="Standard Mode" statusText="Visible" dotColor="bg-blue-500" statusBg="bg-blue-500/20" statusBorder="border-blue-500/30" statusTextColor="text-blue-300" imageSrc="/images/stealthOff.png" imageAlt="Stealth Mode Off" />
                        <ArrowIcon />
                        <ModePanel label="Stealth Mode" statusText="Hidden" dotColor="bg-purple-500" statusBg="bg-purple-500/20" statusBorder="border-purple-500/25" statusTextColor="text-purple-300" imageSrc="/images/stealthOn.png" imageAlt="Stealth Mode On" />
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default StealthModeSection;
