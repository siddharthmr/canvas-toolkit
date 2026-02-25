(() => {
    const U = window.CanvasToolkitUtils;

    const VISIBLE_INPUT = '.answer_input input:not([type="hidden"])';

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
            btn.dataset.ctOriginalBoxSizing = btn.style.boxSizing || '';

            const rect = btn.getBoundingClientRect();
            btn.style.boxSizing = 'border-box';
            btn.style.width = `${rect.width}px`;
            btn.style.height = `${rect.height}px`;
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
        if (btn.dataset.ctOriginalBoxSizing) btn.style.boxSizing = btn.dataset.ctOriginalBoxSizing;
        else btn.style.removeProperty('box-sizing');

        return true;
    };

    const getQuestionType = (el) =>
        el.classList.contains('multiple_answers_question')
            ? 'multiple_answers_question'
            : el.classList.contains('true_false_question')
            ? 'true_false_question'
            : el.classList.contains('multiple_choice_question')
            ? 'multiple_choice_question'
            : el.classList.contains('short_answer_question')
            ? 'short_answer_question'
            : el.classList.contains('fill_in_multiple_blanks_question')
            ? 'fill_in_multiple_blanks_question'
            : el.classList.contains('multiple_dropdowns_question')
            ? 'multiple_dropdowns_question'
            : el.classList.contains('numerical_question')
            ? 'numerical_question'
            : el.classList.contains('matching_question')
            ? 'matching_question'
            : el.classList.contains('essay_question')
            ? 'essay_question'
            : 'unknown';

    const getQuestionData = (el) => {
        const qType = getQuestionType(el);

        // --- Essay question ---
        if (qType === 'essay_question') {
            const text = el.querySelector('.question_text')?.innerText.trim() || '';
            return { question: text, choices: [], type: qType };
        }

        // --- Fill-in-the-blank (single) / Numerical ---
        if (qType === 'short_answer_question' || qType === 'numerical_question') {
            const text = el.querySelector('.question_text')?.innerText.trim() || '';
            return { question: text, choices: [], type: qType };
        }

        // --- Fill-in multiple blanks ---
        if (qType === 'fill_in_multiple_blanks_question') {
            const questionTextEl = el.querySelector('.question_text');
            if (!questionTextEl) return { question: '', choices: [], type: qType };

            const inputs = [...questionTextEl.querySelectorAll('input.question_input')];
            const blankNames = inputs.map((inp) => inp.getAttribute('name') || '');

            // Clone to replace inputs with readable placeholders
            const clone = questionTextEl.cloneNode(true);
            const cloneInputs = [...clone.querySelectorAll('input.question_input')];
            cloneInputs.forEach((inp, idx) => {
                const placeholder = document.createTextNode(`[BLANK_${idx + 1}]`);
                inp.parentNode.replaceChild(placeholder, inp);
            });
            const text = clone.innerText.trim();

            const blanks = blankNames.map((name, idx) => ({
                identifier: name,
                text: `BLANK_${idx + 1}`,
                index: idx + 1
            }));

            return { question: text, choices: blanks, type: qType };
        }

        // --- Multiple dropdowns ---
        if (qType === 'multiple_dropdowns_question') {
            const questionTextEl = el.querySelector('.question_text');
            if (!questionTextEl) return { question: '', choices: [], type: qType };

            const selects = [...questionTextEl.querySelectorAll('select.question_input')];

            // Build dropdown data: each select has a name and option values
            const dropdowns = selects.map((sel, idx) => {
                const name = sel.getAttribute('name') || '';
                const options = [...sel.querySelectorAll('option')]
                    .filter((opt) => opt.value !== '') // skip the "[ Select ]" placeholder
                    .map((opt) => ({
                        value: opt.value,
                        text: opt.textContent.trim()
                    }));
                return {
                    identifier: name,
                    text: `DROPDOWN_${idx + 1}`,
                    index: idx + 1,
                    options
                };
            });

            // Clone to replace selects with readable placeholders
            const clone = questionTextEl.cloneNode(true);
            const cloneSelects = [...clone.querySelectorAll('select.question_input')];
            cloneSelects.forEach((sel, idx) => {
                const placeholder = document.createTextNode(`[DROPDOWN_${idx + 1}]`);
                sel.parentNode.replaceChild(placeholder, sel);
            });
            const text = clone.innerText.trim();

            return { question: text, choices: dropdowns, type: qType };
        }

        // --- Matching question ---
        if (qType === 'matching_question') {
            const text = el.querySelector('.question_text')?.innerText.trim() || '';
            const answerDivs = [...el.querySelectorAll('.answers .answer')];

            const matches = answerDivs.map((div) => {
                const sel = div.querySelector('select.question_input');
                if (!sel) return null;
                const name = sel.getAttribute('name') || '';
                const id = sel.getAttribute('id') || '';
                // Get the label text for this match item
                const labelEl = id ? div.querySelector(`label[for="${id}"]`) : null;
                const label = labelEl ? labelEl.innerText.trim() : '';
                // Get dropdown options (skip the "[ Choose ]" placeholder)
                const options = [...sel.querySelectorAll('option')]
                    .filter((opt) => opt.value !== '')
                    .map((opt) => ({
                        value: opt.value,
                        text: opt.textContent.trim()
                    }));
                return label && name ? { identifier: name, text: label, options } : null;
            }).filter(Boolean);

            return { question: text, choices: matches, type: qType };
        }

        // --- Choice-based questions (MC, TF, multiple answers) ---
        const text = el.querySelector('.question_text')?.innerText.trim() || '';

        const choices = [...el.querySelectorAll(VISIBLE_INPUT)]
            .map((input) => {
                let label = '';
                const lblId = input.getAttribute('aria-labelledby');
                const lblEl = lblId ? document.getElementById(lblId) : null;
                if (lblEl) label = lblEl.innerText.trim();
                else {
                    const id = input.id;
                    let lab = id
                        ? el.querySelector(`label[for="${id}"]`)
                        : null;
                    if (!lab) lab = input.closest('label');
                    if (lab) {
                        const clone = lab.cloneNode(true);
                        clone.querySelector('input')?.remove();
                        label = clone.innerText.trim();
                    }
                }

                let ident =
                    qType === 'multiple_answers_question'
                        ? input.id
                        : [
                              'multiple_choice_question',
                              'true_false_question'
                          ].includes(qType)
                        ? input.value
                        : input.id || input.value;

                return label && ident
                    ? { text: label, identifier: ident }
                    : null;
            })
            .filter(Boolean);

        return { question: text, choices, type: qType };
    };

    const selectAnswer = (qEl, answer, qType) => {
        console.log('Selecting answer:', answer, 'type:', qType);
        switch (qType) {
            case 'multiple_answers_question': {
                if (!Array.isArray(answer)) return;
                qEl.querySelectorAll('input[type="checkbox"]').forEach(
                    (i) => (i.checked = false)
                );
                answer.forEach((id) => {
                    const inp = qEl.querySelector(
                        `input[type="checkbox"][id="${id}"]`
                    );
                    if (inp && !inp.checked) {
                        inp.checked = true;
                        inp.dispatchEvent(
                            new Event('change', { bubbles: true })
                        );
                        inp.dispatchEvent(
                            new Event('click', { bubbles: true })
                        );
                    }
                });
                break;
            }
            case 'multiple_choice_question':
            case 'true_false_question': {
                if (typeof answer !== 'string') return;
                const inp =
                    qEl.querySelector(
                        `input[type="radio"][value="${answer}"]`
                    ) ||
                    qEl.querySelector(`input[type="radio"][id="${answer}"]`);
                if (inp && !inp.checked) {
                    inp.checked = true;
                    inp.dispatchEvent(new Event('change', { bubbles: true }));
                    inp.dispatchEvent(new Event('click', { bubbles: true }));
                }
                break;
            }
            case 'short_answer_question':
            case 'numerical_question': {
                const val = String(answer);
                const inp = qEl.querySelector('input.question_input');
                if (inp) {
                    const nativeSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype, 'value'
                    )?.set;
                    if (nativeSetter) {
                        nativeSetter.call(inp, val);
                    } else {
                        inp.value = val;
                    }
                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                    inp.dispatchEvent(new Event('change', { bubbles: true }));
                }
                break;
            }
            case 'fill_in_multiple_blanks_question': {
                // answer is { "question_XXX_hash1": "red", "question_XXX_hash2": "blue" }
                if (typeof answer !== 'object' || answer === null) return;
                const nativeSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value'
                )?.set;

                Object.entries(answer).forEach(([name, value]) => {
                    const inp = qEl.querySelector(`input.question_input[name="${name}"]`);
                    if (inp) {
                        if (nativeSetter) {
                            nativeSetter.call(inp, value);
                        } else {
                            inp.value = value;
                        }
                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                        inp.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
                break;
            }
            case 'essay_question': {
                const val = String(answer);
                const htmlVal = val.replace(/\n/g, '<br>');
                const tinyId = qEl.querySelector('textarea.question_input')?.id;

                // Write directly into TinyMCE iframe body (same-origin)
                if (tinyId) {
                    const iframe = qEl.querySelector(`#${tinyId}_ifr`);
                    if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
                        iframe.contentDocument.body.innerHTML = htmlVal;
                    }
                    // Fire tinymce change via background MAIN world injection
                    chrome.runtime.sendMessage({
                        type: 'execMainWorld',
                        code: `(function(){ try { var ed = typeof tinymce!=='undefined' && tinymce.get('${tinyId}'); if(ed){ed.fire('change');} } catch(e){} })();`
                    });
                }

                // Also set textarea value for form submission
                const textarea = qEl.querySelector('textarea.question_input');
                if (textarea) {
                    textarea.value = htmlVal;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    textarea.dispatchEvent(new Event('change', { bubbles: true }));
                }
                break;
            }
            case 'multiple_dropdowns_question':
            case 'matching_question': {
                // answer is { "selectName1": "optionValue", "selectName2": "optionValue" }
                if (typeof answer !== 'object' || answer === null) return;

                Object.entries(answer).forEach(([name, value]) => {
                    const sel = qEl.querySelector(`select.question_input[name="${name}"]`);
                    if (sel) {
                        sel.value = String(value);
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
                break;
            }
        }
    };

    const handleClick = async (e, qEl, modelId) => {
        e.preventDefault();
        const btn = e.currentTarget || e.target;
        if (!setButtonLoading(btn, true)) return;
        try {
            const token = await U.getSupabaseToken();
            if (!token) {
                alert('Please log in via the popup first.');
                return;
            }

            const img = U.isVisionModel(modelId)
                ? await U.getImageDataUrl()
                : null;

            const { question, choices, type } = getQuestionData(qEl);

            if (!question)
                return alert('Failed to read question.');
            if (!['short_answer_question', 'numerical_question', 'fill_in_multiple_blanks_question', 'multiple_dropdowns_question', 'essay_question'].includes(type) && !choices.length)
                return alert('Failed to read question choices.');

            const payload = {
                model: modelId,
                questionType: type,
                questionText: question,
                choices,
                imageDataUrl: img
            };

            try {
                const res = await U.callEdgeFunction(token, payload);
                selectAnswer(qEl, res.result, type);
            } catch (err) {
                console.error(err);
                alert(`AI error: ${err.message.slice(0, 100)}`);
            }
        } finally {
            setButtonLoading(btn, false);
        }
    };

    const addButtons = (primary, secondary, opacity) => {
        document.querySelectorAll('.display_question').forEach((qEl) => {
            const header = qEl.querySelector('.header');
            if (!header || header.querySelector('.canvas-toolkit-btn')) return;

            const makeBtn = (m) => {
                const b = document.createElement('button');
                b.className = 'canvas-toolkit-btn';
                b.style.cssText =
                    'margin:0 10px;padding:5px 10px;border:1px solid #555;border-radius:3px;' +
                    'background:#333;color:#eee;font-size:.8em;line-height:1;cursor:pointer;' +
                    `opacity:${opacity}`;
                b.textContent = U.getDisplayModelName(m);
                b.addEventListener('click', (ev) => handleClick(ev, qEl, m));
                b.onmouseenter = () => (b.style.background = '#444');
                b.onmouseleave = () => (b.style.background = '#333');
                return b;
            };

            header.appendChild(makeBtn(primary));
            if (primary !== secondary) {
                const secondaryBtn = makeBtn(secondary);
                secondaryBtn.style.cssText += ';float:right;';
                header.appendChild(secondaryBtn);
            }
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
                    let primary = d.primaryModel || defaults.primary || 'openai/gpt-4o';
                    let secondary = d.secondaryModel || defaults.secondary || 'deepseek/deepseek-r1';
                    let opacity = d.stealthModeEnabled ? '0' : '1';

                    addButtons(primary, secondary, opacity);

                    const area = document.getElementById('questions') || document.body;
                    new MutationObserver(m =>
                      m.some(x => [...x.addedNodes].some(n =>
                        n.nodeType === 1 && (n.matches('.display_question') || n.querySelector('.display_question'))
                      )) && addButtons(primary, secondary, opacity)
                    ).observe(area, { childList: true, subtree: true });

                    // Live-update buttons when popup settings change
                    chrome.storage.onChanged.addListener((changes, areaName) => {
                        if (areaName !== 'sync') return;
                        let needsUpdate = false;

                        if (changes.primaryModel?.newValue) {
                            primary = changes.primaryModel.newValue;
                            needsUpdate = true;
                        }
                        if (changes.secondaryModel?.newValue) {
                            secondary = changes.secondaryModel.newValue;
                            needsUpdate = true;
                        }
                        if ('stealthModeEnabled' in changes) {
                            opacity = changes.stealthModeEnabled.newValue ? '0' : '1';
                            needsUpdate = true;
                        }

                        if (!needsUpdate) return;

                        // Remove existing buttons and re-add with new settings
                        document.querySelectorAll('.canvas-toolkit-btn').forEach(b => b.remove());
                        addButtons(primary, secondary, opacity);
                    });
                }
            );
        });

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();
