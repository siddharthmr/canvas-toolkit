(() => {
    const SUPABASE_URL = 'https://jshtldlivafisozrhdil.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaHRsZGxpdmFmaXNvenJoZGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNTI5MjIsImV4cCI6MjA1NzkyODkyMn0.3yP1Y-oROzwVta_6v3QJpDvnfNlGWaMCs1I_04rYJKU';
    const MAX_CREDITS = 2.5;

    const qs = id => document.getElementById(id);

    let supabase;
    let currentUser = null;
    let currentSession = null;

    const setDisplay = (el, display = 'block') => el && (el.style.display = display);
    const setText = (el, text = '') => el && (el.textContent = text);

    async function loadCredits(elems) {
        if (!currentUser || !currentSession?.access_token) return hideCredits(elems, false);
        setText(elems.creditsPct, 'Loading...');
        try {
            const { data, error } = await supabase.functions.invoke('get-user-profile', {
                headers: { Authorization: `Bearer ${currentSession.access_token}` }
            });
            if (error || typeof data?.credits !== 'number') throw new Error(error?.message || 'Invalid data');
            const pct = Math.min(100, (data.credits / MAX_CREDITS) * 100).toFixed(2);
            setDisplay(elems.creditsContainer, 'flex');
            elems.creditsBar.style.width = `${pct}%`;
            setText(elems.creditsPct, `${((data.credits / MAX_CREDITS) * 100).toFixed(2)}%`);
        } catch {
            hideCredits(elems, true);
        }
    }

    function hideCredits(elems, error = false) {
        setDisplay(elems.creditsContainer, 'none');
        if (error) setText(elems.creditsPct, 'Error');
        elems.creditsBar && (elems.creditsBar.style.width = '0%');
    }

    function updateAuthUI(elems) {
        if (currentUser) {
            setText(elems.userEmail, `Logged in: ${currentUser.email}`);
            loadCredits(elems);
            setDisplay(elems.overlay, 'none');
            setDisplay(elems.userInfo, 'flex');
            elems.modelSection.classList.remove('blurred');
            elems.modelSection.style.pointerEvents = 'auto';
        } else {
            setText(elems.userEmail, '');
            hideCredits(elems, false);
            setDisplay(elems.overlay, 'flex');
            setDisplay(elems.userInfo, 'none');
            elems.modelSection.classList.add('blurred');
            elems.modelSection.style.pointerEvents = 'none';
        }
    }

    function toggleStealth(elems) {
        chrome.storage.sync.get('stealthModeEnabled', ({ stealthModeEnabled }) => {
            const enabled = !stealthModeEnabled;
            chrome.storage.sync.set({
                primaryModel: elems.primaryModel.value,
                secondaryModel: elems.secondaryModel.value,
                stealthModeEnabled: enabled
            }, () => {
                elems.stealthButton.textContent = `Stealth Mode: ${enabled ? 'On' : 'Off'}`;
                elems.stealthButton.classList.toggle('active', enabled);
            });
        });
    }

    function bindModelChange(el, key) {
        if (!el) return;
        el.addEventListener('change', () => {
            chrome.storage.sync.get('stealthModeEnabled', ({ stealthModeEnabled }) => {
                chrome.storage.sync.set({ [key]: el.value, stealthModeEnabled });
            });
        });
    }

    function bindAuth(elems) {
        elems.loginForm?.addEventListener('submit', async e => {
            e.preventDefault();
            const email = elems.emailInput.value;
            const password = elems.passInput.value;
            if (!email || !password) return alert('Enter email & password');
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) alert(`Login failed: ${error.message}`);
        });

        elems.emailSignUp?.addEventListener('click', async () => {
            const email = elems.emailInput.value;
            const password = elems.passInput.value;
            if (!email || !password) return alert('Enter email & password');
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) alert(`Sign-up failed: ${error.message}`);
            else alert(data.user.identities.length === 0 ? 'Check email to verify account.' : 'Sign up complete.');
            elems.passInput.value = '';
        });

        elems.logoutBtn?.addEventListener('click', async () => {
            try { await supabase.auth.refreshSession(); } catch { }
            const { error } = await supabase.auth.signOut();
            if (error) alert(`Logout failed: ${error.message}`);
        });
    }

    function loadSettings(elems) {
        chrome.storage.sync.get(['primaryModel', 'secondaryModel', 'stealthModeEnabled'], data => {
            if (elems.primaryModel && data.primaryModel) elems.primaryModel.value = data.primaryModel;
            if (elems.secondaryModel && data.secondaryModel) elems.secondaryModel.value = data.secondaryModel;
            const on = data.stealthModeEnabled;
            elems.stealthButton.textContent = `Stealth Mode: ${on ? 'On' : 'Off'}`;
            elems.stealthButton.classList.toggle('active', on);
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const elems = {
            primaryModel: qs('primaryModel'),
            secondaryModel: qs('secondaryModel'),
            stealthButton: qs('stealthModeButton'),
            userEmail: qs('manageUserTooltipText'),
            creditsContainer: qs('creditsProgressBarContainer'),
            creditsBar: qs('creditsProgressBar'),
            creditsPct: qs('creditsPercentageDisplay'),
            googleLogin: qs('googleLoginButton'),
            logoutBtn: qs('logoutButton'),
            emailInput: qs('emailInput'),
            passInput: qs('passwordInput'),
            emailLogin: qs('emailPassLoginButton'),
            emailSignUp: qs('emailPassSignUpButton'),
            loginForm: qs('loginForm'),
            overlay: qs('loginOverlay'),
            userInfo: qs('userInfoContainer'),
            modelSection: qs('modelSelectionContainer')
        };

        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }

        if (!supabase) return updateAuthUI(elems);

        bindAuth(elems);
        elems.stealthButton?.addEventListener('click', () => toggleStealth(elems));
        bindModelChange(elems.primaryModel, 'primaryModel');
        bindModelChange(elems.secondaryModel, 'secondaryModel');

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
