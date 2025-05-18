type Feature = {
    title: string;
    description: string;
    badge: string;
    badgeVariant: 'free' | 'premium';
    iconPath: string;
};

const features: Feature[] = [
    {
        title: 'AI Integration',
        description: 'Access advanced AI models to help solve complex quiz problems and provide detailed explanations.',
        badge: '$4.99/month',
        badgeVariant: 'premium',
        iconPath: 'M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z'
    },
    {
        title: 'Disable Tab Switch Detection',
        description: 'Prevent Canvas from detecting when you switch between tabs or applications during quizzes.',
        badge: 'Free',
        badgeVariant: 'free',
        iconPath: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
    },
    {
        title: 'Autofill Quiz Answers',
        description: 'Automatically fill in answers from your previous quiz attempts to save time and improve scores.',
        badge: 'Free',
        badgeVariant: 'free',
        iconPath: 'M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z'
    }
];

const FeatureCard = ({ title, description, badge, badgeVariant, iconPath }: Feature) => {
    const bgClasses = badgeVariant === 'premium' ? 'bg-gradient-to-br from-[rgba(80,30,120,0.1)] to-[rgba(30,80,120,0.05)] border-purple-500/25' : 'bg-black/30 backdrop-blur-md border-[rgb(35,35,35)]';

    return (
        <div className={`${bgClasses} rounded-lg p-6 border transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg flex flex-col h-full`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d={iconPath} fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <p className="text-gray-400 text-sm flex-grow">{description}</p>
            <div className="mt-4 flex items-center">
                <span className={`text-xs font-medium px-2 py-1 rounded ${badgeVariant === 'premium' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>{badge}</span>
            </div>
        </div>
    );
};

const HeroSection = () => (
    <section className="relative overflow-hidden w-full flex">
        <div className="w-full px-2 sm:px-6 py-8 flex flex-col text-[rgb(220,220,220)]">
            <div className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-[rgb(35,35,35)] mb-6 lg:h-[65%] flex-grow flex items-center">
                <div className="flex flex-col lg:flex-row items-center w-full">
                    <div className="w-full lg:w-2/3 text-center">
                        <h1 className="text-5xl mb-4 font-extrabold tracking-[-0.03em] leading-[1.1]">
                            <span className="text-transparent [-webkit-text-stroke:1px_rgb(180,180,180)] [filter:drop-shadow(0_0_10px_white)]">Invisible Assistance</span>
                            <span className="bg-gradient-to-b from-white to-[#adadad] bg-clip-text text-transparent"> Visible Results</span>
                        </h1>
                        <p className="mb-8 max-w-lg mx-auto subtitle">Powered by cutting-edge AI to help you ace quizzes & exams discreetly.</p>
                        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xs mx-auto">
                            <button className="w-full inline-flex justify-center items-center px-4 py-2 border-none text-xs font-bold rounded-lg shadow-sm text-[rgba(35,35,35)] bg-[rgba(220,220,220)] hover:bg-gray-100 focus:outline-none">Add to Chrome</button>
                            <div className="flex flex-row items-center justify-center gap-4 w-full">
                                <a className="w-full inline-flex justify-center items-center px-4 py-2 border-none text-xs font-bold rounded-lg shadow-sm text-[rgba(220,220,220)] bg-[rgba(35,35,35)] hover:bg-gray-700 focus:outline-none" href="/#stealth-mode">
                                    Learn More
                                </a>
                                <a className="w-full inline-flex justify-center items-center px-4 py-2 border-none text-xs font-bold rounded-lg shadow-sm text-white bg-[#5865F2] hover:bg-[#4f5bda] focus:outline-none" href="https://discord.gg/XSaS2kQUPF" target="_blank" rel="noopener noreferrer">
                                    Join Discord
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/3 flex justify-center mt-8 lg:mt-0">
                        <div className="relative group">
                            <div className="relative transition duration-500 ease-in-out group-hover:scale-105">
                                <img src="/images/extension-popup.png" alt="Extension Popup" className="rounded-lg w-xs border border-purple-500/25" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:h-[calc(35%-1.5rem)]">
                {features.map(f => (
                    <FeatureCard key={f.title} {...f} />
                ))}
            </div>
        </div>
    </section>
);

export default HeroSection;
