const base=import.meta.env.VITE_VOICE_API_URL as string|undefined;
const transcriptionBase=import.meta.env.VITE_TRANSCRIBE_API_URL as string|undefined;
export function voiceInputAvailable():boolean { return typeof window!=='undefined' && !!((window as Window & {webkitSpeechRecognition?:unknown;SpeechRecognition?:unknown}).webkitSpeechRecognition || (window as Window & {SpeechRecognition?:unknown}).SpeechRecognition); }
export async function transcribeAudio(audio:Blob,language:string):Promise<string|null> {
 if(!transcriptionBase)return null;
 const form=new FormData();form.append('audio',audio,'speech.webm');form.append('language',language);
 try{const res=await fetch(`${transcriptionBase.replace(/\/+$/,'')}/transcribe`,{method:'POST',body:form});if(!res.ok)return null;const data=await res.json();return typeof data.text==='string'?data.text:null;}catch{return null;}
}
export async function getAdviceAudio(text:string,language:string):Promise<Blob|null> {
 if(!base)return null;
 try{
  const res=await fetch(`${base.replace(/\/+$/,'')}/speak`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,language})});
  if(!res.ok)return null;
  const contentType=res.headers.get('content-type')??'';
  if(!/^audio\/mpeg(?:\s*;|$)/i.test(contentType.trim()))return null;
  const audio=await res.blob();
  return audio.size?audio:null;
 }catch{return null;}
}