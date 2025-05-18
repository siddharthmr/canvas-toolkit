const CONTEXT_MENU_ID = 'CANVAS_TOOLKIT_ADD_IMAGE_DATA';
const STORAGE_KEY = 'promptImageDataUrl';

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
    console.log('CanvasToolkit context menu created/updated for Image Data.');
    chrome.scripting.registerContentScripts([
        {
            id: 'override-listeners',
            js: ['src/content/overrideListeners.js'],
            matches: ['*://*.instructure.com/*'],
            world: 'MAIN',
            allFrames: true,
            matchOriginAsFallback: true,
            runAt: 'document_start'
        }
    ]);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === CONTEXT_MENU_ID && info.srcUrl) {
        console.log('Image source URL captured:', info.srcUrl);
        try {
            const response = await fetch(info.srcUrl);
            console.log(`Fetch response status: ${response.status}, OK: ${response.ok}`);
            if (!response.ok) {
                let errorDetails = `HTTP error! status: ${response.status} ${response.statusText}`;
                try {
                    const errorBody = await response.text();
                    errorDetails += `. Body: ${errorBody.substring(0, 200)}...`;
                } catch (e) {}
                throw new Error(errorDetails);
            }
            const imageBlob = await response.blob();
            console.log(`Image Blob fetched. Type: ${imageBlob.type}, Size: ${imageBlob.size}`);
            if (imageBlob.size === 0) throw new Error('Fetched image blob has zero size.');
            if (!imageBlob.type || !imageBlob.type.startsWith('image/'))
                console.warn(`Blob MIME type "${imageBlob.type}" doesn't look like an image.`);

            const base64DataUrl = await blobToBase64(imageBlob);
            if (!base64DataUrl || !base64DataUrl.startsWith('data:image'))
                throw new Error('Failed to generate valid Base64 Data URL.');

            console.log(
                `Image encoded. Data URL starts with: ${base64DataUrl.substring(0, 60)}...`
            );
            await chrome.storage.session.set({ [STORAGE_KEY]: base64DataUrl });
            console.log('Image Base64 data URL saved to session storage.');
        } catch (error) {
            console.error('Error fetching or encoding image:', error);
            await chrome.storage.session.remove(STORAGE_KEY);
        }
    }
});

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.session.remove(STORAGE_KEY);
    console.log('Cleared any stale image data URL on startup.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getPromptImageData') {
        console.log('Background script received request for image data.');
        (async () => {
            try {
                const data = await chrome.storage.session.get(STORAGE_KEY);
                const imageDataUrl = data ? data[STORAGE_KEY] : null;

                if (imageDataUrl) {
                    console.log('Background sending image data URL to content script.');
                    await chrome.storage.session.remove(STORAGE_KEY);
                    console.log('Cleared image data URL from storage after sending.');
                    sendResponse({ success: true, dataUrl: imageDataUrl });
                } else {
                    console.log('Background found no image data URL to send.');
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
