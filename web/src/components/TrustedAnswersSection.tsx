'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';

const ModelCard = ({ name, provider, iconPath }: { name: string; provider: string; iconPath: string }) => (
    <div className="relative bg-black/30 backdrop-blur-md rounded-lg p-6 border border-[rgb(35,35,35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center gap-3">
            {iconPath && (
                <div className="w-8 h-8 relative">
                    <Image src={iconPath} alt={`${name} icon`} width={32} height={32} className="rounded-full" />
                </div>
            )}
            <div>
                <h3 className="font-bold text-lg text-[rgb(220,220,220)]">{name}</h3>
                <p className="text-sm text-gray-400">{provider}</p>
            </div>
        </div>
    </div>
);

const AnimatedProgressBar = ({ percentage, className, inView }: { percentage: number; className: string; inView: boolean }) => (
    <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
        <motion.div className={`h-2 rounded-full ${className}`} initial={{ width: 0 }} animate={{ width: inView ? `${percentage}%` : 0 }} transition={{ type: 'spring', stiffness: 70, damping: 12, delay: 0.2 }} />
    </div>
);

const ComparisonChart = () => {
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const isLeftInView = useInView(leftRef, { once: true, amount: 0.3 });
    const isRightInView = useInView(rightRef, { once: true, amount: 0.3 });

    const gptScores = [
        { name: 'AIME', score: 14.0 },
        { name: 'GPQA', score: 53.0 },
        { name: 'CorpFin (v2)', score: 56.6 },
        { name: 'MedQA', score: 88.2 },
        { name: 'LegalBench', score: 79.8 }
    ];

    const bestScores = [
        { name: 'AIME', score: 83.7, model: 'OpenAI o4 Mini' },
        { name: 'GPQA', score: 74.5, model: 'OpenAI o4 Mini' },
        { name: 'CorpFin (v2)', score: 68.4, model: 'Gemini 2.5 Pro' },
        { name: 'MedQA', score: 96.0, model: 'OpenAI o4 Mini' },
        { name: 'LegalBench', score: 83.6, model: 'Gemini 2.5 Pro' }
    ];

    const sorted = [...gptScores].sort((a, b) => a.score - b.score);
    const findBest = (name: string) => bestScores.find(item => item.name === name)!;

    return (
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-[rgb(35,35,35)] mb-12 text-[rgb(220,220,220)]">
            <h3 className="text-xl font-bold mb-6 text-center">Why GPT-4o is not enough</h3>
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                    <div ref={leftRef} className="bg-[rgb(15,15,15)] relative overflow-hidden rounded-lg border border-[rgb(35,35,35)] p-5">
                        <div className="absolute top-0 right-0 bg-[rgb(35,35,35)] text-[rgb(220,220,220)] text-xs px-3 py-1 rounded-bl-lg">Competitors</div>
                        <div className="flex text-start gap-4 mb-4">
                            <div>
                                <h4 className="font-bold">Single Model Approach</h4>
                                <p className="text-xs text-gray-400">Relies only on GPT-4o for all questions</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {sorted.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center mb-1 gap-1.5">
                                        <span className="text-xs font-medium">{item.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <AnimatedProgressBar percentage={item.score} className="bg-gray-400" inView={isLeftInView} />
                                        <span className="text-xs font-mono w-10 text-right">{item.score}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <div ref={rightRef} className="bg-[rgb(15,15,15)] relative overflow-hidden rounded-lg border border-purple-500/25 p-5 bg-gradient-to-br from-[rgba(80,30,120,0.1)] to-[rgba(30,80,120,0.05)]">
                        <div className="absolute top-0 right-0 bg-purple-500/25 text-purple-300 text-xs px-3 py-1 rounded-bl-lg">Our Advantage</div>
                        <div className="flex text-start gap-4 mb-4">
                            <div>
                                <h4 className="font-bold">Multi-Model AI Toolkit</h4>
                                <p className="text-xs text-gray-400">Select the optimal model for each question type</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {sorted.map((item, idx) => {
                                const best = findBest(item.name);
                                return (
                                    <div key={idx}>
                                        <div className="flex items-center mb-1 gap-1.5">
                                            <div className="flex justify-between w-full">
                                                <span className="text-xs font-medium">{best.name}</span>
                                                <span className="text-xs text-gray-400">{best.model}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <AnimatedProgressBar percentage={best.score} className="bg-gradient-to-r from-purple-500 to-blue-500" inView={isRightInView} />
                                            <span className="text-xs font-mono w-10 text-right">{best.score}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TrustedAnswersSection = () => {
    const models = [
        { name: 'o4 Mini', provider: 'OpenAI', iconPath: '/images/a.png' },
        { name: 'Gemini 2.5 Pro', provider: 'Google', iconPath: '/images/a.png' },
        { name: 'GPT-4o', provider: 'OpenAI', iconPath: '/images/a.png' },
        { name: 'DeepSeek V3', provider: 'DeepSeek', iconPath: '/images/a.png' },
        { name: 'DeepSeek R1', provider: 'DeepSeek', iconPath: '/images/a.png' }
    ];

    return (
        <section className="relative py-24 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/10 -z-10" />
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />

            <div className="w-full px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl title mb-8 py-1">Answers You Can Trust</h1>
                        <p className="text-center max-w-2xl mx-auto mb-6 subtitle">Access the world's most advanced AI models for accurate, comprehensive assistance across all subjects. From general knowledge to complex reasoning, our toolkit connects you to the best models for every task.</p>

                        <div className="mb-6 inline-flex items-center bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-full px-4 py-2 text-sm">
                            <span className="text-purple-300 font-medium">While competitors rely on just GPT-4o</span>
                            <span className="mx-2 text-gray-500">|</span>
                            <span className="text-blue-300 font-medium">We leverage the very best AI models</span>
                        </div>

                        <ComparisonChart />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {models.map((model, idx) => (
                            <ModelCard key={idx} {...model} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedAnswersSection;
