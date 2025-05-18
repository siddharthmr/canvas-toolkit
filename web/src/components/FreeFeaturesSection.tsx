import Image from 'next/image';
import { ModePanel, ArrowIcon, ModePanelProps } from './DisplayComponents';

type FeatureCardProps = {
    iconPath: string;
    title: string;
    description: string;
};

const FeatureCard = ({ iconPath, title, description }: FeatureCardProps) => (
    <div className="w-full md:w-1/2 bg-[rgb(15,15,15)] rounded-lg p-5 border border-[rgb(35,35,35)]">
        <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d={iconPath} clipRule="evenodd" fillRule="evenodd" />
                </svg>
            </div>
            <span className="text-[rgb(220,220,220)] font-semibold">{title}</span>
        </div>
        <p className="text-gray-400 text-sm text-left">{description}</p>
    </div>
);

const FreeFeaturesSection = () => (
    <section className="relative py-24 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/10 -z-10" />
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />
        <div className="w-full px-4 text-center">
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
                <h1 className="text-5xl title mb-8 py-1">Powerful Free Features</h1>
                <p className="text-center mb-12 max-w-2xl subtitle">Enhance your learning experience with these complimentary tools, designed to give you an edge without any cost.</p>
                <div className="bg-black/30 backdrop-blur-md rounded-lg p-8 border border-[rgb(35,35,35)] w-full">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                        <ModePanel label="Before Disabling Tab Switch Detection" statusText="Tracked" dotColor="bg-red-500" statusBg="bg-red-500/20" statusBorder="border-red-500/30" statusTextColor="text-red-300" imageSrc="/images/session-before.png" imageAlt="Session before" />
                        <ArrowIcon />
                        <ModePanel label="After Disabling Tab Switch Detection" statusText="Disabled" dotColor="bg-green-500" statusBg="bg-green-500/20" statusBorder="border-green-500/30" statusTextColor="text-green-300" imageSrc="/images/session-after.png" imageAlt="Session after" />
                    </div>
                </div>
                <div className="mt-12 w-full">
                    <div className="bg-black/30 backdrop-blur-md rounded-lg p-8 border border-[rgb(35,35,35)]">
                        <h2 className="text-3xl font-bold text-[rgb(220,220,220)] text-center mb-6">Autofill Quiz Answers</h2>
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <FeatureCard iconPath="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" title="Saves Time" description="Skip the tedious process of reentering answers you've already submitted in previous attempts." />
                            <FeatureCard iconPath="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" title="Improves Results" description="By autofilling correct answers from previous attempts, you'll consistently achieve better scores." />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default FreeFeaturesSection;
