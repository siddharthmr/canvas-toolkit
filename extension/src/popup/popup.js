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
            const { data, error } = await supabase
                .from('profiles')
                .select('credits, plan_tier, subscription_status, current_period_end')
                .single();
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
        } else {
            setDisplay(elems.creditsContainer, 'none');
        }
    }

    function getFirstName(user) {
        const full = user?.user_metadata?.full_name
            || user?.user_metadata?.name
            || '';
        return full.split(' ')[0] || '';
    }

    function updateAuthUI(elems) {
        if (currentUser) {
            setDisplay(elems.loginOverlay, 'none');
            setDisplay(elems.userBar, 'flex');
            setText(elems.userGreeting, currentUser.email || '');

            // Instantly apply cached plan tier for fast UI, then verify with Supabase
            chrome.storage.local.get(['plan_tier'], (cached) => {
                if (cached.plan_tier) {
                    currentPlanTier = cached.plan_tier;
                    updateFeatureGating(elems);
                }
                loadProfileAndCredits(elems);
            });
        } else {
            setText(elems.userGreeting, '');
            setText(elems.userStatusPill, '');
            setDisplay(elems.userStatusPill, 'none');
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

    // ── Model Config: fetch, cache, render ──

    const MODEL_CONFIG_KEYS = ['model_config_version_hash', 'model_config_models', 'model_config_defaults'];

    // Hardcoded fallback for first-ever load before any fetch completes
    const FALLBACK_MODELS = [
        { id: 'deepseek/deepseek-r1', display_name: 'DeepSeek R1', is_vision: false },
        { id: 'deepseek/deepseek-chat', display_name: 'DeepSeek V3', is_vision: false },
        { id: 'openai/gpt-4o', display_name: 'GPT-4o', is_vision: true },
        { id: 'openai/o4-mini', display_name: 'o4 mini', is_vision: false },
        { id: 'google/gemini-2.5-pro-preview', display_name: 'Gemini 2.5 Pro', is_vision: true }
    ];
    const FALLBACK_DEFAULTS = { primary: 'openai/gpt-4o', secondary: 'deepseek/deepseek-r1' };

    function renderModelDropdowns(elems, models) {
        if (!models || !models.length) return;
        [elems.primaryModel, elems.secondaryModel].forEach(sel => {
            if (!sel) return;
            const prev = sel.value;
            sel.innerHTML = '';
            models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.display_name;
                sel.appendChild(opt);
            });
            // Restore previous selection if still valid
            if (prev && models.some(m => m.id === prev)) sel.value = prev;
        });
    }

    function validateSelectedModels(elems, models, defaults) {
        if (!models || !models.length) return;
        const ids = new Set(models.map(m => m.id));
        const defs = defaults || FALLBACK_DEFAULTS;

        if (elems.primaryModel && !ids.has(elems.primaryModel.value)) {
            elems.primaryModel.value = defs.primary;
            chrome.storage.sync.set({ primaryModel: defs.primary });
        }
        if (elems.secondaryModel && !ids.has(elems.secondaryModel.value)) {
            elems.secondaryModel.value = defs.secondary;
            chrome.storage.sync.set({ secondaryModel: defs.secondary });
        }
    }

    async function fetchModelConfigFromSupabase() {
        if (!supabase) throw new Error('Supabase not initialized');

        // Query 1: Get the current version info
        const { data: versionData, error: vErr } = await supabase
            .from('model_versions')
            .select('version, version_hash, default_primary, default_secondary')
            .eq('is_current', true)
            .single();
        if (vErr || !versionData) throw new Error(vErr?.message || 'No current version found');

        // Query 2: Get the models for this version via junction table
        const { data: vmData, error: vmErr } = await supabase
            .from('version_models')
            .select('model_id, models(id, display_name, is_vision)')
            .eq('version', versionData.version);
        if (vmErr) throw new Error(vmErr.message);

        const models = (vmData || []).map(vm => vm.models).filter(Boolean);
        const defaults = {
            primary: versionData.default_primary,
            secondary: versionData.default_secondary
        };

        return { version_hash: versionData.version_hash, models, defaults };
    }

    async function saveModelConfigToCache(config) {
        await new Promise(r => chrome.storage.local.set({
            model_config_version_hash: config.version_hash,
            model_config_models: config.models,
            model_config_defaults: config.defaults
        }, r));
    }

    function loadModelConfigFromCache() {
        return new Promise(r => chrome.storage.local.get(MODEL_CONFIG_KEYS, r));
    }

    async function initModelDropdowns(elems) {
        const cached = await loadModelConfigFromCache();
        let models = cached.model_config_models;
        let defaults = cached.model_config_defaults;

        if (!models || !models.length) {
            // First install: no cache, fetch from Supabase
            try {
                const config = await fetchModelConfigFromSupabase();
                await saveModelConfigToCache(config);
                models = config.models;
                defaults = config.defaults;
            } catch (err) {
                console.error('[CanvasToolkit] Failed to fetch model config:', err);
                models = FALLBACK_MODELS;
                defaults = FALLBACK_DEFAULTS;
            }
        }

        renderModelDropdowns(elems, models);

        // Restore user's saved selections, then validate
        await new Promise(r => chrome.storage.sync.get(['primaryModel', 'secondaryModel'], data => {
            if (elems.primaryModel && data.primaryModel) elems.primaryModel.value = data.primaryModel;
            if (elems.secondaryModel && data.secondaryModel) elems.secondaryModel.value = data.secondaryModel;
            r();
        }));

        validateSelectedModels(elems, models, defaults);
    }

    async function handleCheckForUpdates(elems) {
        const statusEl = elems.updateStatus;
        const btn = elems.checkUpdatesBtn;
        if (btn) { btn.disabled = true; btn.textContent = '...'; }
        if (statusEl) { statusEl.textContent = ''; }

        try {
            const config = await fetchModelConfigFromSupabase();
            const cached = await loadModelConfigFromCache();
            const currentHash = cached.model_config_version_hash;

            if (currentHash === config.version_hash) {
                if (statusEl) statusEl.textContent = 'Up to date ✓';
            } else {
                await saveModelConfigToCache(config);
                renderModelDropdowns(elems, config.models);
                validateSelectedModels(elems, config.models, config.defaults);
                if (statusEl) statusEl.textContent = 'Updated! ✓';
            }
        } catch (err) {
            console.error('[CanvasToolkit] Update check failed:', err);
            if (statusEl) statusEl.textContent = 'Update failed';
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Update Models'; }
            // Fade out status after 3 seconds
            if (statusEl && statusEl.textContent) {
                setTimeout(() => { statusEl.textContent = ''; }, 3000);
            }
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
            userGreeting: qs('userGreeting'),
            userStatusPill: qs('userStatusPill'),
            creditsContainer: qs('creditsProgressBarContainer'),
            creditsBar: qs('creditsProgressBar'),
            creditsPct: qs('creditsPercentageDisplay'),
            googleLogin: qs('googleLoginButton'),
            logoutBtn: qs('logoutButton'),
            loginOverlay: qs('loginOverlay'),
            userBar: qs('userBar'),
            manageButton: qs('manageButton'),
            checkUpdatesBtn: qs('checkUpdatesButton'),
            updateStatus: qs('updateStatus')
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
        elems.checkUpdatesBtn?.addEventListener('click', () => handleCheckForUpdates(elems));

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
        // Load model dropdowns from cache (or fetch on first install), then restore toggle settings
        await initModelDropdowns(elems);
        chrome.storage.sync.get(['tabDetectionEnabled', 'stealthModeEnabled'], data => {
            updateTabDetectionUI(elems, !!data.tabDetectionEnabled);
            updateStealthUI(elems, !!data.stealthModeEnabled);
        });
    });
})();
