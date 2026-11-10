# Meet Varshitha

A personal AI voice interview assistant that answers as **Varshitha Malladi**. Visitors can speak or type questions; replies are generated with Groq from her real background and then read aloud in the browser.

## Features

- Voice questions captured with the browser MediaRecorder API and transcribed by Groq Whisper, plus a text fallback
- Live transcription, chat history, and session continuity
- Groq answers generated on a secure Next.js API route
- Spoken responses, stop, and replay
- States: Ready, Listening, Thinking, Speaking
- Custom layered SVG pixel mascot with state-driven idle, listening, thinking, speaking, and error visuals
- Dark ambient background, responsive layout, and reduced-motion support
- Suggested interview starters and a new-conversation reset
- Error handling for missing API keys, microphone permissions, empty input, and unsupported browsers

The mascot animations follow the existing speech-recognition and speech-synthesis states. The browser Web Speech APIs used for recognition and playback do not expose an audio-amplitude stream to this UI, so the visualizer is state-driven rather than an audio-level meter.

## Tech stack

- Next.js App Router, TypeScript, Tailwind CSS
- Groq Chat Completions API (server-side only)
- Browser Web Speech API for recognition and synthesis

## Setup

1. Install [Node.js 20.9+](https://nodejs.org/).
2. Clone this repository and install dependencies:

```bash
npm install
```

3. Copy the environment template and add your Groq key:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

4. Create a key in the [Groq Console](https://console.groq.com/keys) and set it in `.env.local`:

```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

The API key stays on the server. It is never sent to the browser.

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Chrome or Edge work best for voice input. Microphone access usually requires localhost or HTTPS.

## Production build

```bash
npm run build
npm start
```

## Deploy

Deploy as a standard Next.js app (Vercel, Netlify, or any Node host).

1. Set `GROQ_API_KEY` in the host environment. Optionally set `GROQ_MODEL`.
2. Do not commit `.env.local` or any real secrets.
3. After deploy, open the HTTPS URL and allow the microphone if you want voice input.

### Vercel

```bash
npx vercel
```

Then add `GROQ_API_KEY` in the Vercel project settings.

If a model name is unavailable for your key, set `GROQ_MODEL` to an active model enabled for your Groq account.
