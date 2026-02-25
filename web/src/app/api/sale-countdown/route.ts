import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SALE_DURATION_SECONDS = 72 * 60 * 60;
const RESET_THRESHOLD_SECONDS = 12 * 60 * 60;
const VISIBLE_WINDOW_SECONDS = SALE_DURATION_SECONDS - RESET_THRESHOLD_SECONDS; // 60h

// Global anchor shared by all users. Set env var to control/reset the campaign start.
const DEFAULT_ANCHOR_MS = 1735689600000; // 2025-01-01T00:00:00.000Z

function getAnchorMs(): number {
    const raw = process.env.SALE_COUNTDOWN_ANCHOR_MS;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_ANCHOR_MS;
}

export async function GET() {
    const nowMs = Date.now();
    const anchorMs = getAnchorMs();
    const elapsedSeconds = Math.max(0, Math.floor((nowMs - anchorMs) / 1000));

    // Shared global cycle: 72h countdown that jumps back before entering the last 12h.
    const cycleElapsed = elapsedSeconds % VISIBLE_WINDOW_SECONDS;
    const remainingSeconds = SALE_DURATION_SECONDS - cycleElapsed;

    const response = NextResponse.json({
        remainingSeconds,
        resetThresholdSeconds: RESET_THRESHOLD_SECONDS,
        durationSeconds: SALE_DURATION_SECONDS,
        anchorMs,
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
}
