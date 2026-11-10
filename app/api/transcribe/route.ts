import type { ChatErrorResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const GROQ_TRANSCRIPTIONS_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";
const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

type GroqTranscriptionResponse = {
  text?: string;
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
      "Voice transcription is not configured. Add GROQ_API_KEY on the server.",
      500,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Please record your question and try again.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) {
    return jsonError("No audio recording was received. Please try again.", 400);
  }
  if (file.size > MAX_AUDIO_SIZE) {
    return jsonError(
      "That recording is too large. Keep voice questions under a few minutes.",
      413,
    );
  }

  const payload = new FormData();
  payload.append("file", file, file.name || "question.webm");
  payload.append("model", "whisper-large-v3");
  payload.append("language", "en");
  payload.append("response_format", "json");

  try {
    const response = await fetch(GROQ_TRANSCRIPTIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: payload,
    });
    const data = (await response.json()) as GroqTranscriptionResponse;

    if (!response.ok) {
      const detail = data.error?.message ?? "No error details were provided.";
      console.error(`Groq transcription failed (${response.status}): ${detail}`);

      if (response.status === 401 || response.status === 403) {
        return jsonError(
          "Groq rejected the API key. Check GROQ_API_KEY in your local environment file.",
          502,
        );
      }
      if (response.status === 429) {
        return jsonError(
          "Groq is rate-limiting voice requests. Wait a little and try again.",
          502,
        );
      }
      return jsonError(
        "I couldn't transcribe that audio. Please try recording again.",
        502,
      );
    }

    return Response.json({ transcript: data.text?.trim() ?? "" });
  } catch (error) {
    console.error("Groq transcription request failed", error);
    return jsonError(
      "I couldn't reach the transcription service. Check your connection and try again.",
      502,
    );
  }
}
