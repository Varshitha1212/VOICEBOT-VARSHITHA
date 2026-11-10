import type { ConversationState } from "@/lib/types";

const LABELS: Record<ConversationState, string> = {
  ready: "Ready",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

type StatusBadgeProps = {
  state: ConversationState;
  hasError?: boolean;
};

export function StatusBadge({ state, hasError = false }: StatusBadgeProps) {
  return (
    <p
      className="status-badge"
      data-state={state}
      data-error={hasError}
      role="status"
      aria-live="polite"
    >
      <span className="status-dot" aria-hidden="true" />
      {hasError ? "Something went wrong" : LABELS[state]}
    </p>
  );
}
