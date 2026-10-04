---
name: AI Crop Doctor requirements
description: User-stated language, persistence, and honesty requirements for the farmer-facing crop helper.
---

- Support English, Hindi, Marathi, Bengali, Gujarati, Tamil, Telugu, Kannada, Malayalam, Punjabi, Odia, and Assamese with app-wide localization.
- Keep scan history, selected language, Farmer Mode, and chat on the user's device in this prototype.
- Never present example output as a real crop diagnosis. Label examples clearly and show an explicit unavailable state when the prediction service is missing.
- Do not display untranslated English model output as if it were localized guidance; if a safe translation is unavailable, show a localized warning and withhold the diagnosis and treatment details.
- Use browser speech recognition where available for voice input. Do not use browser SpeechSynthesis/Web Speech for TTS; use the configured voice service or show a localized unavailable message.

**Why:** The target audience is Indian farmers, and incorrect or inaccessible crop-treatment guidance can lead to real-world harm.

**How to apply:** Keep the language, data-storage, demo-labeling, and voice-service constraints in place when changing this product or connecting its model APIs.