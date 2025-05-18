(() => {
    const EDGE_FUNCTION_URL = 'https://jshtldlivafisozrhdil.supabase.co/functions/v1/openrouter-proxy';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaHRsZGxpdmFmaXNvenJoZGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNTI5MjIsImV4cCI6MjA1NzkyODkyMn0.3yP1Y-oROzwVta_6v3QJpDvnfNlGWaMCs1I_04rYJKU';

    const VISION_MODELS = ['openai/gpt-4o', 'google/gemini-2.5-pro-preview'];

    const isVisionModel = (m) => VISION_MODELS.includes(m);

    const getDisplayModelName = (id) => {
        if (!id) return 'Model';
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

    const getSupabaseToken = () =>
        new Promise((resolve) =>
            chrome.storage.local.get(['supabase_session'], (d) =>
                resolve(d?.supabase_session?.access_token || null)
            )
        );

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
                apikey: SUPABASE_ANON_KEY,
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
        isVisionModel,
        getDisplayModelName,
        getSupabaseToken,
        getImageDataUrl,
        callEdgeFunction
    };
})();
