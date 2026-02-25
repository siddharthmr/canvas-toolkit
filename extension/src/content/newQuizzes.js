(() => {
    const U = window.CanvasToolkitUtils;

    const clean = (t) => (t ? t.replace(/\s+/g, ' ').trim() : '');

    const ensureSpinnerStyles = () => {
        if (document.getElementById('canvas-toolkit-spinner-style')) return;
        const style = document.createElement('style');
        style.id = 'canvas-toolkit-spinner-style';
        style.textContent = `
            @keyframes canvasToolkitSpin {
                to { transform: rotate(360deg); }
            }
            .canvas-toolkit-btn-spinner {
                width: 14px;
                height: 14px;
                border: 2px solid rgba(255, 255, 255, 0.25);
                border-top-color: #d4d4d4;
                border-radius: 50%;
                display: block;
                box-sizing: border-box;
                animation: canvasToolkitSpin 0.75s linear infinite;
            }
        `;
        document.head.appendChild(style);
    };

    const setButtonLoading = (btn, isLoading) => {
        if (!btn) return false;

        if (isLoading) {
            if (btn.dataset.ctLoading === '1') return false;

            ensureSpinnerStyles();

            btn.dataset.ctLoading = '1';
            btn.dataset.ctOriginalText = btn.textContent || '';
            btn.dataset.ctOriginalWidth = btn.style.width || '';
            btn.dataset.ctOriginalHeight = btn.style.height || '';
            btn.dataset.ctOriginalPadding = btn.style.padding || '';
            btn.dataset.ctOriginalDisplay = btn.style.display || '';
            btn.dataset.ctOriginalAlignItems = btn.style.alignItems || '';
            btn.dataset.ctOriginalJustifyContent = btn.style.justifyContent || '';

            const rect = btn.getBoundingClientRect();
            btn.style.width = `${Math.ceil(rect.width)}px`;
            btn.style.height = `${Math.ceil(rect.height)}px`;
            btn.style.padding = '0';
            btn.style.display = 'inline-flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.textContent = '';
            btn.disabled = true;

            const spinner = document.createElement('span');
            spinner.className = 'canvas-toolkit-btn-spinner';
            spinner.setAttribute('aria-hidden', 'true');
            btn.appendChild(spinner);

            return true;
        }

        btn.dataset.ctLoading = '0';
        btn.disabled = false;
        btn.textContent = btn.dataset.ctOriginalText || btn.textContent;

        if (btn.dataset.ctOriginalWidth) btn.style.width = btn.dataset.ctOriginalWidth;
        else btn.style.removeProperty('width');
        if (btn.dataset.ctOriginalHeight) btn.style.height = btn.dataset.ctOriginalHeight;
        else btn.style.removeProperty('height');
        if (btn.dataset.ctOriginalPadding) btn.style.padding = btn.dataset.ctOriginalPadding;
        else btn.style.removeProperty('padding');
        if (btn.dataset.ctOriginalDisplay) btn.style.display = btn.dataset.ctOriginalDisplay;
        else btn.style.removeProperty('display');
        if (btn.dataset.ctOriginalAlignItems) btn.style.alignItems = btn.dataset.ctOriginalAlignItems;
        else btn.style.removeProperty('align-items');
        if (btn.dataset.ctOriginalJustifyContent) btn.style.justifyContent = btn.dataset.ctOriginalJustifyContent;
        else btn.style.removeProperty('justify-content');

        return true;
    };

    const triggerInputEvents = (element) => {
        ['click', 'change', 'input'].forEach((evtType) => {
            element.dispatchEvent(new Event(evtType, { bubbles: true }));
        });
    };

    const getQuestionContainers = () => {
        return [
            ...document.querySelectorAll(
                'div[data-automation="sdk-take-item-question"]'
            )
        ];
    };

    const getQuestionData = (container) => {
        const allUserContent = [...container.querySelectorAll('.user_content')];
        const questionEl = allUserContent.find((el) => !el.closest('label'));
        const questionText = questionEl ? clean(questionEl.innerText) : '';

        const choices = [];
        const radios = [...container.querySelectorAll('input[type="radio"]')];

        radios.forEach((radio, idx) => {
            let label = container.querySelector(`label[for="${radio.id}"]`);
            if (!label) label = radio.closest('label');

            if (label) {
                choices.push({
                    index: idx + 1,
                    text: clean(label.innerText),
                    element: radio
                });
            }
        });

        return { questionText, choices };
    };

    const solveSpecificQuestion = async (container, modelId, btn) => {
        if (!setButtonLoading(btn, true)) return;

        try {
            const token = await U.getSupabaseToken();
            if (!token) {
                alert('Please log in via the popup first.');
                return;
            }

            const { questionText, choices } = getQuestionData(container);
            if (!questionText || choices.length === 0) {
                alert('Could not parse this question.');
                return;
            }

            const img = U.isVisionModel(modelId) ? await U.getImageDataUrl() : null;

            const res = await U.callEdgeFunction(token, {
                model: modelId,
                questionType: 'indexed_choice',
                questionText,
                choices: choices.map((c) => ({ index: c.index, text: c.text })),
                imageDataUrl: img
            });

            if (typeof res.result === 'number') {
                const choice = choices.find((c) => c.index === res.result);
                if (choice?.element && !choice.element.checked) {
                    choice.element.checked = true;
                    triggerInputEvents(choice.element);
                }
            }
        } catch (e) {
            alert(`AI error: ${e.message.slice(0, 100)}`);
        } finally {
            setButtonLoading(btn, false);
        }
    };

    const injectButtons = (
        container,
        primaryModel,
        secondaryModel,
        opacity,
        forceUpdate = false
    ) => {
        if (!forceUpdate && container.dataset.toolkitInjected === 'true') return;

        const existing = container.querySelector('.canvas-toolkit-btn-group');
        if (existing) existing.remove();

        const headerRow =
            container.querySelector(
                'span[direction="row"].css-dtooqe-view--flex-flex'
            ) ||
            container.querySelector(
                '[data-automation="sdk-question-header"] [direction="row"]'
            ) ||
            container.querySelector('[data-automation="sdk-question-header"]') ||
            container.querySelector('[direction="row"]');

        const btnGroup = document.createElement('div');
        btnGroup.className = 'canvas-toolkit-btn-group';
        btnGroup.style.display = 'inline-flex';
        btnGroup.style.gap = '8px';
        btnGroup.style.marginLeft = '10px';
        btnGroup.style.opacity = opacity;
        btnGroup.style.verticalAlign = 'middle';

        const createBtn = (modelId) => {
            const btn = document.createElement('button');
            btn.className = 'canvas-toolkit-btn';
            btn.type = 'button';
            btn.style.cssText =
                'margin:0;padding:5px 10px;border:1px solid #555;border-radius:3px;' +
                'background:#333;color:#eee;font-size:.8em;line-height:1;cursor:pointer;' +
                `opacity:${opacity}`;

            btn.textContent = U.getDisplayModelName(modelId);

            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#444';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = '#333';
            });

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                solveSpecificQuestion(container, modelId, btn);
            });

            return btn;
        };

        btnGroup.appendChild(createBtn(primaryModel));
        if (primaryModel !== secondaryModel) {
            btnGroup.appendChild(createBtn(secondaryModel));
        }

        const pointLabel = [...container.querySelectorAll('*')].find((el) =>
            /^\d+\s*point(?:s)?$/i.test(clean(el.textContent || ''))
        );

        if (pointLabel?.parentElement) {
            pointLabel.insertAdjacentElement('afterend', btnGroup);
        } else if (headerRow) {
            headerRow.appendChild(btnGroup);
        } else {
            const fallbackHost =
                container.querySelector('.user_content')?.parentElement ||
                container.firstElementChild ||
                container;
            fallbackHost.prepend(btnGroup);
        }
        container.dataset.toolkitInjected = 'true';
    };

    const scanAndInject = (defaults, forceUpdate = false) => {
        chrome.storage.sync.get(
            ['primaryModel', 'secondaryModel', 'stealthModeEnabled'],
            (syncData) => {
                const primaryModel =
                    syncData.primaryModel || defaults.primary || 'openai/gpt-4o';
                const secondaryModel =
                    syncData.secondaryModel ||
                    defaults.secondary ||
                    'deepseek/deepseek-r1';
                const opacity = syncData.stealthModeEnabled ? '0' : '1';

                const questions = getQuestionContainers();
                questions.forEach((q) =>
                    injectButtons(
                        q,
                        primaryModel,
                        secondaryModel,
                        opacity,
                        forceUpdate
                    )
                );
            }
        );
    };

    const init = () => {
        chrome.storage.local.get(
            ['plan_tier', 'model_config_defaults'],
            (localData) => {
                U.loadCachedModels();

                let defaults = localData.model_config_defaults || {};
                scanAndInject(defaults, false);

                let retryCount = 0;
                const retryTimer = setInterval(() => {
                    scanAndInject(defaults, false);
                    retryCount += 1;
                    if (retryCount >= 8) clearInterval(retryTimer);
                }, 1000);

                const observer = new MutationObserver((mutations) => {
                    const shouldScan = mutations.some((m) => m.addedNodes.length > 0);
                    if (shouldScan) scanAndInject(defaults, false);
                });

                const mainContainer = document.querySelector(
                    '[data-automation="sdk-take-component"]'
                );
                if (mainContainer) {
                    observer.observe(mainContainer, {
                        childList: true,
                        subtree: true
                    });
                } else {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }

                chrome.storage.onChanged.addListener((changes, areaName) => {
                    const syncChanged =
                        areaName === 'sync' &&
                        (changes.primaryModel ||
                            changes.secondaryModel ||
                            Object.prototype.hasOwnProperty.call(
                                changes,
                                'stealthModeEnabled'
                            ));
                    const defaultsChanged =
                        areaName === 'local' && changes.model_config_defaults;

                    if (!syncChanged && !defaultsChanged) return;

                    if (defaultsChanged) {
                        defaults = changes.model_config_defaults.newValue || {};
                    }

                    scanAndInject(defaults, true);
                });
            }
        );
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
