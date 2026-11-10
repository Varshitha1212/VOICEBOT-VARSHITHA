export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ConversationState =
  | "ready"
  | "listening"
  | "thinking"
  | "speaking";

export type ChatRequestBody = {
  message: string;
  history?: ChatMessage[];
};

export type ChatSuccessResponse = {
  reply: string;
};

export type ChatErrorResponse = {
  error: string;
};
