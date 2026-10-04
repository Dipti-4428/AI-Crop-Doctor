import { useRef, useState, type FormEvent } from 'react';
import { Mic, MicOff, Send, Volume2, X } from 'lucide-react';
import { languages, useT } from '../i18n';
import { useAppState } from '../state/AppState';
import { askCropDoctor } from '../services/chat';
import { getAdviceAudio, transcribeAudio } from '../services/voice';
import { newUserMessage } from '../state/AppState';
import type { Diagnosis } from '../services/types';

type SpeechRecognitionResult = { isFinal: boolean; 0?: { transcript?: string } };
type SpeechRecognitionEvent = { results: ArrayLike<SpeechRecognitionResult> };
type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const localeByLanguage: Record<string, string> = {
  en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN',
  ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN',
  or: 'or-IN', as: 'as-IN',
};

export default function VoiceAssistant() {
  const t = useT();
  const { language, history, conversation, addMessage } = useAppState();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [notice, setNotice] = useState('');
  const [speakingId, setSpeakingId] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const diagnosis: Diagnosis | undefined = history[0];

  const speak = async (text: string, id: string) => {
    setSpeakingId(id);
    setNotice('');
    const audioUrl = await getAdviceAudio(text, language);
    if (!audioUrl) {
      setNotice(t('voiceUnavailable'));
      setSpeakingId('');
      return;
    }
    const player = new Audio(audioUrl);
    const release = () => {
      URL.revokeObjectURL(audioUrl);
      setSpeakingId('');
    };
    player.onended = release;
    player.onerror = () => {
      setNotice(t('voiceUnavailable'));
      release();
    };
    await player.play().catch(() => {
      setNotice(t('voiceUnavailable'));
      release();
    });
  };

  const send = async (rawText: string, fromVoice = false) => {
    const text = rawText.trim();
    if (!text || sending) return;
    setDraft('');
    setNotice('');
    setSending(true);
    addMessage(newUserMessage(text));
    const reply = await askCropDoctor(text, diagnosis, language, conversation);
    addMessage(reply);
    setSending(false);
    window.setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    }, 40);
    if (fromVoice && !reply.demo) await speak(reply.content, reply.id);
  };

  const startListening = async () => {
    setNotice('');
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (Recognition) {
      const recognition = new Recognition();
      recognition.lang = localeByLanguage[language] ?? 'en-IN';
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        const transcript = last?.[0]?.transcript?.trim();
        if (last?.isFinal && transcript) void send(transcript, true);
      };
      recognition.onerror = () => {
        setNotice(t('micUnavailable'));
        setRecording(false);
      };
      recognition.onend = () => setRecording(false);
      recognitionRef.current = recognition;
      try {
        recognition.start();
        setRecording(true);
      } catch {
        setNotice(t('micUnavailable'));
      }
      return;
    }

    if (!import.meta.env.VITE_VOICE_API_URL || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setNotice(t('micUnavailable'));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const transcript = await transcribeAudio(new Blob(chunks, { type: recorder.mimeType }), language);
        if (transcript) void send(transcript, true);
        else setNotice(t('micUnavailable'));
      };
      recorder.start();
      setRecording(true);
    } catch {
      setNotice(t('micUnavailable'));
      setRecording(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    setRecording(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send(draft);
  };

  const activeLanguage = languages.find(([code]) => code === language)?.[1] ?? 'English';

  return (
    <div className="fixed bottom-[5.7rem] right-4 z-50 md:bottom-6 md:right-6" lang={language}>
      {open && (
        <section className="glass mb-3 flex max-h-[min(70dvh,520px)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[24px] border border-[#dce4d4] shadow-[0_20px_70px_rgba(24,60,44,.2)]" role="dialog" aria-label={t('chatTitle')} data-testid="panel-voice-assistant">
          <div className="flex items-start justify-between gap-3 border-b border-[#e1e7dc] px-4 py-3">
            <div>
              <h2 className="font-serif text-xl text-[#244733]">{t('chatTitle')}</h2>
              <p className="mt-1 text-xs text-[#718071]">{activeLanguage}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t('close')} data-testid="button-close-assistant" className="grid h-9 w-9 place-items-center rounded-xl text-[#446149] hover:bg-[#e9eedf]">
              <X size={18} />
            </button>
          </div>
          <div ref={messageListRef} className="min-h-32 flex-1 space-y-3 overflow-y-auto px-4 py-3" data-testid="assistant-message-list">
            {!conversation.length && <p className="rounded-2xl bg-[#eef2e5] p-3 text-sm leading-6 text-[#637465]">{t('askMore')}</p>}
            {conversation.slice(-12).map((message) => (
              <div key={message.id} className={`max-w-[92%] rounded-2xl px-3 py-2.5 text-sm leading-5 ${message.role === 'user' ? 'ml-auto bg-[#315c3d] text-white' : 'mr-auto bg-[#eef2e5] text-[#425843]'}`} data-testid={`assistant-message-${message.id}`}>
                <p>{message.role === 'assistant' ? t(message.content) : message.content}</p>
                {message.role === 'assistant' && (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    {message.demo && <span className="text-[10px] opacity-70">{t('chatDemo')}</span>}
                    <button type="button" onClick={() => void speak(t(message.content), message.id)} aria-label={t('listen')} disabled={speakingId === message.id} data-testid={`button-listen-${message.id}`} className="inline-flex items-center gap-1 text-[10px] font-semibold opacity-80 disabled:opacity-50">
                      <Volume2 size={13} />{speakingId === message.id ? t('listening') : t('listen')}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {sending && <p className="w-fit rounded-xl bg-[#eef2e5] px-3 py-2 text-xs text-[#637465]">{t('listening')}</p>}
          </div>
          {notice && <p role="status" data-testid="status-assistant-notice" className="mx-4 mb-2 rounded-xl bg-[#f5edcf] px-3 py-2 text-xs text-[#715d2d]">{notice}</p>}
          <form onSubmit={submit} className="flex items-center gap-2 border-t border-[#e1e7dc] p-3">
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t('chatHint')} aria-label={t('chatHint')} data-testid="input-assistant-message" className="min-w-0 flex-1 rounded-xl bg-[#f2f3e9] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8ea979]" />
            <button type="button" onClick={recording ? stopListening : () => void startListening()} aria-label={recording ? t('listening') : t('speak')} data-testid="button-assistant-microphone" className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${recording ? 'bg-[#f7dfd6] text-[#983f2d]' : 'bg-[#e7eddc] text-[#3e6044]'}`}>
              {recording ? <MicOff size={17} /> : <Mic size={17} />}
            </button>
            <button type="submit" disabled={sending || !draft.trim()} aria-label={t('send')} data-testid="button-assistant-send" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#315c3d] text-white disabled:opacity-45">
              <Send size={17} />
            </button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={t('chatTitle')} title={t('chatTitle')} data-testid="button-open-assistant" className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-[#244d35] text-sm font-bold text-white shadow-[0_12px_34px_rgba(24,60,44,.28)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8da96e] md:flex md:w-auto md:items-center md:gap-2 md:px-5">
        {open ? <X size={19} /> : <Mic size={19} />}
        <span className="hidden md:inline">{t('chatTitle')}</span>
      </button>
    </div>
  );
}