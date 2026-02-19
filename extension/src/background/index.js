const CONTEXT_MENU_ID = 'CANVAS_TOOLKIT_ADD_IMAGE_DATA';
const STORAGE_KEY = 'promptImageDataUrl';
const SHIV_SCRIPT_ID = 'listener-shiv';

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsDataURL(blob);
    });
}

async function syncTabDetection() {
    try {
        const local = await chrome.storage.local.get(['plan_tier']);
        const sync = await chrome.storage.sync.get(['tabDetectionEnabled']);
        const hasPlan = local.plan_tier === 'stealth' || local.plan_tier === 'ai';
        const shouldInject = hasPlan && !!sync.tabDetectionEnabled;

        const registered = await chrome.scripting.getRegisteredContentScripts({ ids: [SHIV_SCRIPT_ID] });

        if (shouldInject && registered.length === 0) {
            await chrome.scripting.registerContentScripts([{
                id: SHIV_SCRIPT_ID,
                js: ['src/content/listenerShiv.js'],
                matches: ['*://*.instructure.com/*'],
                world: 'MAIN',
                allFrames: true,
                matchOriginAsFallback: true,
                runAt: 'document_start'
            }]);
        } else if (!shouldInject && registered.length > 0) {
            await chrome.scripting.unregisterContentScripts({ ids: [SHIV_SCRIPT_ID] });
        }
    } catch (err) {
        console.error('syncTabDetection error:', err);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.remove('CANVAS_TOOLKIT_ADD_IMAGE', () => {
        if (chrome.runtime.lastError) {
        }
    });
    chrome.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: 'Use Image Data in Next Prompt',
        contexts: ['image']
    });
    syncTabDetection();
});

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.session.remove(STORAGE_KEY);
    syncTabDetection();
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.plan_tier) {
        syncTabDetection();
    }
    if (area === 'sync' && changes.tabDetectionEnabled) {
        syncTabDetection();
    }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === CONTEXT_MENU_ID && info.srcUrl) {
        try {
            const response = await fetch(info.srcUrl);
            if (!response.ok) {
                let errorDetails = `HTTP error! status: ${response.status} ${response.statusText}`;
                try {
                    const errorBody = await response.text();
                    errorDetails += `. Body: ${errorBody.substring(0, 200)}...`;
                } catch (e) {}
                throw new Error(errorDetails);
            }
            const imageBlob = await response.blob();
            if (imageBlob.size === 0) throw new Error('Fetched image blob has zero size.');
            if (!imageBlob.type || !imageBlob.type.startsWith('image/'))
                console.warn(`Blob MIME type "${imageBlob.type}" doesn't look like an image.`);

            const base64DataUrl = await blobToBase64(imageBlob);
            if (!base64DataUrl || !base64DataUrl.startsWith('data:image'))
                throw new Error('Failed to generate valid Base64 Data URL.');

            await chrome.storage.session.set({ [STORAGE_KEY]: base64DataUrl });
        } catch (error) {
            console.error('Error fetching or encoding image:', error);
            await chrome.storage.session.remove(STORAGE_KEY);
        }
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'googleSignIn') {
        const SUPABASE_URL = 'https://hxpqkysrjeofpburzqwu.supabase.co';

        (async () => {
            try {
                const redirectUrl = chrome.identity.getRedirectURL();
                const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;

                const responseUrl = await new Promise((resolve, reject) => {
                    chrome.identity.launchWebAuthFlow(
                        { url: authUrl, interactive: true },
                        (url) => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError.message));
                            } else {
                                resolve(url);
                            }
                        }
                    );
                });

                const url = new URL(responseUrl);
                const hashParams = new URLSearchParams(url.hash.substring(1));
                const access_token = hashParams.get('access_token');
                const refresh_token = hashParams.get('refresh_token');

                if (!access_token || !refresh_token) {
                    throw new Error('No tokens returned from Google sign-in.');
                }

                chrome.storage.local.set({
                    supabase_session: { access_token, refresh_token }
                });

                sendResponse({ success: true, access_token, refresh_token });
            } catch (err) {
                if (err.message !== 'The user did not approve access.') {
                    console.error('Google sign-in error:', err);
                }
                sendResponse({ success: false, error: err.message });
            }
        })();

        return true;
    }

    if (message.type === 'syncTabDetection') {
        syncTabDetection();
        return false;
    }

    if (message.type === 'getPromptImageData') {
        (async () => {
            try {
                const data = await chrome.storage.session.get(STORAGE_KEY);
                const imageDataUrl = data ? data[STORAGE_KEY] : null;

                if (imageDataUrl) {
                    await chrome.storage.session.remove(STORAGE_KEY);
                    sendResponse({ success: true, dataUrl: imageDataUrl });
                } else {
                    sendResponse({ success: true, dataUrl: null });
                }
            } catch (error) {
                console.error('Background error getting/clearing storage:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();

        return true;
    }
});
