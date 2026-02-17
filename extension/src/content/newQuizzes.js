(() => {
    const U = window.CanvasToolkitUtils;

    const clean = (t) => t ? t.replace(/\s+/g, ' ').trim() : '';

    const triggerInputEvents = (element) => {
        ['click', 'change', 'input', 'bubbles'].forEach((evtType) => {
            const evt = new Event(evtType, { bubbles: true });
            element.dispatchEvent(evt);
        });
    };

    
    const getQuestionData = (container) => {
        const allUserContent = [...container.querySelectorAll('.user_content')];
        const questionEl = allUserContent.find(el => !el.closest('label')); 
        const questionText = questionEl ? clean(questionEl.innerText) : '';

        const choices = [];
        const radios = [...container.querySelectorAll('input[type="radio"]')];

        radios.forEach((radio, idx) => {
            let label = container.querySelector(`label[for="${radio.id}"]`);
            
            if (!label) label = radio.closest('label');

            if (label) {
                const txt = clean(label.innerText);
                choices.push({
                    index: idx + 1,
                    text: txt,
                    element: radio
                });
            }
        });

        return { questionText, choices };
    };

    const solveSpecificQuestion = async (container, modelId) => {
        try {
            const apiKey = await U.getOpenRouterKey();
            if (!apiKey) return alert('Please set your OpenRouter API key in the popup.');

            const { questionText, choices } = getQuestionData(container);

            if (!questionText || choices.length === 0) {
                console.error("Parse failed", { questionText, choices });
                return alert('Could not parse this question. See console.');
            }

            const btnContainer = container.querySelector('.canvas-toolkit-btn-group');

            const img = U.isVisionModel(modelId) ? await U.getImageDataUrl() : null;

            const res = await U.callOpenRouter(apiKey, {
                model: modelId,
                questionType: 'indexed_choice',
                questionText: questionText,
                choices: choices.map(c => ({ index: c.index, text: c.text })), // Send only necessary data to AI
                imageDataUrl: img
            });


            if (typeof res.result === 'number') {
                const correctChoice = choices.find(c => c.index === res.result);
                if (correctChoice && correctChoice.element) {
                    if (!correctChoice.element.checked) {
                        correctChoice.element.checked = true;
                        triggerInputEvents(correctChoice.element);
                    }
                } else {
                    alert(`AI returned index ${res.result}, but that choice was not found.`);
                }
            }
        } catch (e) {
            alert(`AI error: ${e.message.slice(0, 100)}`);
            const btnContainer = container.querySelector('.canvas-toolkit-btn-group');
        }
    };

    const injectButtons = (container, primaryModel, secondaryModel, opacity) => {
        if (container.dataset.toolkitInjected === 'true') return;

        const headerRow = container.querySelector('span[direction="row"].css-dtooqe-view--flex-flex');

        if (!headerRow) return;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'canvas-toolkit-btn-group';
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '8px';
        btnGroup.style.marginLeft = '12px';
        btnGroup.style.opacity = opacity;

        const createBtn = (modelId, color, label) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.margin = '0';
            btn.style.padding = '5px 10px';
            btn.style.border = '1px solid #ccc';
            btn.style.borderRadius = '4px';
            btn.style.background = '#fff';
            btn.style.color = '#333';
            btn.style.fontSize = '12px';
            btn.style.fontWeight = '500';
            btn.style.lineHeight = '1.2';
            btn.style.cursor = 'pointer';
            btn.style.fontFamily = 'inherit';
            btn.style.transition = 'all 0.2s ease';
            
            btn.textContent = U.getDisplayModelName(modelId);

            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#f5f5f5';
                btn.style.borderColor = color;
                btn.style.color = color;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = '#fff';
                btn.style.borderColor = '#ccc';
                btn.style.color = '#333';
            });
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                solveSpecificQuestion(container, modelId);
            });
            return btn;
        };

        btnGroup.appendChild(createBtn(primaryModel, '#28a745', 'P'));

        if (primaryModel !== secondaryModel) {
            btnGroup.appendChild(createBtn(secondaryModel, '#007bff', 'S'));
        }

        headerRow.appendChild(btnGroup);
        container.dataset.toolkitInjected = 'true';
    };

    const scanAndInject = () => {
        chrome.storage.sync.get(
            ['primaryModel', 'secondaryModel', 'stealthModeEnabled'],
            (d) => {
                const p = d.primaryModel || 'openai/o4-mini';
                const s = d.secondaryModel || 'openai/gpt-4o';

                const op = d.stealthModeEnabled ? '0' : '1'; 

                const questions = document.querySelectorAll('div[data-automation="sdk-take-item-question"]');
                
                questions.forEach(q => {
                    injectButtons(q, p, s, op);
                });
            }
        );
    };

    const init = () => {
        scanAndInject();

        const observer = new MutationObserver((mutations) => {
            let shouldScan = false;
            for (const m of mutations) {
                if (m.addedNodes.length > 0) {
                    shouldScan = true; 
                    break;
                }
            }
            if (shouldScan) scanAndInject();
        });

        const mainContainer = document.querySelector('[data-automation="sdk-take-component"]');
        if (mainContainer) {
            observer.observe(mainContainer, { childList: true, subtree: true });
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
