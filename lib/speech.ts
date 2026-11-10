export function isAudioRecordingSupported() {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function pickVoice(voices: SpeechSynthesisVoice[]) {
  const preferred = voices.find(
    (voice) =>
      voice.lang.startsWith("en") &&
      /female|samantha|google us english|zira|aria|jenny|natural/i.test(
        voice.name,
      ),
  );
  return (
    preferred ??
    voices.find((voice) => voice.lang.startsWith("en-US")) ??
    voices.find((voice) => voice.lang.startsWith("en")) ??
    voices[0] ??
    null
  );
}

export function speakText(
  text: string,
  onEnd: () => void,
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported()) {
    onEnd();
    return null;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 1.04;
  utterance.lang = "en-US";

  const assignVoice = () => {
    const voice = pickVoice(window.speechSynthesis.getVoices());
    if (voice) utterance.voice = voice;
  };

  assignVoice();
  window.speechSynthesis.onvoiceschanged = assignVoice;

  utterance.onend = () => onEnd();
  utterance.onerror = () => onEnd();
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
