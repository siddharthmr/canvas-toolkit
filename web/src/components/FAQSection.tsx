'use client';

import { useState } from 'react';

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-[rgb(35,35,35)]">
            <button onClick={() => setIsOpen(!isOpen)} className="flex justify-between items-center w-full py-5 text-left text-[rgb(220,220,220)] hover:text-gray-300 focus:outline-none">
                <span className="text-lg font-medium">{question}</span>
                <svg className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && (
                <div className="pb-5 pr-4 pl-4 text-gray-400 text-left">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

const FAQSection = () => {
    const faqs = [
        {
            question: 'What questions does CanvasToolkit support?',
            answer: 'Currently, CanvasToolkit only supports multiple choice questions from Canvas LMS. We are working on expanding support to other question types in the future.'
        },
        {
            question: 'Is CanvasToolkit free to use?',
            answer: 'AI Integration is the only paid feature. The rest of the features are free to use and are automatically active upon installation.'
        },
        {
            question: 'Is CanvasToolkit fully undetected?',
            answer: 'Yes. Contact us if you have any concerns.'
        },
        {
            question: 'Is using CanvasToolkit cheating?',
            answer: 'No, it is not cheating. It is a tool that helps you learn and understand the material better.'
        },
        {
            question: 'Do I need an account to use CanvasToolkit?',
            answer: 'An account is required to use the AI Integration feature. The rest of the features are free to use and are automatically active upon installation, no account needed.'
        }
    ];

    return (
        <section className="relative py-24 w-full overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />

            <div className="w-full px-4 text-center">
                <div className="max-w-3xl mx-auto flex flex-col items-center justify-center">
                    <h1 className="text-5xl bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-8 py-1 title">Frequently Asked Questions</h1>

                    <p className="text-center mb-12 max-w-2xl subtitle">Find answers to common questions about CanvasToolkit. If you don't see your question here, feel free to contact us.</p>

                    <div className="w-full bg-black/30 backdrop-blur-md rounded-lg p-6 border border-[rgb(35,35,35)]">
                        <div className="w-full">
                            {faqs.map((faq, index) => (
                                <FAQItem key={index} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
