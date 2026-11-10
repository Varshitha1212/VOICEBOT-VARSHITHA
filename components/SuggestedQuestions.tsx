import { SUGGESTED_QUESTIONS } from "@/lib/knowledge";

type SuggestedQuestionsProps = {
  disabled?: boolean;
  onSelect: (question: string) => void;
};

export function SuggestedQuestions({
  disabled,
  onSelect,
}: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SUGGESTED_QUESTIONS.map((question) => (
        <button
          key={question}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className="suggested-question"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
