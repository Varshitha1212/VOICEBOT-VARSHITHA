import type { ChatMessage } from "@/lib/types";

type ChatTranscriptProps = {
  messages: ChatMessage[];
  liveTranscript: string;
  error: string | null;
};

export function ChatTranscript({
  messages,
  liveTranscript,
  error,
}: ChatTranscriptProps) {
  if (!messages.length && !liveTranscript && !error) {
    return (
      <p className="transcript-empty">
        Ask me about my work, how I think, or what I&apos;m hoping to grow into.
        Speak, or type if you prefer.
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {messages.map((message, index) => (
        <article
          key={`${message.role}-${index}`}
          className={`transcript-message transcript-message--${message.role}`}
        >
          <p className="transcript-speaker">
            {message.role === "user" ? "You" : "Varshitha"}
          </p>
          <p className="transcript-copy">{message.content}</p>
        </article>
      ))}

      {liveTranscript ? (
        <article className="transcript-message transcript-message--user transcript-message--live">
          <p className="transcript-speaker">
            Listening
          </p>
          <p className="transcript-copy">{liveTranscript}</p>
        </article>
      ) : null}

      {error ? (
        <p className="transcript-error" role="alert">{error}</p>
      ) : null}
    </div>
  );
}
