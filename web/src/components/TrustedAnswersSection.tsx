'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const AnimatedBar = ({ percentage, variant, inView, delay = 0 }: { percentage: number; variant: 'muted' | 'bright'; inView: boolean; delay?: number }) => (
    <div className="w-full bg-[#E5E5E5]/[0.06] rounded-full h-1.5">
        <motion.div
            className={`h-1.5 rounded-full ${variant === 'bright' ? 'bg-[#E5E5E5]' : 'bg-[#E5E5E5]/25'}`}
            initial={{ width: 0 }}
            animate={{ width: inView ? `${percentage}%` : 0 }}
            transition={{ type: 'spring', stiffness: 60, damping: 14, delay: delay * 0.08 + 0.15 }}
        />
    </div>
);

const ComparisonChart = () => {
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const isLeftInView = useInView(leftRef, { once: true, amount: 0.3 });
    const isRightInView = useInView(rightRef, { once: true, amount: 0.3 });

    const competitorScores = [
        { name: 'AIME', score: 26.3, description: 'Mathematics competition' },
        { name: 'GPQA', score: 58.4, description: 'Graduate-level science' },
        { name: 'MedQA', score: 92.4, description: 'Medical board exams' },
        { name: 'LegalBench', score: 79.8, description: 'Legal reasoning' },
        { name: 'HumanEval', score: 90.2, description: 'Code generation' },
    ];

    const bestScores = [
        { name: 'AIME', score: 96.7, model: 'GPT 5.2', description: 'Mathematics competition' },
        { name: 'GPQA', score: 87.7, model: 'GPT 5.2', description: 'Graduate-level science' },
        { name: 'MedQA', score: 96.8, model: 'Gemini 3 Pro', description: 'Medical board exams' },
        { name: 'LegalBench', score: 88.2, model: 'Gemini 3 Pro', description: 'Legal reasoning' },
        { name: 'HumanEval', score: 97.2, model: 'Gemini 3 Pro', description: 'Code generation' },
    ];

    const sorted = [...competitorScores].sort((a, b) => a.score - b.score);
    const findBest = (name: string) => bestScores.find(item => item.name === name)!;

    return (
        <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Competitors */}
            <div className="flex-1">
                <div ref={leftRef} className="h-full rounded-xl border border-[#E5E5E5]/[0.06] p-5 md:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h4 className="text-[#E5E5E5] text-sm font-semibold tracking-[-0.02em]">Single Model</h4>
                            <p className="text-[#E5E5E5]/30 text-[11px] mt-0.5">Relies on GPT 5.2 for everything</p>
                        </div>
                        <span className="text-[#E5E5E5]/20 text-[10px] font-medium tracking-wide uppercase">Competitors</span>
                    </div>
                    <div className="space-y-4">
                        {sorted.map((item, idx) => (
                            <div key={idx}>
                                <div className="flex items-baseline justify-between mb-1.5">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[#E5E5E5]/70 text-xs font-medium">{item.name}</span>
                                        <span className="text-[#E5E5E5]/20 text-[10px]">{item.description}</span>
                                    </div>
                                    <span className="text-[#E5E5E5]/30 text-xs tabular-nums">{item.score}%</span>
                                </div>
                                <AnimatedBar percentage={item.score} variant="muted" inView={isLeftInView} delay={idx} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Our Advantage */}
            <div className="flex-1">
                <div ref={rightRef} className="h-full rounded-xl border border-[#E5E5E5]/[0.08] bg-[#E5E5E5]/[0.02] p-5 md:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h4 className="text-[#E5E5E5] text-sm font-semibold tracking-[-0.02em]">Multi-Model</h4>
                            <p className="text-[#E5E5E5]/30 text-[11px] mt-0.5">Best model for each question type</p>
                        </div>
                        <span className="text-[#E5E5E5]/50 text-[10px] font-medium tracking-wide uppercase">CanvasToolkit</span>
                    </div>
                    <div className="space-y-4">
                        {sorted.map((item, idx) => {
                            const best = findBest(item.name);
                            return (
                                <div key={idx}>
                                    <div className="flex items-baseline justify-between mb-1.5">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[#E5E5E5]/70 text-xs font-medium">{best.name}</span>
                                            <span className="text-[#E5E5E5]/20 text-[10px]">{best.description}</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[#E5E5E5]/25 text-[10px]">{best.model}</span>
                                            <span className="text-[#E5E5E5] text-xs font-medium tabular-nums">{best.score}%</span>
                                        </div>
                                    </div>
                                    <AnimatedBar percentage={best.score} variant="bright" inView={isRightInView} delay={idx} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const models = [
    { name: 'GPT 5.2', provider: 'OpenAI' },
    { name: 'Gemini 3 Pro', provider: 'Google' },
    { name: 'GPT-4o', provider: 'OpenAI' },
    { name: 'DeepSeek V3', provider: 'DeepSeek' },
    { name: 'DeepSeek R1', provider: 'DeepSeek' },
];

const TrustedAnswersSection = () => {
    return (
        <section className="relative pt-14 md:pt-16 pb-24 w-full overflow-hidden">
            <div className="w-full px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-[#E5E5E5] text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-tight">
                            Answers You Can Trust
                        </h2>
                        <p className="text-[#E5E5E5]/40 text-sm md:text-[15px] leading-relaxed mt-4 max-w-xl mx-auto">
                            Access the best AI models for accurate, comprehensive assistance across every subject.
                        </p>

                        {/* Pill */}
                        <div className="mt-6 mb-10 inline-flex items-center rounded-full border border-[#E5E5E5]/[0.06] px-4 py-2 text-xs">
                            <span className="text-[#E5E5E5]/40">While competitors rely on just GPT 5.2</span>
                            <span className="mx-2.5 w-px h-3 bg-[#E5E5E5]/10" />
                            <span className="text-[#E5E5E5]/70 font-medium">We leverage the very best models</span>
                        </div>
                    </div>

                    {/* Comparison */}
                    <ComparisonChart />

                    {/* Model chips */}
                    <div className="flex flex-wrap justify-center gap-2 mt-10">
                        {models.map((model, idx) => (
                            <div
                                key={idx}
                                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5]/[0.06] px-3.5 py-2"
                            >
                                <span className="text-[#E5E5E5]/70 text-xs font-medium">{model.name}</span>
                                <span className="text-[#E5E5E5]/20 text-[10px]">{model.provider}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedAnswersSection;
