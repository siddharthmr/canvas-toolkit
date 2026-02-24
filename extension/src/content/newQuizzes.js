(() => {
    const U = window.CanvasToolkitUtils;

    const clean = (t) => t.replace(/\s+/g, ' ').trim();

    const getQAndChoices = () => {
        const elems = [...document.getElementsByClassName('user_content')];
        let question = '',
            choices = [],
            seenQ = false;
        elems.forEach((el) => {
            const txt = clean(el.innerText);
            if (!txt) return;
            if (!seenQ) {
                question = txt;
                seenQ = true;
            } else if (
                txt !== question &&
                !choices.some((c) => c.text === txt)
            ) {
                choices.push({ text: txt, index: choices.length + 1 });
            }
        });
        return { question, choices };
    };

    const selectAnswer = (idx) => {
        const radios = document.querySelectorAll("input[type='radio']");
        if (idx < 1 || idx > radios.length) return;
        const r = radios[idx - 1];
        if (!r.checked) {
            r.checked = true;
            r.dispatchEvent(new Event('change', { bubbles: true }));
            r.dispatchEvent(new Event('click', { bubbles: true }));
        }
    };

    const runWithModel = (modelId) =>
        (async () => {
            const token = await U.getSupabaseToken();
            if (!token) return alert('Please log in via the popup first.');

            const img = U.isVisionModel(modelId)
                ? await U.getImageDataUrl()
                : null;

            const { question, choices } = getQAndChoices();
            if (!question || !choices.length)
                return alert('Could not read quiz.');

            const res = await U.callEdgeFunction(token, {
                model: modelId,
                questionType: 'indexed_choice',
                questionText: question,
                choices,
                imageDataUrl: img
            });

            if (typeof res.result === 'number') selectAnswer(res.result);
        })().catch((e) => alert(`AI error: ${e.message.slice(0, 100)}`));

    const addMenuButtons = (primary, secondary, opacity) => {
        const menu = document.getElementById('menu');
        if (!menu || document.getElementById('canvas-toolkit-primary-btn'))
            return;

        const makeLi = (id, model) => {
            const li = document.createElement('li');
            li.className = 'menu-item ic-app-header__menu-list-item';
            li.innerHTML = `<a id="${id}" href="#" class="ic-app-header__menu-list-link" style="opacity:${opacity}">
             <div class="menu-item-icon-container" aria-hidden="true">
               <svg class="ic-icon-svg ic-icon-svg--search" viewBox="0 0 1920 1920"
                    style="width:1em;height:1em;fill:currentColor;">
                 <path d="M1728 1510l-402-402q66-90 ..."></path>
               </svg>
             </div>
             <div class="menu-item__text">${U.getDisplayModelName(model)}</div>
           </a>`;
            li.querySelector('a').onclick = (ev) => {
                ev.preventDefault();
                const iframe = document.querySelector('iframe.tool_launch');
                iframe?.contentWindow?.postMessage(
                    {
                        type: id.includes('primary')
                            ? 'runQuizEnhancerPrimary'
                            : 'runQuizEnhancerSecondary'
                    },
                    '*'
                );
            };
            return li;
        };

        menu.appendChild(makeLi('canvas-toolkit-primary-btn', primary));
        if (primary !== secondary)
            menu.appendChild(makeLi('canvas-toolkit-secondary-btn', secondary));
    };

    const attachIframeListener = () => {
        window.addEventListener('message', (ev) => {
            if (!ev.data?.type?.startsWith('runQuizEnhancer')) return;
            chrome.storage.local.get(['model_config_defaults'], (localData) => {
                const defaults = localData.model_config_defaults || {};
                chrome.storage.sync.get(
                    ['primaryModel', 'secondaryModel'],
                    ({ primaryModel, secondaryModel }) => {
                        if (ev.data.type === 'runQuizEnhancerPrimary')
                            runWithModel(primaryModel || defaults.primary || 'openai/gpt-4o');
                        else runWithModel(secondaryModel || defaults.secondary || 'deepseek/deepseek-r1');
                    }
                );
            });
        });
    };

    const init = () =>
        chrome.storage.local.get(['plan_tier', 'model_config_defaults'], (localData) => {
            const planTier = localData.plan_tier;
            const hasAi = planTier === 'ai';

            if (!hasAi) return;

            // Warm the cached models for vision check + display names
            U.loadCachedModels();

            const defaults = localData.model_config_defaults || {};

            chrome.storage.sync.get(
                ['primaryModel', 'secondaryModel', 'stealthModeEnabled'],
                (d) => {
                    let p = d.primaryModel || defaults.primary || 'openai/gpt-4o';
                    let s = d.secondaryModel || defaults.secondary || 'deepseek/deepseek-r1';
                    let op = d.stealthModeEnabled ? '0' : '1';

                    if (window === window.top) {
                        if (document.querySelector('iframe[title="Quizzes 2"]'))
                            addMenuButtons(p, s, op);

                        // Live-update menu buttons when popup settings change
                        chrome.storage.onChanged.addListener((changes, areaName) => {
                            if (areaName !== 'sync') return;
                            let needsUpdate = false;

                            if (changes.primaryModel?.newValue) {
                                p = changes.primaryModel.newValue;
                                needsUpdate = true;
                            }
                            if (changes.secondaryModel?.newValue) {
                                s = changes.secondaryModel.newValue;
                                needsUpdate = true;
                            }
                            if ('stealthModeEnabled' in changes) {
                                op = changes.stealthModeEnabled.newValue ? '0' : '1';
                                needsUpdate = true;
                            }

                            if (!needsUpdate) return;

                            // Remove existing buttons and re-add
                            const existing = document.querySelectorAll('#canvas-toolkit-primary-btn, #canvas-toolkit-secondary-btn');
                            existing.forEach(el => el.closest('li')?.remove());
                            if (document.querySelector('iframe[title="Quizzes 2"]'))
                                addMenuButtons(p, s, op);
                        });
                    } else {
                        attachIframeListener();
                    }
                }
            );
        });

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();
