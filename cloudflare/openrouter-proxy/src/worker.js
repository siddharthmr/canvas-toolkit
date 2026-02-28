import { createClient } from "@supabase/supabase-js";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_TOKENS = 10000;
const MAX_INPUT_CHARS = 5000; // max combined text input (questionText + choices) before sending to OpenRouter
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB max for base64-encoded images
const CORS = { "Access-Control-Allow-Origin": "*" };
const JSON_HEADERS = { "Content-Type": "application/json", ...CORS };

const jsonRes = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

// Question types that don't require choices
const NO_CHOICES_TYPES = [
  "short_answer_question",
  "numerical_question",
  "fill_in_multiple_blanks_question",
  "multiple_dropdowns_question",
  "essay_question",
];

// ── Model whitelist cache (persists across requests in the same CF isolate) ──
let cachedWhitelist = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getAllowedModels(supabase) {
  if (cachedWhitelist && Date.now() - cacheTime < CACHE_TTL) {
    return cachedWhitelist;
  }
  const { data } = await supabase.from("models").select("id");
  cachedWhitelist = new Set((data || []).map((r) => r.id));
  cacheTime = Date.now();
  return cachedWhitelist;
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          ...CORS,
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    const openrouterApiKey = env.OPENROUTER_KEY;
    if (!openrouterApiKey) {
      console.error("OPENROUTER_KEY not set");
      return jsonRes({ error: "Server misconfigured" }, 500);
    }

    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader)
        return jsonRes({ error: "Missing authorization header" }, 401);

      const supabaseAdmin = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error: userError,
      } = await supabaseAdmin.auth.getUser(token);
      if (userError || !user)
        return jsonRes({ error: "Invalid or expired token" }, 401);

      // ── Quick pre-checks (before acquiring concurrency slot) ──

      const body = await request.json();
      const { model, questionType, questionText, choices, imageDataUrl } = body;

      if (!model || !questionText)
        return jsonRes({ error: "Missing required fields" }, 400);
      if (!NO_CHOICES_TYPES.includes(questionType) && !choices)
        return jsonRes({ error: "Missing required fields" }, 400);

      // Model whitelist check
      const allowedModels = await getAllowedModels(supabaseAdmin);
      if (!allowedModels.has(model)) {
        return jsonRes({ error: "Model not allowed" }, 403);
      }

      // Input size validation
      const choicesText = choices ? JSON.stringify(choices) : "";
      const totalInputChars = (questionText || "").length + choicesText.length;
      if (totalInputChars > MAX_INPUT_CHARS) {
        return jsonRes(
          { error: `Input too long (${totalInputChars} chars). Maximum is ${MAX_INPUT_CHARS} characters.` },
          400
        );
      }

      // Image size validation
      if (imageDataUrl) {
        const base64Start = imageDataUrl.indexOf(",");
        const base64Data = base64Start >= 0 ? imageDataUrl.slice(base64Start + 1) : imageDataUrl;
        const estimatedBytes = Math.ceil(base64Data.length * 0.75);
        if (estimatedBytes > MAX_IMAGE_BYTES) {
          const sizeMB = (estimatedBytes / (1024 * 1024)).toFixed(1);
          return jsonRes(
            { error: `Image too large (${sizeMB} MB). Maximum is ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.` },
            400
          );
        }
      }

      // ── Acquire concurrency slot (atomic: checks plan_tier, credits > 0, pending_calls < 5) ──

      const { data: slotAcquired, error: slotError } = await supabaseAdmin
        .rpc("acquire_call_slot", { p_user_id: user.id });

      if (slotError) {
        console.error("Slot acquire error:", slotError);
        return jsonRes({ error: "Internal server error" }, 500);
      }
      if (!slotAcquired) {
        // Could be: no credits, wrong plan, or at concurrency limit
        // Fetch profile to give a specific error message
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("credits, plan_tier, pending_calls")
          .eq("id", user.id)
          .single();
        if (!profile)
          return jsonRes({ error: "Profile not found" }, 404);
        if (profile.plan_tier !== "ai")
          return jsonRes({ error: "AI plan required. Please upgrade your subscription." }, 403);
        if (typeof profile.credits !== "number" || profile.credits <= 0)
          return jsonRes({ error: "No credits remaining. Credits reset at the start of your next billing period." }, 403);
        if (profile.pending_calls >= 5)
          return jsonRes({ error: "Too many concurrent requests. Please wait for current requests to finish." }, 429);
        return jsonRes({ error: "Request denied" }, 403);
      }

      // Slot acquired — from here on, we MUST release it (even on error)

      // ── Build prompt + structured output schema per question type ──

      let systemPrompt;
      let userContent;
      let responseFormat = undefined;

      switch (questionType) {
        case "essay_question": {
          systemPrompt =
            "You are a quiz-answering assistant. The user gives you a free-response question. Return the correct answer in the specified JSON format. Be concise and direct.";
          userContent = `Question: ${questionText}`;
          responseFormat = {
            type: "json_schema",
            json_schema: {
              name: "free_response_answer",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  answer: {
                    type: "string",
                    description: "The concise answer to the question",
                  },
                },
                required: ["answer"],
                additionalProperties: false,
              },
            },
          };
          break;
        }

        case "short_answer_question": {
          systemPrompt =
            "You are a quiz-answering assistant. The user gives you a fill-in-the-blank or short answer question. Return the correct answer in the specified JSON format. Be concise \u2014 just the answer, no explanation.";
          userContent = `Question: ${questionText}`;
          responseFormat = {
            type: "json_schema",
            json_schema: {
              name: "short_answer",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  answer: {
                    type: "string",
                    description: "The correct short answer",
                  },
                },
                required: ["answer"],
                additionalProperties: false,
              },
            },
          };
          break;
        }

        case "numerical_question": {
          systemPrompt =
            "You are a quiz-answering assistant. The user gives you a numerical question that expects a number as the answer. Return ONLY the correct numerical value in the specified JSON format. Be precise \u2014 just the number, no units, no explanation. If the answer is a decimal, include appropriate decimal places.";
          userContent = `Question: ${questionText}`;
          responseFormat = {
            type: "json_schema",
            json_schema: {
              name: "numerical_answer",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  answer: {
                    type: "string",
                    description:
                      'The correct numerical answer as a string (e.g. "3.14", "42")',
                  },
                },
                required: ["answer"],
                additionalProperties: false,
              },
            },
          };
          break;
        }

        case "fill_in_multiple_blanks_question": {
          const blankList = (choices || [])
            .map((c) => `- ${c.text} (identifier: "${c.identifier}")`)
            .join("\n");
          systemPrompt = `You are a quiz-answering assistant. The user gives you a fill-in-the-blank question with multiple blanks marked as [BLANK_1], [BLANK_2], etc. Return a JSON object with a "blanks" field mapping each blank's identifier to the correct answer string. No explanation.`;
          userContent = `Question: ${questionText}\n\nBlanks:\n${blankList}`;

          const blankProperties = {};
          const blankRequired = [];
          for (const c of choices || []) {
            blankProperties[c.identifier] = {
              type: "string",
              description: `Answer for ${c.text}`,
            };
            blankRequired.push(c.identifier);
          }

          responseFormat = {
            type: "json_schema",
            json_schema: {
              name: "fill_in_blanks",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  blanks: {
                    type: "object",
                    properties: blankProperties,
                    required: blankRequired,
                    additionalProperties: false,
                  },
                },
                required: ["blanks"],
                additionalProperties: false,
              },
            },
          };
          break;
        }

        case "multiple_dropdowns_question": {
          const dropdownDescriptions = (choices || [])
            .map((d) => {
              const optList = d.options
                .map((o) => `  value="${o.value}" \u2192 ${o.text}`)
                .join("\n");
              return `${d.text} (identifier: "${d.identifier}"):\n${optList}`;
            })
            .join("\n\n");

          systemPrompt = `You are a quiz-answering assistant. The user gives you a question with inline dropdowns marked as [DROPDOWN_1], [DROPDOWN_2], etc. Each dropdown has specific options with values. Return a JSON object with a "selections" field mapping each dropdown's identifier to the correct option VALUE (not the text). No explanation.`;
          userContent = `Question: ${questionText}\n\nDropdowns:\n${dropdownDescriptions}`;

          const ddProperties = {};
          const ddRequired = [];
          for (const d of choices || []) {
            const validValues = d.options.map((o) => o.value);
            ddProperties[d.identifier] = {
              type: "string",
              description: `Selected option value for ${d.text}`,
              enum: validValues,
            };
            ddRequired.push(d.identifier);
          }

          responseFormat = {
            type: "json_schema",
            json_schema: {
              name: "multiple_dropdowns",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  selections: {
                    type: "object",
                    properties: ddProperties,
                    required: ddRequired,
                    additionalProperties: false,
                  },
                },
                required: ["selections"],
                additionalProperties: false,
              },
            },
          };
          break;
        }

        case "matching_question": {
          const matchDescriptions = (choices || [])
            .map((m) => {
              const optList = m.options
                .map((o) => `  value="${o.value}" \u2192 ${o.text}`)
                .join("\n");
              return `"${m.text}" (identifier: "${m.identifier}"):\n${optList}`;
            })
            .join("\n\n");

          systemPrompt = `You are a quiz-answering assistant. The user gives you a matching question where items on the left must be matched to options on the right. Each item has a set of dropdown options with values. Return a JSON object with a "matches" field mapping each item's identifier to the correct option VALUE (not the text). No explanation.`;
          userContent = `Question: ${questionText}\n\nItems to match:\n${matchDescriptions}`;

          const matchProperties = {};
          const matchRequired = [];
          for (const m of choices || []) {
            const validValues = m.options.map((o) => o.value);
            matchProperties[m.identifier] = {
              type: "string",
              description: `Matched option value for "${m.text}"`,
              enum: validValues,
            };
            matchRequired.push(m.identifier);
          }

          responseFormat = {
            type: "json_schema",
            json_schema: {
              name: "matching",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  matches: {
                    type: "object",
                    properties: matchProperties,
                    required: matchRequired,
                    additionalProperties: false,
                  },
                },
                required: ["matches"],
                additionalProperties: false,
              },
            },
          };
          break;
        }

        case "multiple_answers_question": {
          const choiceList = choices
            .map((c) => `- [${c.identifier}] ${c.text}`)
            .join("\n");
          systemPrompt =
            "You are a quiz-answering assistant. The user gives you a multiple-select question. Return the correct choice identifiers in the specified JSON format. No explanation.";
          userContent = `Question: ${questionText}\n\nChoices:\n${choiceList}`;

          responseFormat = {
            type: "json_schema",
            json_schema: {
              name: "multiple_answers",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  answers: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of correct choice identifiers",
                  },
                },
                required: ["answers"],
                additionalProperties: false,
              },
            },
          };
          break;
        }

        case "indexed_choice": {
          const choiceList = choices
            .map((c) => `${c.index}. ${c.text}`)
            .join("\n");
          systemPrompt =
            "You are a quiz-answering assistant. The user gives you a multiple-choice question. Return the number of the correct choice in the specified JSON format. No explanation.";
          userContent = `Question: ${questionText}\n\nChoices:\n${choiceList}`;

          responseFormat = {
            type: "json_schema",
            json_schema: {
              name: "indexed_choice",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  answer: {
                    type: "integer",
                    description: "The 1-based index of the correct choice",
                  },
                },
                required: ["answer"],
                additionalProperties: false,
              },
            },
          };
          break;
        }

        default: {
          const choiceList = choices
            .map((c) => `- [${c.identifier}] ${c.text}`)
            .join("\n");
          systemPrompt =
            "You are a quiz-answering assistant. The user gives you a question with choices. Return the identifier of the correct choice in the specified JSON format. No explanation.";
          userContent = `Question: ${questionText}\n\nChoices:\n${choiceList}`;

          responseFormat = {
            type: "json_schema",
            json_schema: {
              name: "single_choice",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  answer: {
                    type: "string",
                    description: "The identifier of the correct choice",
                  },
                },
                required: ["answer"],
                additionalProperties: false,
              },
            },
          };
          break;
        }
      }

      // ── Build messages ──

      const messages = [{ role: "system", content: systemPrompt }];

      if (imageDataUrl) {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: userContent },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        });
      } else {
        messages.push({ role: "user", content: userContent });
      }

      // ── Call OpenRouter (wrapped in try/finally to always release slot) ──

      try {
        const requestBody = { model, messages, temperature: 0, max_tokens: MAX_TOKENS };
        if (responseFormat) {
          requestBody.response_format = responseFormat;
        }

        const openrouterRes = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openrouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.canvastoolkit.com",
            "X-Title": "CanvasToolkit",
          },
          body: JSON.stringify(requestBody),
        });

        if (!openrouterRes.ok) {
          const errText = await openrouterRes.text();
          console.error("OpenRouter error:", errText);
          // Release slot without charging on OpenRouter failure
          await supabaseAdmin.rpc("release_call_slot_no_cost", { p_user_id: user.id });
          return jsonRes({ error: "AI request failed" }, 502);
        }

        const aiData = await openrouterRes.json();
        const rawAnswer =
          aiData.choices?.[0]?.message?.content?.trim() ?? "";

        // ── Parse structured response ──

        let result;
        try {
          const parsed = JSON.parse(rawAnswer);

          switch (questionType) {
            case "essay_question":
            case "short_answer_question":
            case "numerical_question":
              result = parsed.answer ?? rawAnswer;
              break;

            case "fill_in_multiple_blanks_question":
              result = parsed.blanks ?? parsed;
              break;

            case "multiple_dropdowns_question":
              result = parsed.selections ?? parsed;
              break;

            case "matching_question":
              result = parsed.matches ?? parsed;
              break;

            case "multiple_answers_question":
              result = parsed.answers ?? parsed;
              break;

            case "indexed_choice":
              result =
                typeof parsed.answer === "number"
                  ? parsed.answer
                  : parseInt(String(parsed.answer), 10);
              if (isNaN(result)) result = rawAnswer;
              break;

            default:
              result = parsed.answer ?? rawAnswer;
              break;
          }
        } catch {
          console.warn(
            "Structured output parse failed, falling back to raw:",
            rawAnswer
          );

          switch (questionType) {
            case "essay_question":
            case "short_answer_question":
            case "numerical_question":
              result = rawAnswer;
              break;

            case "fill_in_multiple_blanks_question":
            case "multiple_dropdowns_question":
            case "matching_question": {
              const jsonMatch = rawAnswer.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  result = JSON.parse(jsonMatch[0]);
                } catch {
                  result = {};
                }
              } else {
                result = {};
              }
              break;
            }

            case "multiple_answers_question": {
              const arrMatch = rawAnswer.match(/\[[\s\S]*\]/);
              if (arrMatch) {
                try {
                  result = JSON.parse(arrMatch[0]);
                } catch {
                  result = [rawAnswer];
                }
              } else {
                result = [rawAnswer];
              }
              break;
            }

            case "indexed_choice": {
              const num = parseInt(rawAnswer, 10);
              result = isNaN(num) ? rawAnswer : num;
              break;
            }

            default:
              result = rawAnswer;
              break;
          }
        }

        // ── Release slot + deduct actual cost (atomic) ──

        // OpenRouter returns usage.cost in dollar amount in every response
        // Clamp to >= 0 to prevent negative cost from adding credits
        const rawCost = typeof aiData.usage?.cost === "number"
          ? aiData.usage.cost
          : 0.05; // fallback only if OpenRouter doesn't return cost
        const creditCost = Math.max(0, rawCost);

        const { data: newCredits, error: releaseError } = await supabaseAdmin
          .rpc("release_call_slot", { p_user_id: user.id, p_cost: creditCost });
        if (releaseError) console.error("Slot release error:", releaseError);

        return jsonRes({ result, creditsRemaining: newCredits ?? 0, cost: creditCost });

      } catch (openrouterErr) {
        // Unexpected error during OpenRouter call — always release the slot
        console.error("Error during AI call:", openrouterErr);
        await supabaseAdmin.rpc("release_call_slot_no_cost", { p_user_id: user.id }).catch(() => {});
        return jsonRes({ error: "AI request failed" }, 502);
      }

    } catch (err) {
      console.error("Unexpected error:", err);
      return jsonRes({ error: "Internal server error" }, 500);
    }
  },
};
