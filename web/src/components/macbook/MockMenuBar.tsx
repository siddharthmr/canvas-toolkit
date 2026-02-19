'use client';

import { useEffect, useState } from 'react';

const AppleIcon = () => (
    <svg width="12" height="14" viewBox="0 0 14 17" fill="rgba(255,255,255,0.8)">
        <path d="M13.2 12.67c-.3.68-.65 1.3-1.06 1.87-.56.78-1.01 1.32-1.37 1.62-.54.5-1.13.75-1.75.77-.45 0-.99-.13-1.62-.39-.63-.26-1.21-.39-1.75-.39-.56 0-1.16.13-1.8.39-.64.26-1.16.4-1.56.41-.6.03-1.2-.23-1.8-.78-.38-.33-.86-.89-1.43-1.69-.61-.86-1.12-1.85-1.51-2.99C.18 10.12 0 8.79 0 7.5c0-1.47.32-2.74.95-3.8A5.6 5.6 0 0 1 2.94 1.7 5.37 5.37 0 0 1 5.6.92c.48 0 1.1.15 1.88.44.77.3 1.27.44 1.49.44.16 0 .72-.17 1.65-.5.89-.31 1.64-.44 2.25-.39 1.67.14 2.92.8 3.75 2-.6.36-1.06.82-1.4 1.37-.65 1.07-.6 2.3.15 3.3.34.47.75.84 1.24 1.1-.1.29-.2.56-.32.83zM10.1.39c0 .38-.1.77-.3 1.17-.24.47-.56.86-.96 1.15-.37.27-.77.44-1.19.48a2 2 0 0 1-.02-.25c0-.4.12-.81.35-1.24.22-.43.5-.79.85-1.06.35-.28.69-.48 1.01-.6.32-.12.62-.19.9-.2.02.09.02.17.02.25z" />
    </svg>
);

const WifiIcon = () => (
    <svg width="13" height="10" viewBox="0 0 16 12" fill="rgba(255,255,255,0.8)">
        <path d="M8 9.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zM8 6c1.82 0 3.47.74 4.66 1.93l-1.42 1.42A4.49 4.49 0 0 0 8 8c-1.24 0-2.37.5-3.18 1.32L3.34 7.93A6.49 6.49 0 0 1 8 6zm0-3.6c2.73 0 5.2 1.11 6.99 2.9l-1.42 1.42A8.06 8.06 0 0 0 8 4.4c-2.23 0-4.26.9-5.73 2.37L.85 5.35A10.05 10.05 0 0 1 8 2.4zm0-3.6c3.64 0 6.93 1.48 9.31 3.86L15.9 4.08A11.61 11.61 0 0 0 8 .8 11.61 11.61 0 0 0 .1 4.08L-1.31 2.66A13.59 13.59 0 0 1 8-1.2z" />
    </svg>
);

const BatteryIcon = () => (
    <svg width="22" height="10" viewBox="0 0 28 13" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1">
        <rect x="0.5" y="1" width="23" height="11" rx="2.5" />
        <rect x="2" y="2.5" width="15.2" height="8" rx="1" fill="rgba(255,255,255,0.8)" stroke="none" />
        <path d="M25 4.5v4a2 2 0 0 0 0-4z" fill="rgba(255,255,255,0.8)" stroke="none" />
    </svg>
);

const ControlCenterIcon = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="rgba(255,255,255,0.8)">
        <rect x="1" y="1" width="6" height="6" rx="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
);

const MockMenuBar = () => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const day = now.toLocaleDateString('en-US', { weekday: 'short' });
            const month = now.toLocaleDateString('en-US', { month: 'short' });
            const date = now.getDate();
            const timeStr = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
            setTime(`${day} ${month} ${date}  ${timeStr}`);
        };
        update();
        const interval = setInterval(update, 30000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = ['File', 'Edit', 'View', 'History', 'Bookmarks', 'Profiles', 'Tab', 'Window', 'Help'];

    return (
        <div
            className="grid h-[25px] select-none"
            style={{
                background: '#344451',
                color: 'rgba(255,255,255,0.8)',
                gridTemplateColumns: '1fr 180px 1fr',
            }}
        >
            {/* Left of notch */}
            <div className="flex items-center gap-3 text-[11px] overflow-hidden whitespace-nowrap px-3">
                <AppleIcon />
                <span className="font-semibold shrink-0">Chrome</span>
                {menuItems.map((item) => (
                    <span key={item} className="opacity-80 shrink-0 hidden sm:inline">
                        {item}
                    </span>
                ))}
            </div>

            {/* Notch gap */}
            <div />

            {/* Right of notch */}
            <div className="flex items-center justify-end gap-2.5 text-[11px] px-3 shrink-0">
                <BatteryIcon />
                <WifiIcon />
                <ControlCenterIcon />
                <span className="opacity-90 whitespace-nowrap hidden sm:inline">{time}</span>
            </div>
        </div>
    );
};

export default MockMenuBar;
