(() => {
    const qs = (id) => document.getElementById(id);

    function toggleStealth(elems) {
        chrome.storage.sync.get(['stealthModeEnabled'], ({ stealthModeEnabled }) => {
            const enabled = !stealthModeEnabled;
            chrome.storage.sync.set(
                {
                    primaryModel: elems.primaryModel.value,
                    secondaryModel: elems.secondaryModel.value,
                    stealthModeEnabled: enabled
                },
                () => {
                    elems.stealthButton.textContent = `Stealth Mode: ${enabled ? 'On' : 'Off'}`;
                    elems.stealthButton.classList.toggle('active', enabled);
                }
            );
        });
    }

    function bindModelChange(el, key) {
        if (!el) return;
        el.addEventListener('change', () => {
            chrome.storage.sync.get(['stealthModeEnabled'], ({ stealthModeEnabled }) => {
                chrome.storage.sync.set({ [key]: el.value, stealthModeEnabled });
            });
        });
    }

    function loadSettings(elems) {
        chrome.storage.sync.get(['primaryModel', 'secondaryModel', 'stealthModeEnabled', 'openRouterApiKey'], (data) => {
            if (elems.primaryModel && data.primaryModel) elems.primaryModel.value = data.primaryModel;
            if (elems.secondaryModel && data.secondaryModel) elems.secondaryModel.value = data.secondaryModel;
            const on = data.stealthModeEnabled;
            elems.stealthButton.textContent = `Stealth Mode: ${on ? 'On' : 'Off'}`;
            elems.stealthButton.classList.toggle('active', on);
            if (data.openRouterApiKey) {
                elems.apiKeyInput.value = data.openRouterApiKey;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const elems = {
            primaryModel: qs('primaryModel'),
            secondaryModel: qs('secondaryModel'),
            stealthButton: qs('stealthModeButton'),
            apiKeyInput: qs('apiKeyInput')
        };

        elems.stealthButton?.addEventListener('click', () => toggleStealth(elems));
        elems.apiKeyInput?.addEventListener('input', () => {
            const key = elems.apiKeyInput.value.trim();
            chrome.storage.sync.set({ openRouterApiKey: key });
        });
        bindModelChange(elems.primaryModel, 'primaryModel');
        bindModelChange(elems.secondaryModel, 'secondaryModel');

        loadSettings(elems);
    });
})();
