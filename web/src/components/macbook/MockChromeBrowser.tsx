import { ReactNode } from 'react';

const TabBar = () => (
    <div className="flex items-center h-[36px] gap-0" style={{ background: '#1F2020' }}>
        {/* Traffic lights */}
        <div className="flex items-center gap-[7px] px-3 shrink-0">
            <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
            <div className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
            <div className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
        </div>

        {/* Active tab */}
        <div
            className="flex items-center gap-2 h-[28px] self-end px-4 rounded-t-lg text-[12px] text-[#E0E0E0] min-w-[120px] max-w-[200px] ml-1"
            style={{ background: '#282828' }}
        >
            <div className="w-4 h-4 rounded-sm bg-[#D44638] flex items-center justify-center shrink-0">
                <span className="text-white text-[8px] font-bold">Q</span>
            </div>
            <span className="truncate">Quiz</span>
            <span className="ml-auto text-[#999] text-[10px] cursor-default">&times;</span>
        </div>

        {/* New tab + */}
        <div className="flex items-center px-2 self-end h-[28px] text-[#666] text-[16px] cursor-default">
            +
        </div>

        <div className="flex-1" />
    </div>
);

const UrlBar = () => (
    <div className="flex items-center h-[34px] px-3 gap-2" style={{ background: '#282828' }}>
        <div className="flex items-center gap-1.5 text-[#666]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
        </div>

        <div
            className="flex-1 flex items-center h-[24px] rounded-full px-3 text-[12px] text-[#999]"
            style={{ background: '#1F2020' }}
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" className="mr-2 shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span className="truncate">canvas.instructure.com/courses/</span>
        </div>

        <div className="flex items-center gap-2 text-[#666]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        </div>
    </div>
);

const MockChromeBrowser = ({ children }: { children: ReactNode }) => (
    <div className="flex flex-col select-none rounded-xl overflow-hidden" style={{ background: '#1F2020' }}>
        <TabBar />
        <UrlBar />
        <div style={{ background: '#161616' }}>{children}</div>
    </div>
);

export default MockChromeBrowser;
