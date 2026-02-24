(() => {
    const EDGE_FUNCTION_URL = 'https://openrouter-proxy.c-viperdevelopment.workers.dev';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cHFreXNyamVvZnBidXJ6cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTg5MzMsImV4cCI6MjA4Njg3NDkzM30.EETUQhkrH-dxs03cKawD1LQ83yTu_kVJCSt5bt-Pgkw';

    // Hardcoded fallbacks for vision check (used when cache is empty)
    const FALLBACK_VISION_MODELS = ['openai/gpt-4o', 'google/gemini-2.5-pro-preview'];

    // Cached model config (loaded from chrome.storage.local once)
    let _cachedModels = null;

    const loadCachedModels = () => {
        if (_cachedModels) return Promise.resolve(_cachedModels);
        return new Promise(resolve => {
            chrome.storage.local.get(['model_config_models'], d => {
                _cachedModels = d.model_config_models || null;
                resolve(_cachedModels);
            });
        });
    };

    // Synchronous check using whatever is cached; falls back to hardcoded list
    const isVisionModel = (m) => {
        if (_cachedModels) {
            const found = _cachedModels.find(mod => mod.id === m);
            return found ? !!found.is_vision : false;
        }
        return FALLBACK_VISION_MODELS.includes(m);
    };

    const getDisplayModelName = (id) => {
        if (!id) return 'Model';
        // Try cached display name first
        if (_cachedModels) {
            const found = _cachedModels.find(mod => mod.id === id);
            if (found) return found.display_name;
        }
        // Fallback: derive from model ID
        let n = id.split('/').pop();
        return n
            .replace(/-2024-\d{2}-\d{2}$/, '')
            .replace(/-latest$/, '')
            .replace('gpt-4o', 'GPT-4o')
            .replace('o4-mini', 'o4 mini')
            .replace('deepseek-r1:nitro', 'DS R1 Nitro')
            .replace('deepseek-r1', 'DS R1')
            .replace('deepseek-chat', 'DS V3')
            .replace('gemini-2.5-pro-preview', 'Gemini 2.5 Pro');
    };

    const getSupabaseToken = async () => {
        try {
            const res = await chrome.runtime.sendMessage({ type: 'getFreshToken' });
            return res?.success ? res.access_token : null;
        } catch {
            // Fallback to stored token if background is unavailable
            return new Promise((resolve) =>
                chrome.storage.local.get(['supabase_session'], (d) =>
                    resolve(d?.supabase_session?.access_token || null)
                )
            );
        }
    };

    const getImageDataUrl = async () => {
        try {
            const r = await chrome.runtime.sendMessage({
                type: 'getPromptImageData'
            });
            if (r?.success && r.dataUrl) {
                console.log(
                    '[CanvasToolkit] Vision-model prompt will include image data ' +
                        `(≈${Math.round(r.dataUrl.length / 1024)} KB base64)`
                );
                return r.dataUrl;
            }
            console.log(
                '[CanvasToolkit] No image data attached to this prompt'
            );
            return null;
        } catch {
            return null;
        }
    };

    const callEdgeFunction = async (token, payload) => {
        const res = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        console.log(payload);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    };

    window.CanvasToolkitUtils = {
        EDGE_FUNCTION_URL,
        SUPABASE_ANON_KEY,
        loadCachedModels,
        isVisionModel,
        getDisplayModelName,
        getSupabaseToken,
        getImageDataUrl,
        callEdgeFunction
    };
})();
