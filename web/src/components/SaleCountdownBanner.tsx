'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const SERVER_SYNC_INTERVAL_MS = 60 * 1000;

type SaleTimerResponse = {
    remainingSeconds?: number;
};

function pad(value: number): string {
    return value.toString().padStart(2, '0');
}

function formatHms(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const SaleCountdownBanner = () => {
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

    const syncFromServer = useCallback(async () => {
        try {
            const response = await fetch('/api/sale-countdown', {
                method: 'GET',
                cache: 'no-store',
            });
            if (!response.ok) return;

            const data = (await response.json()) as SaleTimerResponse;
            if (typeof data.remainingSeconds === 'number' && Number.isFinite(data.remainingSeconds)) {
                setRemainingSeconds(Math.max(0, Math.floor(data.remainingSeconds)));
            }
        } catch {
            // Swallow network errors and keep last known timer.
        }
    }, []);

    useEffect(() => {
        syncFromServer();
        const id = window.setInterval(syncFromServer, SERVER_SYNC_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [syncFromServer]);

    useEffect(() => {
        const id = window.setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev === null) return prev;
                return prev > 0 ? prev - 1 : 0;
            });
        }, 1000);
        return () => window.clearInterval(id);
    }, []);

    const countdownText = useMemo(
        () => (remainingSeconds === null ? '--:--:--' : formatHms(remainingSeconds)),
        [remainingSeconds]
    );

    return (
        <div className="mb-8 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-full border border-[#344451]/70 bg-[#101419] px-3 py-2 text-[12px] md:text-[13px] text-[#c5d0d8]">
                <span className="rounded-full border border-[#3f5568] bg-[#16212b] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b8c6d1]">
                    Launch Sale
                </span>
                <span className="rounded-full border border-[#3f5568] bg-[#16212b] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b8c6d1]">
                    50% Off
                </span>
                <p className="font-mono tracking-wide text-[#8fa2b0]">
                    Ends in <span className="font-semibold text-[#b1c0ca]">{countdownText}</span>
                </p>
                <span className="hidden sm:inline text-[#4f6070]">•</span>
                <p className="font-semibold text-[#d5dde3]">
                    Lock in your price now
                </p>
            </div>
        </div>
    );
};

export default SaleCountdownBanner;
