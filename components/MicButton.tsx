import type { ConversationState } from "@/lib/types";

type MicButtonProps = {
  state: ConversationState;
  disabled?: boolean;
  onClick: () => void;
};

export function MicButton({ state, disabled, onClick }: MicButtonProps) {
  const listening = state === "listening";
  const thinking = state === "thinking";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || thinking}
      aria-label={listening ? "Stop listening" : "Start listening"}
      className="mic-control"
      data-state={state}
    >
      <span className="mic-control__ring" aria-hidden="true" />
      <span>
        {thinking ? (
          <span
            className="block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"
            aria-hidden="true"
          />
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mic-control__icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3.5a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0v-6a3 3 0 0 0-3-3Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
