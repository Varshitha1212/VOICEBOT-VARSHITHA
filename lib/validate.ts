import type { ChatMessage, ChatRole } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 16;
const MAX_HISTORY_CONTENT = 4000;
const ALLOWED_ROLES: ChatRole[] = ["user", "assistant"];

export function isChatRole(value: unknown): value is ChatRole {
  return value === "user" || value === "assistant";
}

export function sanitizeMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_MESSAGE_LENGTH) return null;
  return trimmed;
}

export function sanitizeHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-MAX_HISTORY_ITEMS)
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      if (!isChatRole(record.role) || typeof record.content !== "string") {
        return [];
      }
      const content = record.content.trim();
      if (!content || content.length > MAX_HISTORY_CONTENT) return [];
      if (!ALLOWED_ROLES.includes(record.role)) return [];
      return [{ role: record.role, content }];
    });
}
