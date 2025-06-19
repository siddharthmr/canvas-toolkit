const stripPrefix = (txt, n = 9) => txt.slice(n);

const $all = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

const grabPointNodes = () =>
    $all('.question_points_holder').filter(node =>
        node.parentElement.classList.contains('header')
    );

const wrongChoice = input =>
    input?.parentElement?.nextElementSibling?.classList.contains('incorrect-answer');

const collectQuestionIds = () =>
    $all('.original_question_text').map(el =>
        el.nextElementSibling.id.split('_')[1]
    );

const QTYPE = Object.freeze({
    MCQ: 'multiple_choice_question',
    TF: 'true_false_question',
    FIB: 'short_answer_question',
    FIB_MULTI: 'fill_in_multiple_blanks_question',
    MA: 'multiple_answers_question',
    DROPDOWN: 'multiple_dropdowns_question',
    MATCH: 'matching_question',
    NUM: 'numerical_question',
    FORMULA: 'calculated_question',
    ESSAY: 'essay_question',
});

const fetchJson = url => fetch(url).then(r => r.json());

async function pullSubmissionHistory(courseId, quizId, origin) {
    const root = `${origin}api/v1/courses/${courseId}/quizzes/${quizId}/`;

    const [quiz, submissions] = await Promise.all([
        fetchJson(root),
        fetchJson(`${root}submissions`).then(r => r.quiz_submissions),
    ]);

    const assignmentId = quiz.assignment_id;
    const userId = submissions.at(-1).user_id;

    if (!assignmentId || !userId) return null;

    return fetchJson(
        `${origin}api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}?include[]=submission_history`
    ).then(r => r.submission_history);
}

function digestSubmissions(histories) {
    if (!histories?.length || !histories[0].submission_data) return null;

    const outcome = Object.create(null);

    const mapSubmission = sub =>
        Object.fromEntries(
            sub.submission_data.map(q => [q.question_id, q])
        );

    for (const raw of histories) {
        const snap = mapSubmission(raw);

        for (const [qId, attempt] of Object.entries(snap)) {
            const bucket =
                outcome[qId] ??
                (outcome[qId] = { bestAttempt: attempt, tried: [] });

            if (bucket.bestAttempt.correct) continue; // already perfect
            if (attempt.correct || attempt.points > bucket.bestAttempt.points) {
                bucket.bestAttempt = attempt;
            } else {
                bucket.tried.push(attempt);
            }
        }
    }
    return outcome;
}

class Painter {
    markAuto(el, evt = 'input') {
        el.dataset.autoFilled = '1';
        el.addEventListener(evt, () => (el.dataset.userModified = '1'), {
            once: true,
        });
    }

    essay(ans, qId) {
        const host = document.querySelector(`#question_${qId}_question_text`);
        setTimeout(() => {
            try {
                const frame =
                    host.nextElementSibling.querySelector('iframe') ??
                    host.querySelector('iframe');
                const doc = frame?.contentDocument || frame?.contentWindow?.document;
                const tgt = doc?.getElementById('tinymce');
                if (tgt && !tgt.dataset.userModified) {
                    tgt.innerHTML = ans.text;
                    this.markAuto(tgt);
                }
            } catch {
                host.insertAdjacentHTML('beforeend', `<p>${ans.text}</p>`);
            }
        }, 400);
    }

    fillBlank(ans, qId) {
        const box = $all(`input[name="question_${qId}"]`).find(
            el => !el.dataset.userModified
        );
        if (box) {
            box.value = ans.text;
            this.markAuto(box);
        }
    }

    fillMultiBlank(ans, qId) {
        const inputs = $all(
            `#question_${qId}_question_text input`
        ).filter(el => !el.dataset.userModified);
        const keys = Object.keys(ans).filter(k => k.includes('answer_for'));
        if (inputs.length === keys.length)
            inputs.forEach((el, i) => {
                el.value = ans[keys[i]];
                this.markAuto(el);
            });
    }

    matching(ans, qId) {
        Object.entries(ans)
            .filter(([k]) => k.startsWith('answer_'))
            .forEach(([k, v]) => {
                const el = document.getElementById(`question_${qId}_${k}`);
                if (el && !el.dataset.userModified) {
                    el.value = v;
                    this.markAuto(el);
                }
            });
    }

    multiAnswer(ans, qId) {
        Object.entries(ans)
            .filter(([k]) => k.startsWith('answer_'))
            .forEach(([k, v]) => {
                const el = document.getElementById(`question_${qId}_${k}`);
                if (el && !el.dataset.userModified) {
                    el.checked = !!+v;
                    this.markAuto(el, 'change');
                }
            });
    }

    mcq(ans, qId) {
        ans.attemptedAnswers?.forEach(id => {
            const cell = document.getElementById(
                `question_${qId}_answer_${id}`
            )?.parentElement?.nextElementSibling;
            if (cell) cell.classList.add('incorrect-answer');
        });

        if (!('answer_id' in ans)) return;

        const radio = document.getElementById(
            `question_${qId}_answer_${ans.answer_id}`
        );
        if (radio && !radio.dataset.userModified && !wrongChoice(radio)) {
            radio.checked = true;
            this.markAuto(radio, 'change');
        }
    }

    route(type, payload, id) {
        switch (type) {
            case QTYPE.ESSAY:
                return this.essay(payload, id);
            case QTYPE.MATCH:
                return this.matching(payload, id);
            case QTYPE.MA:
                return this.multiAnswer(payload, id);
            case QTYPE.MCQ:
            case QTYPE.TF:
                return this.mcq(payload, id);
            case QTYPE.FIB:
            case QTYPE.FORMULA:
            case QTYPE.NUM:
                return this.fillBlank(payload, id);
            case QTYPE.FIB_MULTI:
                return this.fillMultiBlank(payload, id);
        }
    }
}

function sprinkleAnswers(answers) {
    const questions = $all('.question');
    const types = $all('.question_type').map(el => el.textContent.trim());
    const points = grabPointNodes();
    const ids = collectQuestionIds();
    const paint = new Painter();

    questions.forEach((qNode, idx) => {
        const qId = ids[idx];
        const data = answers[qId];
        const holder = points[idx];
        const baseline = holder.textContent;

        if (!data) {
            holder.textContent = `(New Question) ${baseline}`;
            return;
        }

        const { bestAttempt, tried } = data;
        bestAttempt.attemptedAnswers = tried
            .filter(a => a.text)
            .map(a => a.text);

        paint.route(types[idx], bestAttempt, qId);
        const earned = Math.round(bestAttempt.points * 100) / 100;
        const maximum = parseFloat(baseline);

        holder.textContent = `${earned} out of ${baseline}`;

        const gotFullCredit = !Number.isNaN(maximum) && earned === maximum;
        holder.style.color = gotFullCredit ? 'green' : 'red';
        holder.classList.add(gotFullCredit ? 'correct-answer' : 'incorrect-answer');
    });
}

(async () => {
    const url = new URL(location.href);
    const [courseId, quizId] = [
        url.pathname.split('courses/')[1]?.split('/')[0],
        url.pathname.split('quizzes/')[1]?.split('/')[0],
    ];

    if (!+courseId || !+quizId) return;

    const history = await pullSubmissionHistory(
        courseId,
        quizId,
        `${url.protocol}//${url.host}/`
    );

    const digest = digestSubmissions(history);
    if (digest) sprinkleAnswers(digest);
})();
