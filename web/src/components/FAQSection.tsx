'use client';

import { useState } from 'react';

type FAQItem = {
    question: string;
    answer: string;
};

const faqs: FAQItem[] = [
    {
        question: 'What questions does CanvasToolkit support?',
        answer:
            'CanvasToolkit supports all question types on Classic Quizzes, and we are actively working on support for New Quizzes. We highly recommend testing on a practice quiz/test first before using it in a proctored environment.',
    },
    {
        question: 'Is AI usage unlimited?',
        answer:
            'To prevent abuse and overuse, AI usage is provided through monthly credits that we believe are more than enough for most users. If you feel it is not enough, reach out to us on Discord.',
    },
    {
        question: 'Is CanvasToolkit fully undetected?',
        answer: 'Yes. If you have specific concerns about your environment, contact support directly.',
    },
    {
        question: 'Is using CanvasToolkit cheating?',
        answer:
            'CanvasToolkit is built as an assistance tool. You are responsible for following your school, class, and exam policies.',
    },
    {
        question: 'Do I need an account to use CanvasToolkit?',
        answer:
            'Yes. You need an account to purchase and manage a plan, and an active plan is required to use all CanvasToolkit features.',
    },
];

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number>(-1);

    return (
        <section className="relative py-14 w-full overflow-hidden">
            <div className="w-full px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-[#E5E5E5] text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-tight">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-[#E5E5E5]/40 text-sm md:text-[15px] leading-relaxed mt-4 max-w-2xl mx-auto">
                            Quick answers to common CanvasToolkit questions. If your question is not listed, contact us.
                        </p>
                    </div>

                    <div className="space-y-2">
                        {faqs.map((faq, index) => {
                            const isOpen = openIndex === index;

                            return (
                                <div
                                    key={faq.question}
                                    className={`border transition-colors ${
                                        isOpen
                                            ? 'rounded-lg border-[#344451]/60 bg-[#13171b]'
                                            : 'rounded-lg border-[#2a2a2a] bg-[#121212] hover:border-[#344451]/35'
                                    }`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                        aria-expanded={isOpen}
                                        className="w-full px-4 md:px-5 py-4 text-left flex items-center gap-4"
                                    >
                                        <span className="text-[11px] md:text-xs font-mono text-[#E5E5E5]/30 shrink-0">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span className="flex-1 text-[#E5E5E5] text-[18px] md:text-[30px] leading-tight tracking-[-0.02em]">
                                            {faq.question}
                                        </span>
                                        <span
                                            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-lg transition-all ${
                                                isOpen
                                                    ? 'border-[#344451] bg-[#1a232b] text-[#c9d7e1]'
                                                    : 'border-[#2f2f2f] text-[#7f7f7f]'
                                            }`}
                                        >
                                            {isOpen ? '−' : '+'}
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-[#344451]/40 px-4 md:px-5 py-4">
                                            <p className="text-[#C2C2C2] text-sm md:text-[15px] leading-relaxed max-w-4xl pl-6 md:pl-9">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
