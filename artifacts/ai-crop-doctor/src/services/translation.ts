import { translate, type Language } from '../i18n';

const aiEndpoint = import.meta.env.VITE_AI_API_URL as string | undefined;

const knownPhrases: Array<[RegExp, string]> = [
  [/tomato\s+(early\s+)?blight|early\s+blight/i, 'tomatoEarlyBlight'],
  [/brown\s+circular\s+spots?\s+on\s+leaves|brown\s+spots?\s+on\s+leaves/i, 'apiSymptomSpots'],
  [/yellowing\s+around\s+infected\s+areas/i, 'apiSymptomYellowing'],
  [/remove\s+severely\s+infected\s+leaves/i, 'apiTreatmentRemove'],
  [/avoid\s+overhead\s+watering/i, 'apiPreventionWater'],
];

const nativeScripts: Partial<Record<Language, RegExp>> = {
  hi: /[\u0900-\u097f]/, mr: /[\u0900-\u097f]/, bn: /[\u0980-\u09ff]/,
  gu: /[\u0a80-\u0aff]/, ta: /[\u0b80-\u0bff]/, te: /[\u0c00-\u0c7f]/,
  kn: /[\u0c80-\u0cff]/, ml: /[\u0d00-\u0d7f]/, pa: /[\u0a00-\u0a7f]/,
  or: /[\u0b00-\u0b7f]/, as: /[\u0980-\u09ff]/,
};

export async function translateContent(value: string, language: Language): Promise<{ text: string; translated: boolean }> {
  if (language === 'en' || nativeScripts[language]?.test(value)) return { text: value, translated: true };

  const normalized = value.replace(/[_-]+/g, ' ');
  const known = knownPhrases.find(([pattern]) => pattern.test(normalized));
  if (known) return { text: translate(language, known[1]), translated: true };

  if (aiEndpoint) {
    const base = aiEndpoint.replace(/\/+$/, '').replace(/\/chat$/, '');
    try {
      const response = await fetch(`${base}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value, language, targetLanguage: language }),
      });
      if (response.ok) {
        const data = await response.json();
        const translated = data.translation ?? data.translatedText ?? data.text;
        if (typeof translated === 'string' && translated.trim() && translated !== value) {
          return { text: translated.trim(), translated: true };
        }
      }
    } catch {
      // Never expose unlocalized backend text as a silent fallback.
    }
  }

  return { text: translate(language, 'translationUnavailable'), translated: false };
}

export async function localizeDiagnosisContent(
  content: { disease: string; symptoms: string[]; causes: string[]; treatment: string[]; prevention: string[] },
  language: Language,
) {
  const fields = await Promise.all([
    translateContent(content.disease, language),
    ...content.symptoms.map((value) => translateContent(value, language)),
    ...content.causes.map((value) => translateContent(value, language)),
    ...content.treatment.map((value) => translateContent(value, language)),
    ...content.prevention.map((value) => translateContent(value, language)),
  ]);

  const missing = fields.some((field) => !field.translated);
  if (missing) {
    return {
      disease: 'diagnosis',
      symptoms: [] as string[],
      causes: [] as string[],
      treatment: [] as string[],
      prevention: [] as string[],
      translationMissing: true,
    };
  }

  let index = 1;
  const next = (count: number) => {
    const values = fields.slice(index, index + count).map((field) => field.text);
    index += count;
    return values;
  };
  return {
    disease: fields[0].text,
    symptoms: next(content.symptoms.length),
    causes: next(content.causes.length),
    treatment: next(content.treatment.length),
    prevention: next(content.prevention.length),
    translationMissing: false,
  };
}