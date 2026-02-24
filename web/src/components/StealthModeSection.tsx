'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ModelData } from '@/lib/getModels';

const options = [
    { label: '0.55 L', value: 'a' },
    { label: '0.63 L', value: 'b' },
    { label: '0.84 L', value: 'c' },
    { label: '0.98 L', value: 'd' },
];

const CORRECT = 'a';

const RadioOption = ({
    label,
    checked,
    onSelect,
}: {
    label: string;
    checked: boolean;
    onSelect: () => void;
}) => (
    <label
        className="flex items-center gap-3 py-2.5 cursor-pointer border-t border-[#2a2a2a]"
        onClick={(e) => {
            e.stopPropagation();
            onSelect();
        }}
    >
        <div
            className={`w-[14px] h-[14px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                checked ? 'border-[#4A90D9] bg-[#4A90D9]' : 'border-[#555]'
            }`}
        >
            {checked && <div className="w-[5px] h-[5px] rounded-full bg-white" />}
        </div>
        <span className="text-[#E0E0E0] text-[13px]">{label}</span>
    </label>
);

const Spinner = () => (
    <svg
        className="animate-spin h-3.5 w-3.5 text-[#ccc]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

const QuestionCard = ({
    selected,
    onSelect,
    showButtons,
    primaryName,
    secondaryName,
}: {
    selected: string | null;
    onSelect: (v: string) => void;
    showButtons: 'visible' | 'hidden';
    primaryName: string;
    secondaryName: string;
}) => {
    const [loadingBtn, setLoadingBtn] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleAiClick = useCallback(
        (e: React.MouseEvent, btnId: string) => {
            e.stopPropagation();
            if (loadingBtn) return;

            if (timerRef.current) clearTimeout(timerRef.current);

            setLoadingBtn(btnId);
            timerRef.current = setTimeout(() => {
                setLoadingBtn(null);
                onSelect(CORRECT);
            }, 1000);
        },
        [loadingBtn, onSelect],
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <div className="w-full border border-[#2a2a2a] rounded-none overflow-hidden" style={{ background: '#161616' }}>
            <div
                className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a]"
                style={{ background: '#1E1E1E' }}
            >
                <div className="flex items-center gap-3">
                    <span className="text-[#E0E0E0] font-bold text-[14px]">Question 2</span>
                    {showButtons === 'visible' ? (
                        <button
                            onClick={(e) => handleAiClick(e, 'primary')}
                            disabled={loadingBtn !== null}
                            className="px-2.5 py-1 text-[11px] font-medium rounded bg-[#333] text-[#ccc] hover:bg-[#444] transition-colors cursor-pointer inline-flex items-center gap-1.5 justify-center"
                        >
                            {loadingBtn === 'primary' ? <Spinner /> : primaryName}
                        </button>
                    ) : (
                        <button
                            onClick={(e) => handleAiClick(e, 'primary')}
                            disabled={loadingBtn !== null}
                            className="px-2.5 py-1 text-[11px] font-medium rounded border-2 border-dashed border-red-500/60 cursor-pointer hover:border-red-500/80 transition-colors inline-flex items-center justify-center"
                        >
                            <span className="invisible">{primaryName}</span>
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {showButtons === 'visible' ? (
                        <button
                            onClick={(e) => handleAiClick(e, 'secondary')}
                            disabled={loadingBtn !== null}
                            className="px-2.5 py-1 text-[11px] font-medium rounded bg-[#333] text-[#ccc] hover:bg-[#444] transition-colors cursor-pointer inline-flex items-center gap-1.5 justify-center"
                        >
                            {loadingBtn === 'secondary' ? <Spinner /> : secondaryName}
                        </button>
                    ) : (
                        <button
                            onClick={(e) => handleAiClick(e, 'secondary')}
                            disabled={loadingBtn !== null}
                            className="px-2.5 py-1 text-[11px] font-medium rounded border-2 border-dashed border-red-500/60 cursor-pointer hover:border-red-500/80 transition-colors inline-flex items-center justify-center"
                        >
                            <span className="invisible">{secondaryName}</span>
                        </button>
                    )}
                    <span className="text-[#E0E0E0] text-[13px] font-medium whitespace-nowrap">1 pts</span>
                </div>
            </div>

            <div style={{ background: '#161616' }}>
                <div className="px-5 py-4">
                    <p className="text-[#E0E0E0] text-[13px] leading-relaxed">
                        Molten AlCl3 is electrolyzed for 5.0 hours with a current of 0.40 amperes. Metallic aluminum is
                        produced at one electrode and chlorine gas, Cl2, is produced at the other. How many liters of Cl2
                        measured at STP are produced when the electrode efficiency is only 65%?
                    </p>
                </div>

                <div className="mx-5 mb-4">
                    {options.map((opt) => (
                        <RadioOption
                            key={opt.value}
                            label={opt.label}
                            checked={selected === opt.value}
                            onSelect={() => onSelect(opt.value)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ArrowIcon = () => (
    <div className="flex items-center justify-center text-[#E5E5E5]/20">
        <div className="hidden lg:block">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path
                    fillRule="evenodd"
                    d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                />
            </svg>
        </div>
        <div className="block lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path
                    fillRule="evenodd"
                    d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
                />
            </svg>
        </div>
    </div>
);

const StealthModeSection = ({ models }: { models: ModelData }) => {
    const [leftSelected, setLeftSelected] = useState<string | null>(null);
    const [rightSelected, setRightSelected] = useState<string | null>(null);

    const handleLeftSelect = useCallback((value: string) => {
        setLeftSelected(value);
    }, []);

    const handleRightSelect = useCallback((value: string) => {
        setRightSelected(value);
    }, []);

    return (
        <section className="relative py-14 w-full overflow-hidden">
            <div className="w-full px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-[#E5E5E5] text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-tight">
                            Fully Invisible Integration
                        </h2>
                        <p className="text-[#E5E5E5]/40 text-sm md:text-[15px] leading-relaxed mt-4 max-w-xl mx-auto">
                            Two customizable AI-powered buttons select correct answers automatically, then turn invisible
                            when stealth mode activates.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-4">
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-[#E5E5E5]/40" />
                                    <span className="text-[#E5E5E5]/60 text-xs font-medium">Standard Mode</span>
                                </div>
                                <span className="text-[#E5E5E5]/25 text-[10px] font-medium tracking-wide uppercase">
                                    Visible
                                </span>
                            </div>
                            <QuestionCard
                                selected={leftSelected}
                                onSelect={handleLeftSelect}
                                showButtons="visible"
                                primaryName={models.defaultPrimary}
                                secondaryName={models.defaultSecondary}
                            />
                        </div>

                        <div className="flex items-center justify-center py-2 lg:py-0">
                            <ArrowIcon />
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-[#E5E5E5]" />
                                    <span className="text-[#E5E5E5]/60 text-xs font-medium">Stealth Mode</span>
                                </div>
                                <span className="text-[#E5E5E5]/50 text-[10px] font-medium tracking-wide uppercase">
                                    Hidden
                                </span>
                            </div>
                            <QuestionCard
                                selected={rightSelected}
                                onSelect={handleRightSelect}
                                showButtons="hidden"
                                primaryName={models.defaultPrimary}
                                secondaryName={models.defaultSecondary}
                            />
                        </div>
                    </div>

                    <p className="text-center text-[#E5E5E5]/20 text-[11px] mt-6">
                        Click the AI buttons to see them select the correct answer automatically
                    </p>
                </div>
            </div>
        </section>
    );
};

export default StealthModeSection;
