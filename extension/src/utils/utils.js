(() => {
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    const VISION_MODELS = [
        'openai/gpt-4o',
        'openai/gpt-5',
        'openai/gpt-5-mini',
        'google/gemini-3-pro-preview'
    ];

    const isVisionModel = (m) => VISION_MODELS.includes(m);

    const getDisplayModelName = (id) => {
        if (!id) return 'Model';
        let n = id.split('/').pop();
        return n
            .replace(/-2024-\d{2}-\d{2}$/, '')
            .replace(/-latest$/, '')
            .replace('gpt-5-mini', 'GPT-5 mini')
            .replace('gpt-5', 'GPT-5')
            .replace('gpt-4o', 'GPT-4o')
            .replace('o4-mini', 'o4 mini')
            .replace('deepseek-r1:nitro', 'DS R1 Nitro')
            .replace('deepseek-r1', 'DS R1')
            .replace('deepseek-chat', 'DS V3')
            .replace('gemini-3-pro-preview', 'Gemini 3 Pro');
    };

    const getOpenRouterKey = () =>
        new Promise((resolve) =>
            chrome.storage.sync.get(['openRouterApiKey'], (d) =>
                resolve(d?.openRouterApiKey || null)
            )
        );

    const getImageDataUrl = async () => {
        try {
            const r = await chrome.runtime.sendMessage({ type: 'getPromptImageData' });
            if (r?.success && r.dataUrl) {
                console.log(
                    '[CanvasToolkit] Vision-model prompt will include image data ' +
                        `(≈${Math.round(r.dataUrl.length / 1024)} KB base64)`
                );
                return r.dataUrl;
            }
            console.log('[CanvasToolkit] No image data attached to this prompt');
            return null;
        } catch {
            return null;
        }
    };

    function buildOpenRouterPrompt(payload) {
        const { questionType, questionText, choices, imageDataUrl } = payload;
        let prompt =
            "You are an API. Respond *only* with a valid JSON object containing a single key ";
        let exampleFormat = '';
        let choicesString = '';
        switch (questionType) {
            case 'multiple_answers_question':
                prompt +=
                    "'answer'. The value of 'answer' should be an array of strings, where each string is the unique identifier corresponding to *all* correct answer choices.";
                choicesString = choices
                    .map(
                        (c) =>
                            `"${c.identifier}": "${(c.text || '').replace(/"/g, '\\"')}"`
                    )
                    .join(',\n  ');
                exampleFormat = '{"answer": ["id_1", "id_3"]}';
                break;
            case 'multiple_choice_question':
            case 'true_false_question':
                prompt +=
                    "'answer'. The value of 'answer' should be a single string, which is the unique identifier of the *one* correct answer choice.";
                choicesString = choices
                    .map(
                        (c) =>
                            `"${c.identifier}": "${(c.text || '').replace(/"/g, '\\"')}"`
                    )
                    .join(',\n  ');
                exampleFormat = '{"answer": "id_2"}';
                break;
            case 'indexed_choice':
                prompt +=
                    "'answer_index'. The value of 'answer_index' should be the 1-based integer index of the correct answer choice.";
                choicesString = choices
                    .map((c) => `${c.index}: ${(c.text || '').replace(/"/g, '\\"')}`)
                    .join('\n');
                exampleFormat = '{"answer_index": 3}';
                break;
            default:
                throw new Error(`Unsupported questionType: ${questionType}`);
        }
        prompt += `\n\nQuestion: ${questionText || ''}\n\nChoices`;
        if (questionType === 'indexed_choice') {
            prompt += ` (Index: Text):\n${choicesString}`;
        } else {
            prompt += ` (Identifier: Text):\n{\n  ${choicesString}\n}`;
        }
        if (imageDataUrl) {
            prompt += '\n\nImage data is included with this request.';
        }
        prompt += `\n\nExample Response Format: ${exampleFormat}`;
        const messageContent = [{ type: 'text', text: prompt }];
        console.log('[CanvasToolkit] Prompt to OpenRouter:\n' + prompt);
        if (imageDataUrl) {
            if (typeof imageDataUrl === 'string' && imageDataUrl.startsWith('data:image')) {
                messageContent.push({
                    type: 'image_url',
                    image_url: { url: imageDataUrl }
                });
                console.log('Including image data in OpenRouter payload.');
            } else {
                console.warn('Invalid or missing imageDataUrl format, ignoring image.');
            }
        }
        return messageContent;
    }

    function parseOpenRouterResponse(openRouterData, questionType) {
        const content = openRouterData?.choices?.[0]?.message?.content;
        if (typeof content !== 'string') {
            throw new Error('Response content is not a string.');
        }
        const parsedJson = JSON.parse(content);
        switch (questionType) {
            case 'multiple_answers_question':
                if (
                    parsedJson &&
                    Array.isArray(parsedJson.answer) &&
                    parsedJson.answer.every((item) => typeof item === 'string')
                )
                    return parsedJson.answer;
                throw new Error("Expected 'answer' array of strings not found.");
            case 'multiple_choice_question':
            case 'true_false_question':
                if (parsedJson && typeof parsedJson.answer === 'string')
                    return parsedJson.answer;
                throw new Error("Expected 'answer' string not found.");
            case 'indexed_choice':
                if (parsedJson && typeof parsedJson.answer_index === 'number') {
                    if (parsedJson.answer_index >= 1) return parsedJson.answer_index;
                    throw new Error(
                        `Invalid answer_index received: ${parsedJson.answer_index}`
                    );
                }
                throw new Error("Expected 'answer_index' number not found.");
            default:
                throw new Error(
                    `Cannot parse response for unsupported questionType: ${questionType}`
                );
        }
    }

    const callOpenRouter = async (apiKey, payload) => {
        const messages = buildOpenRouterPrompt(payload);
        const body = {
            model: payload.model,
            messages: [{ role: 'user', content: messages }],
            response_format: { type: 'json_object' }
        };
        const res = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        return { result: parseOpenRouterResponse(data, payload.questionType) };
    };

    window.CanvasToolkitUtils = {
        OPENROUTER_API_URL,
        isVisionModel,
        getDisplayModelName,
        getOpenRouterKey,
        getImageDataUrl,
        callOpenRouter
    };
})();
