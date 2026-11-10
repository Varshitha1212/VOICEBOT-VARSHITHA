export function Waveform({ active }: { active: boolean }) {
  return (
    <div
      className={`flex h-10 items-end justify-center gap-1 ${active ? "opacity-100" : "opacity-35"}`}
      aria-hidden="true"
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <span
          key={index}
          className={`w-[3px] rounded-full bg-lavender ${active ? "animate-wave" : "h-2"}`}
          style={{ animationDelay: `${index * 70}ms`, height: active ? undefined : 8 }}
        />
      ))}
    </div>
  );
}
