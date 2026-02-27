'use client';

import { useState, useCallback, useRef } from 'react';
import { ReactCompareSlider } from 'react-compare-slider';
import { ModelData } from '@/lib/getModels';

const options = [
    { label: '0.55 L', value: 'a' },
    { label: '0.63 L', value: 'b' },
    { label: '0.84 L', value: 'c' },
    { label: '0.98 L', value: 'd' },
];

const CORRECT = 'a';

/* ── Canvas Sidebar Icons (from Canvas LMS SVGs) ── */

const CanvasLogo = () => (
    <svg width="28" height="28" viewBox="0 0 280 259" fill="currentColor" className="opacity-80">
        <path d="M73.31,198c-11.93,0-22.22,8-24,18.73a26.67,26.67,0,0,0-.3,3.63v.3a22,22,0,0,0,5.44,14.65,22.47,22.47,0,0,0,17.22,8H200V228.19h-134V213.08H200V198Zm21-105.74h90.64V62H94.3ZM79.19,107.34V46.92H200v60.42Zm7.55,30.21V122.45H192.49v15.11ZM71.65,16.71A22.72,22.72,0,0,0,49,39.36V190.88a41.12,41.12,0,0,1,24.32-8h157V16.71ZM33.88,39.36A37.78,37.78,0,0,1,71.65,1.6H245.36V198H215.15v45.32h22.66V258.4H71.65a37.85,37.85,0,0,1-37.76-37.76Z" />
    </svg>
);

const AccountIcon = () => (
    <div className="w-[26px] h-[26px] rounded-full bg-[#4a6572] flex items-center justify-center">
        <span className="text-white text-[10px] font-medium">TS</span>
    </div>
);

const DashboardIcon = () => (
    <svg width="22" height="22" viewBox="0 0 280 200" fill="currentColor">
        <path d="M273.09,180.75H197.47V164.47h62.62A122.16,122.16,0,1,0,17.85,142a124,124,0,0,0,2,22.51H90.18v16.29H6.89l-1.5-6.22A138.51,138.51,0,0,1,1.57,142C1.57,65.64,63.67,3.53,140,3.53S278.43,65.64,278.43,142a137.67,137.67,0,0,1-3.84,32.57ZM66.49,87.63,50.24,71.38,61.75,59.86,78,76.12Zm147,0L202,76.12l16.25-16.25,11.51,11.51ZM131.85,53.82v-23h16.29v23Zm15.63,142.3a31.71,31.71,0,0,1-28-16.81c-6.4-12.08-15.73-72.29-17.54-84.25a8.15,8.15,0,0,1,13.58-7.2c8.88,8.21,53.48,49.72,59.88,61.81a31.61,31.61,0,0,1-27.9,46.45ZM121.81,116.2c4.17,24.56,9.23,50.21,12,55.49A15.35,15.35,0,1,0,161,157.3C158.18,152,139.79,133.44,121.81,116.2Z" />
    </svg>
);

const CoursesIcon = () => (
    <svg width="22" height="22" viewBox="0 0 280 259" fill="currentColor">
        <path d="M73.31,198c-11.93,0-22.22,8-24,18.73a26.67,26.67,0,0,0-.3,3.63v.3a22,22,0,0,0,5.44,14.65,22.47,22.47,0,0,0,17.22,8H200V228.19h-134V213.08H200V198Zm21-105.74h90.64V62H94.3ZM79.19,107.34V46.92H200v60.42Zm7.55,30.21V122.45H192.49v15.11ZM71.65,16.71A22.72,22.72,0,0,0,49,39.36V190.88a41.12,41.12,0,0,1,24.32-8h157V16.71ZM33.88,39.36A37.78,37.78,0,0,1,71.65,1.6H245.36V198H215.15v45.32h22.66V258.4H71.65a37.85,37.85,0,0,1-37.76-37.76Z" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="22" height="22" viewBox="0 0 280 280" fill="currentColor">
        <path d="M197.07,213.38h16.31V197.07H197.07Zm-16.31,16.31V180.76h48.92v48.92Zm-48.92-16.31h16.31V197.07H131.85Zm-16.31,16.31V180.76h48.92v48.92ZM66.62,213.38H82.93V197.07H66.62ZM50.32,229.68V180.76H99.24v48.92Zm146.75-81.53h16.31V131.85H197.07Zm-16.31,16.31V115.54h48.92v48.92Zm-48.92-16.31h16.31V131.85H131.85Zm-16.31,16.31V115.54h48.92v48.92ZM66.62,148.15H82.93V131.85H66.62ZM50.32,164.46V115.54H99.24v48.92ZM34,262.29H246V82.93H34ZM246,66.62V42.16A8.17,8.17,0,0,0,237.84,34H213.38v8.15a8.15,8.15,0,1,1-16.31,0V34H82.93v8.15a8.15,8.15,0,0,1-16.31,0V34H42.16A8.17,8.17,0,0,0,34,42.16V66.62Zm-8.15-48.92a24.49,24.49,0,0,1,24.46,24.46V278.6H17.71V42.16A24.49,24.49,0,0,1,42.16,17.71H66.62V9.55a8.15,8.15,0,0,1,16.31,0v8.15H197.07V9.55a8.15,8.15,0,1,1,16.31,0v8.15Z" />
    </svg>
);

const InboxIcon = () => (
    <svg width="22" height="22" viewBox="0 0 280 280" fill="currentColor">
        <path d="M91.72,120.75h96.56V104.65H91.72Zm0,48.28h80.47V152.94H91.72Zm0-96.56h80.47V56.37H91.72Zm160.94,34.88H228.52V10.78h-177v96.56H27.34A24.17,24.17,0,0,0,3.2,131.48V244.14a24.17,24.17,0,0,0,24.14,24.14H252.66a24.17,24.17,0,0,0,24.14-24.14V131.48A24.17,24.17,0,0,0,252.66,107.34Zm0,16.09a8.06,8.06,0,0,1,8,8v51.77l-32.19,19.31V123.44ZM67.58,203.91v-177H212.42v177ZM27.34,123.44H51.48v79.13L19.29,183.26V131.48A8.06,8.06,0,0,1,27.34,123.44ZM252.66,252.19H27.34a8.06,8.06,0,0,1-8-8V202l30,18H230.75l30-18v42.12A8.06,8.06,0,0,1,252.66,252.19Z" />
    </svg>
);

const HistoryIcon = () => (
    <svg width="22" height="22" viewBox="0 0 1920 1920" fill="currentColor">
        <path d="M960 112.941c-467.125 0-847.059 379.934-847.059 847.059 0 467.125 379.934 847.059 847.059 847.059 467.125 0 847.059-379.934 847.059-847.059 0-467.125-379.934-847.059-847.059-847.059M960 1920C430.645 1920 0 1489.355 0 960S430.645 0 960 0s960 430.645 960 960-430.645 960-960 960m417.905-575.955L903.552 988.28V395.34h112.941v536.47l429.177 321.77-67.765 90.465z" />
    </svg>
);

const HelpIcon = () => (
    <svg width="22" height="22" viewBox="0 0 200 200" fill="currentColor">
        <path d="M94.42,139h11.15V105.58H94.42ZM83.27,150.19V94.42h33.46v55.76ZM100,72.12A11.15,11.15,0,1,1,111.15,61,11.16,11.16,0,0,1,100,72.12Zm0-33.46A22.31,22.31,0,1,0,122.31,61,22.33,22.33,0,0,0,100,38.66M100,5.2A94.8,94.8,0,1,0,194.8,100,94.91,94.91,0,0,0,100,5.2m0,178.45A83.65,83.65,0,1,1,183.65,100,83.73,83.73,0,0,1,100,183.65" />
    </svg>
);

const CollapseIcon = () => (
    <svg width="20" height="16" viewBox="0 0 40 32" fill="currentColor">
        <path d="M39.5,30.28V2.48H37.18v27.8Zm-4.93-13.9L22.17,4,20.53,5.61l9.61,9.61H.5v2.31H30.14l-9.61,9.61,1.64,1.64Z" />
    </svg>
);

const sidebarItems = [
    { icon: <AccountIcon />, label: 'Account', active: false },
    { icon: <DashboardIcon />, label: 'Dashboard', active: false },
    { icon: <CoursesIcon />, label: 'Courses', active: true },
    { icon: <CalendarIcon />, label: 'Calendar', active: false },
    { icon: <InboxIcon />, label: 'Inbox', active: false },
    { icon: <HistoryIcon />, label: 'History', active: false },
    { icon: <HelpIcon />, label: 'Help', active: false },
];

const CanvasSidebar = () => (
    <div
        className="hidden sm:flex flex-col items-center w-[60px] shrink-0 py-3 gap-0.5"
        style={{ background: '#344451' }}
    >
        <div className="mb-3">
            <CanvasLogo />
        </div>
        {sidebarItems.map((item) => (
            <div
                key={item.label}
                className={`flex flex-col items-center justify-center w-full py-1.5 text-white/80 ${
                    item.active
                        ? 'border-l-[3px] border-white bg-white/10'
                        : 'border-l-[3px] border-transparent'
                }`}
            >
                <div className="opacity-80">{item.icon}</div>
                <span className="text-[8px] mt-0.5 opacity-70">{item.label}</span>
            </div>
        ))}
        <div className="mt-auto pt-4 text-white/50">
            <CollapseIcon />
        </div>
    </div>
);

/* ── Quiz question components ── */

const stopSlider = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
};

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
        onPointerDown={stopSlider}
        onClick={(e) => {
            e.stopPropagation();
            onSelect();
        }}
    >
        <div
            className={`w-[14px] h-[14px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                checked
                    ? 'border-[#4A90D9] bg-[#4A90D9]'
                    : 'border-[#555]'
            }`}
        >
            {checked && (
                <div className="w-[5px] h-[5px] rounded-full bg-white" />
            )}
        </div>
        <span className="text-[#E0E0E0] text-[13px]">{label}</span>
    </label>
);

const Spinner = () => (
    <svg className="animate-spin h-3.5 w-3.5 text-[#ccc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

    const handleAiClick = useCallback((e: React.MouseEvent, btnId: string) => {
        e.stopPropagation();
        if (loadingBtn) return;

        if (timerRef.current) clearTimeout(timerRef.current);

        if (showButtons === 'visible') {
            setLoadingBtn(btnId);
            timerRef.current = setTimeout(() => {
                setLoadingBtn(null);
                onSelect(CORRECT);
            }, 1000);
        } else {
            setLoadingBtn(btnId);
            timerRef.current = setTimeout(() => {
                setLoadingBtn(null);
                onSelect(CORRECT);
            }, 1000);
        }
    }, [loadingBtn, onSelect, showButtons]);

    return (
        <div className="flex w-full" style={{ background: '#161616' }}>
            <CanvasSidebar />
            <div className="flex-1 min-w-0 px-5 pt-5 pb-3 flex items-start justify-center">
                <div className="border border-[#2a2a2a] overflow-hidden w-full max-w-[55%]">
                    <div
                        className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a]"
                        style={{ background: '#1E1E1E' }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[#E0E0E0] font-bold text-[14px]">
                                Question 2
                            </span>
                            {showButtons === 'visible' ? (
                                <button
                                    onPointerDown={stopSlider}
                                    onClick={(e) => handleAiClick(e, 'primary')}
                                    disabled={loadingBtn !== null}
                                    className="px-2.5 py-1 text-[11px] font-medium rounded bg-[#333] text-[#ccc] hover:bg-[#444] transition-colors cursor-pointer inline-flex items-center gap-1.5 justify-center"
                                >
                                    {loadingBtn === 'primary' ? <Spinner /> : primaryName}
                                </button>
                            ) : (
                                <button
                                    onPointerDown={stopSlider}
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
                                    onPointerDown={stopSlider}
                                    onClick={(e) => handleAiClick(e, 'secondary')}
                                    disabled={loadingBtn !== null}
                                    className="px-2.5 py-1 text-[11px] font-medium rounded bg-[#333] text-[#ccc] hover:bg-[#444] transition-colors cursor-pointer inline-flex items-center gap-1.5 justify-center"
                                >
                                    {loadingBtn === 'secondary' ? <Spinner /> : secondaryName}
                                </button>
                            ) : (
                                <button
                                    onPointerDown={stopSlider}
                                    onClick={(e) => handleAiClick(e, 'secondary')}
                                    disabled={loadingBtn !== null}
                                    className="px-2.5 py-1 text-[11px] font-medium rounded border-2 border-dashed border-red-500/60 cursor-pointer hover:border-red-500/80 transition-colors inline-flex items-center justify-center"
                                >
                                    <span className="invisible">{secondaryName}</span>
                                </button>
                            )}
                            <span className="text-[#E0E0E0] text-[13px] font-medium whitespace-nowrap">
                                1 pts
                            </span>
                        </div>
                    </div>

                    <div style={{ background: '#161616' }}>
                        <div className="px-5 py-4">
                            <p className="text-[#E0E0E0] text-[13px] leading-relaxed">
                                Molten AlCl3 is electrolyzed for 5.0 hours with a
                                current of 0.40 amperes. Metallic aluminum is
                                produced at one electrode and chlorine gas, Cl2, is
                                produced at the other. How many liters of Cl2
                                measured at STP are produced when the electrode
                                efficiency is only 65%?
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
            </div>
        </div>
    );
};

const MockQuizContent = ({ models }: { models: ModelData }) => {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = useCallback((value: string) => {
        setSelected(value);
    }, []);

    return (
        <div className="relative overflow-hidden" style={{ background: '#161616' }}>
            <ReactCompareSlider
                onlyHandleDraggable
                handle={
                    <div className="group flex flex-col items-center h-full cursor-ew-resize">
                        {/* Top line */}
                        <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/25 to-white/40" />
                        {/* Handle pill */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-white/20 blur-md scale-150" />
                            <div className="relative flex items-center gap-1 px-2 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)]
                                group-hover:bg-white/15 group-hover:border-white/30 group-hover:shadow-[0_4px_32px_rgba(255,255,255,0.08)] transition-all duration-300">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-90 transition-opacity">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                <div className="w-px h-4 bg-white/20" />
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-90 transition-opacity">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </div>
                        </div>
                        {/* Bottom line */}
                        <div className="w-px flex-1 bg-gradient-to-b from-white/40 via-white/25 to-transparent" />
                    </div>
                }
                itemOne={
                    <QuestionCard
                        selected={selected}
                        onSelect={handleSelect}
                        showButtons="visible"
                        primaryName={models.defaultPrimary}
                        secondaryName={models.defaultSecondary}
                    />
                }
                itemTwo={
                    <QuestionCard
                        selected={selected}
                        onSelect={handleSelect}
                        showButtons="hidden"
                        primaryName={models.defaultPrimary}
                        secondaryName={models.defaultSecondary}
                    />
                }
                position={50}
                style={{ width: '100%' }}
            />
        </div>
    );
};

export default MockQuizContent;
