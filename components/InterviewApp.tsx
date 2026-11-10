"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { ChatTranscript } from "@/components/ChatTranscript";
import { MicButton } from "@/components/MicButton";
import { PixelMascot } from "@/components/PixelMascot";
import { StatusBadge } from "@/components/StatusBadge";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { Waveform } from "@/components/Waveform";
import {
  isAudioRecordingSupported,
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
} from "@/lib/speech";
import type { ChatMessage, ConversationState } from "@/lib/types";

export function InterviewApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<ConversationState>("ready");
  const [error, setError] = useState<string | null>(null);
  const audioRecordingSupported = useSyncExternalStore(
    () => () => undefined,
    isAudioRecordingSupported,
    () => true,
  );
  const ttsSupported = useSyncExternalStore(
    () => () => undefined,
    isSpeechSynthesisSupported,
    () => true,
  );
  const [lastReply, setLastReply] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const discardRecordingRef = useRef(false);
  const stateRef = useRef<ConversationState>("ready");
  const messagesRef = useRef<ChatMessage[]>([]);
  const askingRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      discardRecordingRef.current = true;
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      stopSpeaking();
    };
  }, []);

  const askVarshitha = useCallback(async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || askingRef.current) return;

    askingRef.current = true;
    setError(null);
    setLiveTranscript("");
    setState("thinking");

    const nextHistory = [...messagesRef.current, { role: "user" as const, content: question }];
    setMessages(nextHistory);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          history: messagesRef.current,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "I couldn't get an answer just now.");
      }

      const reply = data.reply;
      setLastReply(reply);
      setMessages([...nextHistory, { role: "assistant", content: reply }]);

      if (!isSpeechSynthesisSupported()) {
        setState("ready");
        return;
      }

      setState("speaking");
      speakText(reply, () => {
        if (stateRef.current === "speaking") setState("ready");
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.";
      setError(message);
      setState("ready");
    } finally {
      askingRef.current = false;
    }
  }, []);

  const transcribeRecording = useCallback(
    async (audio: Blob) => {
    if (!audio.size) {
      setError("I didn't receive any audio. Please try recording again.");
      setState("ready");
      return;
    }

    setState("thinking");
    const extension = audio.type.includes("mp4")
      ? "m4a"
      : audio.type.includes("ogg")
        ? "ogg"
        : "webm";
    const formData = new FormData();
    formData.append("file", audio, `question.${extension}`);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        transcript?: string;
        error?: string;
      };
      if (!response.ok || !data.transcript?.trim()) {
        throw new Error(
          data.error || "I couldn't make out any speech. Please try again.",
        );
      }

      const transcript = data.transcript.trim();
      setLiveTranscript(transcript);
      await askVarshitha(transcript);
    } catch (transcriptionError) {
      const message =
        transcriptionError instanceof Error
          ? transcriptionError.message
          : "I couldn't transcribe that recording. Please try again.";
      setError(message);
      setState("ready");
    }
    },
    [askVarshitha],
  );

  const stopListening = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") recorder.stop();
  }, []);

  const startListening = useCallback(async () => {
    if (!isAudioRecordingSupported()) {
    setError(
      "Voice recording isn't supported in this browser. You can still type a question.",
    );
    return;
    }

    stopSpeaking();
    setError(null);
    setLiveTranscript("");
    discardRecordingRef.current = false;
    setState("thinking");

    try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (discardRecordingRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    streamRef.current = stream;
    audioChunksRef.current = [];

    const preferredMimeType = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
    ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
    const recorder = preferredMimeType
      ? new MediaRecorder(stream, { mimeType: preferredMimeType })
      : new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size) audioChunksRef.current.push(event.data);
    };
    recorder.onerror = () => {
      discardRecordingRef.current = true;
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
      setError("The microphone recording failed. Please try again.");
      setState("ready");
    };
    recorder.onstop = () => {
      const audio = new Blob(audioChunksRef.current, {
        type: recorder.mimeType || audioChunksRef.current[0]?.type,
      });
      const shouldDiscard = discardRecordingRef.current;
      audioChunksRef.current = [];
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;

      if (!shouldDiscard) void transcribeRecording(audio);
    };

    recorder.start();
    setState("listening");
    } catch (recordingError) {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (discardRecordingRef.current) return;
    const name =
      recordingError instanceof DOMException ? recordingError.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      setError("Microphone access is blocked. Allow it in your browser, then try again.");
    } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      setError("No microphone was found. Connect a microphone or type your question.");
    } else if (name === "NotReadableError" || name === "TrackStartError") {
      setError("The microphone is busy in another app. Close it and try again.");
    } else {
      setError("I couldn't start microphone recording. Check your browser permissions and try again.");
    }
    setState("ready");
    }
  }, [transcribeRecording]);

  const handleMicClick = () => {
    if (state === "listening") {
      stopListening();
      return;
    }
    if (state === "speaking") {
      stopSpeaking();
      setState("ready");
    }
    void startListening();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = draft.trim();
    if (!question) {
      setError("Ask a question so I can respond.");
      return;
    }
    setDraft("");
    if (state === "listening") {
      discardRecordingRef.current = true;
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
    }
    stopSpeaking();
    void askVarshitha(question);
  };

  const handleNewConversation = () => {
    discardRecordingRef.current = true;
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    stopSpeaking();
    askingRef.current = false;
    setMessages([]);
    setLiveTranscript("");
    setDraft("");
    setLastReply("");
    setError(null);
    setState("ready");
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setState("ready");
  };

  const handleReplay = () => {
    if (!lastReply) return;
    stopSpeaking();
    setState("speaking");
    speakText(lastReply, () => {
      if (stateRef.current === "speaking") setState("ready");
    });
  };

  const busy = state === "thinking" || state === "listening";

  return (
    <div className="app-shell">
      <div className="ambient-backdrop" aria-hidden="true" />
      <header className="app-header">
        <Link className="brand-lockup" href="/" aria-label="Varshitha AI home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>
            <span className="brand-name">VARSHITHA</span>
            <span className="brand-caption">PERSONAL AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-[11px] tracking-[0.16em] uppercase text-white/35 sm:inline">
            Voice interface
          </span>
          <button
            type="button"
            onClick={handleNewConversation}
            className="header-action"
          >
            New conversation
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="hero" aria-labelledby="assistant-title">
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            A personal conversation
          </p>
          <h1 id="assistant-title">Meet Varshitha</h1>
          <p className="hero-intro">
            Curious about my work, ideas, or what I&apos;m building next?
          </p>

          <div className="mascot-stage">
            <PixelMascot state={state} hasError={Boolean(error)} />
          </div>

          <div className="control-panel">
            <StatusBadge state={state} hasError={Boolean(error)} />
            <MicButton
              state={state}
              disabled={!audioRecordingSupported && state !== "listening"}
              onClick={handleMicClick}
            />
            <Waveform active={state === "listening" || state === "speaking"} />
            {!audioRecordingSupported ? (
              <p className="mic-hint">
                This browser does not support microphone recording. You can
                still type below.
              </p>
            ) : (
              <p className="mic-hint">
                {state === "listening"
                  ? "Listening. Tap the microphone when you are done."
                  : "Tap the microphone to speak."}
              </p>
            )}
          </div>
        </section>

        <section className="conversation-panel" aria-label="Conversation">
          <header className="conversation-header">
            <div>
              <h2 className="conversation-title">Conversation</h2>
              <p className="conversation-caption">
                Ask about my work, projects, and perspective.
              </p>
            </div>
          </header>

          <div className="conversation-content">
            <ChatTranscript
              messages={messages}
              liveTranscript={liveTranscript}
              error={error}
            />

            {lastReply ? (
              <div className="conversation-actions">
                <button
                  type="button"
                  onClick={handleStopSpeaking}
                  disabled={state !== "speaking"}
                  className="quiet-button"
                >
                  Stop speaking
                </button>
                <button
                  type="button"
                  onClick={handleReplay}
                  disabled={!ttsSupported || state === "thinking"}
                  className="quiet-button"
                >
                  Replay answer
                </button>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="question-form">
              <label htmlFor="question" className="sr-only">
                Type a question
              </label>
              <textarea
                id="question"
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Or type a question…"
                className="question-input"
              />
              <button type="submit" disabled={busy} className="send-button">
                Send
              </button>
            </form>

            <section className="suggested-block" aria-label="Suggested questions">
              <p className="suggested-heading">Start with one of these</p>
              <SuggestedQuestions
                disabled={busy}
                onSelect={(question) => void askVarshitha(question)}
              />
            </section>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        Varshitha Malladi <span aria-hidden="true">·</span> An AI-powered conversation
      </footer>
    </div>
  );
}
