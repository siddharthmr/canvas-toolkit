(() => {
    const U = window.CanvasToolkitUtils;

    const VISIBLE_INPUT = '.answer_input input:not([type="hidden"])';

    const getQuestionType = (el) =>
        el.classList.contains('multiple_answers_question')
            ? 'multiple_answers_question'
            : el.classList.contains('true_false_question')
            ? 'true_false_question'
            : el.classList.contains('multiple_choice_question')
            ? 'multiple_choice_question'
            : 'unknown';

    const getQuestionData = (el) => {
        const text = el.querySelector('.question_text')?.innerText.trim() || '';
        const qType = getQuestionType(el);

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
        }
    };

    const handleClick = (e, qEl, modelId) => {
        e.preventDefault();
        (async () => {
            const token = await U.getSupabaseToken();
            if (!token) return alert('Please log in via the popup first.');

            const img = U.isVisionModel(modelId)
                ? await U.getImageDataUrl()
                : null;

            const { question, choices, type } = getQuestionData(qEl);
            if (!question || !choices.length)
                return alert('Failed to read question.');

            const payload = {
                model: modelId,
                questionType: type,
                questionText: question,
                choices,
                imageDataUrl: img
            };

            const btn = e.currentTarget || e.target;
            const originalText = btn ? btn.textContent : '';
            btn.textContent = 'Processing...';
            btn.disabled = true;

            try {
                const res = await U.callEdgeFunction(token, payload);
                selectAnswer(qEl, res.result, type);
            } catch (err) {
                console.error(err);
                alert(`AI error: ${err.message.slice(0, 100)}`);
            } finally {
                if (btn) {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            }
        })();
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
        chrome.storage.sync.get(
            ['primaryModel', 'secondaryModel', 'stealthModeEnabled'],
            (d) => {
                const primary = d.primaryModel || 'openai/gpt-4o';
                const secondary = d.secondaryModel || 'openai/o3-mini';
                const opacity = d.stealthModeEnabled === false ? '1' : '0';

                addButtons(primary, secondary, opacity);

                const area = document.getElementById('questions') || document.body;
                new MutationObserver(m =>
                  m.some(x => [...x.addedNodes].some(n =>
                    n.nodeType === 1 && (n.matches('.display_question') || n.querySelector('.display_question'))
                  )) && addButtons(primary, secondary, opacity)
                ).observe(area, { childList: true, subtree: true });
            }
        );

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();
