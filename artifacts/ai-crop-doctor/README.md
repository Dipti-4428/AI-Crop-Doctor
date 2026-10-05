# AI Crop Doctor

A mobile-first crop-health helper for Indian farmers. The interface supports English, Hindi, Marathi, Bengali, Gujarati, Tamil, Telugu, Kannada, Malayalam, Punjabi, Odia, and Assamese.

## Run and verify

```sh
pnpm --filter @workspace/ai-crop-doctor run dev
pnpm --filter @workspace/ai-crop-doctor run typecheck
pnpm --filter @workspace/ai-crop-doctor run build
```

## Optional service endpoints

The app works without a model service. In that case, scans and chat use clearly labeled example responses; they are not real diagnoses.

- `VITE_API_BASE_URL`: API origin/base path. The app sends a multipart `POST /predict` with `image` and optional `crop`, `symptoms`, and `language` fields. JSON can contain `disease`, `confidence`, `severity`, and arrays for `symptoms`, `causes`, `treatment`, and `prevention`.
- `VITE_AI_API_URL`: AI service base path. Chat uses `POST /chat`; fallback translation uses `POST /translate` with `text` and `language`. Chat responses may use `reply` or `response`; translation responses may use `translation`, `translatedText`, or `text`.
- `VITE_VOICE_API_URL`: speech-output service base path. It uses `POST /speak` with JSON `{ "text": "...", "language": "..." }` and expects audio bytes.
- `VITE_TRANSCRIBE_API_URL` (optional): separate speech-input service base path. It uses multipart `POST /transcribe` with `audio` and `language` and expects `{ "text": "..." }`.

For local development, set `VITE_VOICE_API_URL=http://localhost:8000`. The voice endpoint is called by the browser, so the FastAPI service must be running on the same machine as the browser and allow the app's origin through CORS. For a published app, use a network-reachable HTTPS base URL instead.

If an API result cannot be safely translated, the app hides its untranslated diagnosis and treatment text, lowers the displayed confidence, and shows a localized warning instead.

Language choice, Farmer Mode, scan history, and chat are stored in this browser on this device. They are not synced between devices.