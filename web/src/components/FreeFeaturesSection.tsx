type LogEvent = {
    time: string;
    kind: 'default' | 'answer' | 'warning' | 'success' | 'viewed';
    question?: string;
    text?: string;
    tooltip?: string;
};

type SessionPanelProps = {
    label: string;
    statusText: string;
    statusTone: 'tracked' | 'disabled';
    startedAt: string;
    events: LogEvent[];
};

const beforeEvents: LogEvent[] = [
    { time: '00:01', kind: 'default', text: 'Session started' },
    { time: '00:07', kind: 'answer', question: '#1' },
    {
        time: '00:08',
        kind: 'warning',
        text: 'Stopped viewing the Canvas quiz-taking page...',
        tooltip: 'Cheating detected',
    },
    { time: '00:08', kind: 'success', text: 'Resumed.' },
    { time: '00:11', kind: 'answer', question: '#2' },
    {
        time: '00:12',
        kind: 'warning',
        text: 'Stopped viewing the Canvas quiz-taking page...',
        tooltip: 'Cheating detected',
    },
    { time: '00:12', kind: 'success', text: 'Resumed.' },
    { time: '00:13', kind: 'answer', question: '#3' },
];

const afterEvents: LogEvent[] = [
    { time: '00:01', kind: 'default', text: 'Session started' },
    { time: '00:02', kind: 'answer', question: '#1' },
    { time: '00:10', kind: 'answer', question: '#1' },
    { time: '00:16', kind: 'answer', question: '#3' },
    { time: '00:19', kind: 'viewed', question: '#3' },
    { time: '00:21', kind: 'answer', question: '#2' },
    { time: '00:24', kind: 'answer', question: '#1' },
    { time: '00:27', kind: 'answer', question: '#2' },
];

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

const StatusStrip = ({ label, statusText, statusTone }: Pick<SessionPanelProps, 'label' | 'statusText' | 'statusTone'>) => {
    const dotClass = statusTone === 'tracked' ? 'bg-[#E5E5E5]/40' : 'bg-[#E5E5E5]';
    const statusClass =
        statusTone === 'tracked'
            ? 'text-[#E5E5E5]/25'
            : 'text-[#E5E5E5]/50';

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                <span className="text-[#E5E5E5]/60 text-xs font-medium">{label}</span>
            </div>
            <span className={`text-[10px] font-medium tracking-wide uppercase ${statusClass}`}>{statusText}</span>
        </div>
    );
};

const EventIcon = ({ kind }: { kind: LogEvent['kind'] }) => {
    if (kind === 'warning') {
        return (
            <span className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full border border-[#ff5757]/60 text-[#ff7070] text-[8px] leading-none">
                !
            </span>
        );
    }

    if (kind === 'success') {
        return (
            <span className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full border border-[#344451]/80 text-[#344451] text-[8px] leading-none">
                ✓
            </span>
        );
    }

    return <span className="inline-flex h-[14px] w-[14px] rounded-full border border-[#5a5a5a]" />;
};

const EventText = ({ event }: { event: LogEvent }) => {
    if (event.kind === 'answer') {
        return (
            <span className="inline-block leading-5 text-[#D9D9D9]">
                Answered question: <span className="text-[#344451] font-medium">{event.question}</span>
            </span>
        );
    }

    if (event.kind === 'viewed') {
        return (
            <span className="inline-block leading-5 text-[#D9D9D9]">
                Viewed (and possibly read) question <span className="text-[#344451] font-medium">{event.question}</span>
            </span>
        );
    }

    if (event.kind === 'warning') {
        return (
            <span className="relative group inline-flex items-center leading-5 text-[#ff7070]" title={event.tooltip || 'Cheating detected'}>
                {event.text}
                <span className="pointer-events-none absolute left-0 top-full z-10 mt-1 translate-y-1 whitespace-nowrap border border-[#4b1f25] bg-[#140f10] px-2 py-1 text-[10px] text-[#ff8e9a] opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                    {event.tooltip || 'Cheating detected'}
                </span>
            </span>
        );
    }

    if (event.kind === 'success') {
        return <span className="inline-block leading-5 text-[#9fc5e8]">{event.text}</span>;
    }

    return <span className="inline-block leading-5 text-[#D9D9D9]">{event.text}</span>;
};

const SessionPanel = ({ label, statusText, statusTone, startedAt, events }: SessionPanelProps) => (
    <div className="flex-1 flex flex-col gap-3">
        <StatusStrip label={label} statusText={statusText} statusTone={statusTone} />
        <div className="border border-[#2a2a2a] bg-[#161616] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] bg-[#1E1E1E] px-3.5 py-2.5">
                <h3 className="text-[#E0E0E0] text-[17px] md:text-[19px] font-semibold tracking-tight">Session Information</h3>
                <button className="h-7 w-7 border border-[#2a2a2a] bg-[#171717] text-[14px] text-[#A0A0A0] hover:text-[#D0D0D0] transition-colors" aria-label="Refresh session information">
                    ↻
                </button>
            </div>

            <div className="px-3.5 py-3.5 space-y-3">
                <div className="space-y-1 text-[#D9D9D9]">
                    <div className="flex flex-wrap items-center gap-2 text-[16px] md:text-[17px]">
                        <span className="text-[#AFAFAF] font-medium">Started at</span>
                        <span>{startedAt}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[16px] md:text-[17px]">
                        <span className="text-[#AFAFAF] font-medium">Attempt</span>
                        <span className="inline-flex h-7 min-w-7 items-center justify-center border border-[#2a2a2a] bg-[#1E1E1E] px-2 text-[#E0E0E0]">1</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-[#E0E0E0] text-xl md:text-[28px] leading-none">Action Log</h4>
                    <div className="space-y-2 border-t border-[#2a2a2a] pt-2">
                        {events.map((event, index) => (
                            <div key={`${event.time}-${index}`} className="grid grid-cols-[50px_15px_1fr] items-center gap-2 py-0.5 text-[12px] md:text-[13px] leading-5">
                                <span className="self-center text-[#A0A0A0] font-mono leading-5">{event.time}</span>
                                <EventIcon kind={event.kind} />
                                <EventText event={event} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const FreeFeaturesSection = () => (
    <section className="relative py-14 w-full overflow-hidden">
        <div className="w-full px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-[#E5E5E5] text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-tight">
                        Seamless Tab Tracking Bypass
                    </h2>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#344451]/70 bg-[#101419] px-3 py-2 text-[12px] md:text-[13px] text-[#c5d0d8]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#344451]" />
                        <span className="text-[#d5dde3]">Canvas tab switch detection is real:</span>
                        <a
                            href="https://community.instructure.com/en/kb/articles/661037-how-do-i-view-a-quiz-log-for-a-student"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#8fa2b0] underline underline-offset-2 hover:text-[#b1c0ca] transition-colors"
                        >
                            View Quiz Log documentation
                        </a>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-4">
                    <SessionPanel
                        label="Before Disabling Tab Switch Detection"
                        statusText="Tracked"
                        statusTone="tracked"
                        startedAt="Sat May 10 2025 18:46:05 GMT-0500 (Central Daylight Time)"
                        events={beforeEvents}
                    />

                    <div className="flex items-center justify-center py-2 lg:py-0">
                        <ArrowIcon />
                    </div>

                    <SessionPanel
                        label="After Disabling Tab Switch Detection"
                        statusText="Disabled"
                        statusTone="disabled"
                        startedAt="Sat May 10 2025 18:40:36 GMT-0500 (Central Daylight Time)"
                        events={afterEvents}
                    />
                </div>
            </div>
        </div>
    </section>
);

export default FreeFeaturesSection;
