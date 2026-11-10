import { SYSTEM_PROMPT } from "@/lib/knowledge";
import type { ChatErrorResponse, ChatSuccessResponse } from "@/lib/types";
import { sanitizeHistory, sanitizeMessage } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const GROQ_CHAT_COMPLETIONS_URL =
  "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

function jsonError(message: string, status: number) {
  const body: ChatErrorResponse = { error: message };
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return jsonError(
      "The assistant is not configured yet. Add GROQ_API_KEY on the server.",
      500,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Please send a valid question.", 400);
  }

  if (!payload || typeof payload !== "object") {
    return jsonError("Please send a valid question.", 400);
  }

  const body = payload as Record<string, unknown>;
  const message = sanitizeMessage(body.message);
  if (!message) {
    return jsonError("Ask a question so I can respond.", 400);
  }

  const history = sanitizeHistory(body.history);
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;

  try {
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map((item) => ({
            role: item.role,
            content: item.content,
          })),
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_completion_tokens: 700,
      }),
    });
    const data = (await response.json()) as GroqChatCompletionResponse;

    if (!response.ok) {
      const detail = data.error?.message ?? "No error details were provided.";
      console.error(`Groq request failed (${response.status}): ${detail}`);

      if (response.status === 401 || response.status === 403) {
        return jsonError(
          "Groq rejected the API key. Check GROQ_API_KEY in your local environment file.",
          502,
        );
      }
      if (response.status === 429) {
        return jsonError(
          "Groq is rate-limiting requests. Wait a little and try again.",
          502,
        );
      }
      if (response.status >= 500) {
        return jsonError(
          "Groq is temporarily unavailable. Please try again in a moment.",
          502,
        );
      }
      return jsonError(
        "Groq could not process that request. Check the configured model and try again.",
        502,
      );
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return jsonError("I didn't catch a clear answer. Could you try once more?", 502);
    }

    const success: ChatSuccessResponse = { reply };
    return Response.json(success);
  } catch (error) {
    console.error("Groq request failed", error);
    return jsonError(
      "I couldn't reach Groq just now. Check your connection and try again.",
      502,
    );
  }
}
