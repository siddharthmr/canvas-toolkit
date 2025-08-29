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
            const apiKey = await U.getOpenRouterKey();
            if (!apiKey) return alert('Please set your OpenRouter API key in the popup.');

            const img = U.isVisionModel(modelId)
                ? await U.getImageDataUrl()
                : null;

            const { question, choices } = getQAndChoices();
            if (!question || !choices.length)
                return alert('Could not read quiz.');

            const res = await U.callOpenRouter(apiKey, {
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
            chrome.storage.sync.get(
                ['primaryModel', 'secondaryModel'],
                ({ primaryModel, secondaryModel }) => {
                    if (ev.data.type === 'runQuizEnhancerPrimary')
                        runWithModel(primaryModel || 'openai/o4-mini');
                    else runWithModel(secondaryModel || 'openai/gpt-4o');
                }
            );
        });
    };

    const init = () =>
        chrome.storage.sync.get(
            ['primaryModel', 'secondaryModel', 'stealthModeEnabled'],
            (d) => {
                const p = d.primaryModel || 'openai/o4-mini';
                const s = d.secondaryModel || 'openai/gpt-4o';
                const op = d.stealthModeEnabled === false ? '1' : '0';

                if (window === window.top) {
                    if (document.querySelector('iframe[title="Quizzes 2"]'))
                        addMenuButtons(p, s, op);
                } else {
                    attachIframeListener();
                }
            }
        );

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();
