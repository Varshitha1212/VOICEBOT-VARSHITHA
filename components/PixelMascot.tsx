import type { ConversationState } from "@/lib/types";

type PixelMascotProps = {
  state: ConversationState;
  hasError: boolean;
};

const STATE_LABELS: Record<ConversationState, string> = {
  ready: "resting",
  listening: "listening",
  thinking: "thinking",
  speaking: "speaking",
};

export function PixelMascot({ state, hasError }: PixelMascotProps) {
  const visualState = hasError ? "error" : state;

  return (
    <div
      className={`mascot-scene mascot-scene--${visualState}`}
      role="img"
      aria-label={`Pixel assistant ${hasError ? "showing an error" : STATE_LABELS[state]}`}
    >
      <span className="mascot-orbit mascot-orbit--outer" aria-hidden="true" />
      <span className="mascot-orbit mascot-orbit--inner" aria-hidden="true" />
      <span className="mascot-particle mascot-particle--one" aria-hidden="true" />
      <span className="mascot-particle mascot-particle--two" aria-hidden="true" />
      <span className="mascot-particle mascot-particle--three" aria-hidden="true" />

      <svg
        className="mascot-art"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mascot-shell" x1="58" y1="45" x2="174" y2="183">
            <stop stopColor="#30374C" />
            <stop offset="0.52" stopColor="#171C2B" />
            <stop offset="1" stopColor="#0E1220" />
          </linearGradient>
          <linearGradient id="mascot-face" x1="72" y1="67" x2="162" y2="132">
            <stop stopColor="#101B30" />
            <stop offset="1" stopColor="#0A1020" />
          </linearGradient>
          <linearGradient id="mascot-eye" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#B9A2FF" />
            <stop offset="1" stopColor="#60D9FF" />
          </linearGradient>
          <filter
            id="mascot-glow"
            x="35"
            y="36"
            width="170"
            height="176"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <ellipse
          cx="120"
          cy="190"
          rx="49"
          ry="8"
          fill="#7C5CFF"
          opacity=".3"
          filter="url(#mascot-glow)"
        />
        <path
          d="M75 41h90v10h12v14h9v72h-9v14h-14v11H77v-9H63v-13h-9V65h9V51h12V41Z"
          fill="url(#mascot-shell)"
          stroke="#65708B"
          strokeOpacity=".52"
          strokeWidth="2"
        />
        <path d="M75 41h19v7H70v8h-8V65h-8V65h9V51h12V41Z" fill="#7782A0" opacity=".42" />
        <path d="M165 41h-19v7h24v8h8V65h8V65h-9V51h-12V41Z" fill="#7782A0" opacity=".25" />

        <path d="M43 83h11v39H43zM186 83h11v39h-11z" fill="#222A3D" stroke="#606C8B" />
        <path className="mascot-side-light" d="M47 91h4v22h-4zM189 91h4v22h-4z" fill="#72DFFF" />
        <path d="M56 72h8v8h-8zM176 72h8v8h-8z" fill="#8B73FF" />
        <rect x="68" y="61" width="104" height="77" rx="8" fill="#090F1D" stroke="#74809E" strokeOpacity=".65" strokeWidth="2" />
        <rect x="74" y="67" width="92" height="65" rx="5" fill="url(#mascot-face)" />
        <path d="M80 74h80v2H80z" fill="#8D8AFF" opacity=".2" />
        <rect className="mascot-eye" x="88" y="91" width="13" height="19" rx="2" fill="url(#mascot-eye)" />
        <rect className="mascot-eye" x="139" y="91" width="13" height="19" rx="2" fill="url(#mascot-eye)" />
        <path className="mascot-mouth" d="M108 116h24v4h-24z" fill="#82DFFF" />
        <g className="mascot-equalizer" fill="url(#mascot-eye)">
          <rect x="102" y="113" width="4" height="10" rx="1" />
          <rect x="110" y="109" width="4" height="18" rx="1" />
          <rect x="118" y="105" width="4" height="26" rx="1" />
          <rect x="126" y="110" width="4" height="16" rx="1" />
          <rect x="134" y="114" width="4" height="8" rx="1" />
        </g>

        <path d="M90 153h60v9h13v13h-9v10H86v-10h-9v-13h13v-9Z" fill="url(#mascot-shell)" stroke="#58637F" strokeWidth="2" />
        <path d="M104 163h32v5h-32zM111 173h18v5h-18z" fill="#8F79FF" />
        <path d="M58 148h8v8h-8zM174 148h8v8h-8z" fill="#65DFFF" />
        <path d="M71 193h98v5H71z" fill="#6E5BCE" opacity=".62" />
        <path className="mascot-sparkle" d="M34 57h5v5h-5zM197 143h5v5h-5zM52 175h4v4h-4zM185 59h4v4h-4z" fill="#A99AFF" />
      </svg>

      <span className="mascot-processing" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
