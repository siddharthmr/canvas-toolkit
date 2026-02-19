(() => {
    const SUPABASE_URL = 'https://hxpqkysrjeofpburzqwu.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cHFreXNyamVvZnBidXJ6cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTg5MzMsImV4cCI6MjA4Njg3NDkzM30.EETUQhkrH-dxs03cKawD1LQ83yTu_kVJCSt5bt-Pgkw';
    const MAX_CREDITS = 2.5;

    const qs = id => document.getElementById(id);

    let supabase;
    let currentUser = null;
    let currentSession = null;
    let currentPlanTier = null;

    const setDisplay = (el, display = 'block') => el && (el.style.display = display);
    const setText = (el, text = '') => el && (el.textContent = text);

    async function loadProfileAndCredits(elems) {
        if (!currentUser || !currentSession?.access_token) {
            currentPlanTier = null;
            chrome.storage.local.set({ plan_tier: null });
            hideCredits(elems, false);
            updateFeatureGating(elems);
            return;
        }
        setText(elems.creditsPct, 'Loading...');
        try {
            const { data, error } = await supabase.functions.invoke('get-user-profile', {
                headers: { Authorization: `Bearer ${currentSession.access_token}` }
            });
            if (error) throw new Error(error?.message || 'Invalid data');

            currentPlanTier = data?.plan_tier || null;
            chrome.storage.local.set({ plan_tier: currentPlanTier });

            if (currentPlanTier === 'ai' && typeof data?.credits === 'number') {
                const pct = Math.min(100, (data.credits / MAX_CREDITS) * 100).toFixed(2);
                setDisplay(elems.creditsContainer, 'flex');
                elems.creditsBar.style.width = `${pct}%`;
                setText(elems.creditsPct, `${pct}%`);
            } else {
                hideCredits(elems, false);
            }
        } catch {
            currentPlanTier = null;
            chrome.storage.local.set({ plan_tier: null });
            hideCredits(elems, true);
        }
        updateFeatureGating(elems);
    }

    function hideCredits(elems, error = false) {
        setDisplay(elems.creditsContainer, 'none');
        if (error) setText(elems.creditsPct, 'Error');
        elems.creditsBar && (elems.creditsBar.style.width = '0%');
    }

    function updateFeatureGating(elems) {
        const hasStealth = currentPlanTier === 'stealth' || currentPlanTier === 'ai';
        const hasAi = currentPlanTier === 'ai';

        setDisplay(elems.tabDetectionLock, hasStealth ? 'none' : 'flex');
        setDisplay(elems.aiLock, hasAi ? 'none' : 'flex');

        if (hasAi) {
            setDisplay(elems.creditsContainer, 'flex');
            setDisplay(elems.userEmail, 'none');
        } else if (currentUser) {
            setDisplay(elems.creditsContainer, 'none');
            setDisplay(elems.userEmail, 'inline');
        }
    }

    function updateAuthUI(elems) {
        if (currentUser) {
            setText(elems.userEmail, currentUser.email);
            setDisplay(elems.loginOverlay, 'none');
            setDisplay(elems.userBar, 'flex');
            loadProfileAndCredits(elems);
        } else {
            setText(elems.userEmail, '');
            currentPlanTier = null;
            chrome.storage.local.set({ plan_tier: null });
            hideCredits(elems, false);
            setDisplay(elems.loginOverlay, 'flex');
            setDisplay(elems.userBar, 'none');
            setDisplay(elems.tabDetectionLock, 'flex');
            setDisplay(elems.aiLock, 'flex');
        }
    }

    function toggleTabDetection(elems) {
        chrome.storage.sync.get('tabDetectionEnabled', ({ tabDetectionEnabled }) => {
            const enabled = !tabDetectionEnabled;
            chrome.storage.sync.set({ tabDetectionEnabled: enabled }, () => {
                updateTabDetectionUI(elems, enabled);
                chrome.runtime.sendMessage({ type: 'syncTabDetection' });
            });
        });
    }

    function updateTabDetectionUI(elems, enabled) {
        if (elems.tabDetectionButton) {
            setText(elems.tabDetectionButton, enabled ? 'On' : 'Off');
            elems.tabDetectionButton.classList.toggle('active', enabled);
            elems.tabDetectionButton.setAttribute('aria-pressed', String(enabled));
        }
    }

    function toggleStealthMode(elems) {
        chrome.storage.sync.get('stealthModeEnabled', ({ stealthModeEnabled }) => {
            const enabled = !stealthModeEnabled;
            chrome.storage.sync.set({ stealthModeEnabled: enabled }, () => {
                updateStealthUI(elems, enabled);
            });
        });
    }

    function updateStealthUI(elems, enabled) {
        if (elems.stealthButton) {
            setText(elems.stealthButton, enabled ? 'On' : 'Off');
            elems.stealthButton.classList.toggle('active', enabled);
            elems.stealthButton.setAttribute('aria-pressed', String(enabled));
        }
    }

    function bindModelChange(el, key) {
        if (!el) return;
        el.addEventListener('change', () => {
            chrome.storage.sync.set({ [key]: el.value });
        });
    }

    function bindAuth(elems) {
        elems.googleLogin?.addEventListener('click', () => {
            chrome.runtime.sendMessage({ type: 'googleSignIn' }, async (response) => {
                if (response?.success && response.access_token && response.refresh_token) {
                    const { data, error } = await supabase.auth.setSession({
                        access_token: response.access_token,
                        refresh_token: response.refresh_token
                    });
                    if (error) alert(`Session error: ${error.message}`);
                } else if (response?.error && response.error !== 'The user did not approve access.') {
                    alert(`Google sign-in failed: ${response.error}`);
                }
            });
        });

        elems.logoutBtn?.addEventListener('click', async () => {
            try { await supabase.auth.refreshSession(); } catch { }
            const { error } = await supabase.auth.signOut();
            if (error) alert(`Logout failed: ${error.message}`);
        });
    }

    function openUpgradePage() {
        chrome.tabs.create({ url: 'https://www.canvastoolkit.com/login' });
    }

    function loadSettings(elems) {
        chrome.storage.sync.get(['primaryModel', 'secondaryModel', 'tabDetectionEnabled', 'stealthModeEnabled'], data => {
            if (elems.primaryModel && data.primaryModel) elems.primaryModel.value = data.primaryModel;
            if (elems.secondaryModel && data.secondaryModel) elems.secondaryModel.value = data.secondaryModel;
            updateTabDetectionUI(elems, !!data.tabDetectionEnabled);
            updateStealthUI(elems, !!data.stealthModeEnabled);
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const elems = {
            primaryModel: qs('primaryModel'),
            secondaryModel: qs('secondaryModel'),
            tabDetectionButton: qs('tabDetectionButton'),
            tabDetectionLock: qs('tabDetectionLock'),
            tabDetectionUpgradeBtn: qs('tabDetectionUpgradeBtn'),
            stealthButton: qs('stealthModeButton'),
            aiLock: qs('aiLock'),
            aiUpgradeBtn: qs('aiUpgradeBtn'),
            userEmail: qs('userEmailDisplay'),
            creditsContainer: qs('creditsProgressBarContainer'),
            creditsBar: qs('creditsProgressBar'),
            creditsPct: qs('creditsPercentageDisplay'),
            googleLogin: qs('googleLoginButton'),
            logoutBtn: qs('logoutButton'),
            loginOverlay: qs('loginOverlay'),
            userBar: qs('userBar'),
            manageButton: qs('manageButton')
        };

        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }

        if (!supabase) return updateAuthUI(elems);

        bindAuth(elems);
        elems.tabDetectionButton?.addEventListener('click', () => toggleTabDetection(elems));
        elems.stealthButton?.addEventListener('click', () => toggleStealthMode(elems));
        bindModelChange(elems.primaryModel, 'primaryModel');
        bindModelChange(elems.secondaryModel, 'secondaryModel');

        elems.tabDetectionUpgradeBtn?.addEventListener('click', openUpgradePage);
        elems.aiUpgradeBtn?.addEventListener('click', openUpgradePage);
        elems.manageButton?.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://www.canvastoolkit.com/login' });
        });

        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
            currentSession = session;
            currentUser = session.user;
            chrome.storage.local.set({ supabase_session: session });
        } else {
            const stored = await new Promise(r => chrome.storage.local.get('supabase_session', r));
            if (stored.supabase_session) {
                const { error: setErr, data } = await supabase.auth.setSession(stored.supabase_session);
                if (!setErr) {
                    currentSession = data.session;
                    currentUser = data.user;
                } else chrome.storage.local.remove('supabase_session');
            }
        }

        supabase.auth.onAuthStateChange((_, session) => {
            currentSession = session;
            currentUser = session?.user || null;
            if (session) chrome.storage.local.set({ supabase_session: session });
            else chrome.storage.local.remove('supabase_session');
            updateAuthUI(elems);
        });

        updateAuthUI(elems);
        loadSettings(elems);
    });
})();
