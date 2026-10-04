import type { ChatMessage, Diagnosis } from './types';
import { languages, type Language } from '../i18n';
import { translateContent } from './translation';
const endpoint=import.meta.env.VITE_AI_API_URL as string|undefined;
const make=(role:ChatMessage['role'],content:string,demo:boolean):ChatMessage=>({id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,role,content,date:new Date().toISOString(),demo});
export async function askCropDoctor(message:string,diagnosis:Diagnosis|undefined,language:string,history:ChatMessage[]=[]):Promise<ChatMessage> {
 if(endpoint) try {
   const base=endpoint.replace(/\/+$/,'');
   const chatUrl=base.endsWith('/chat')?base:`${base}/chat`;
   const languageName=languages.find(([code])=>code===language)?.[1]??'English';
   const context=history.filter(item=>item.role==='user'||!item.demo).map(({role,content})=>({role,content}));
   const res=await fetch(chatUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,diagnosis:diagnosis??null,language,responseLanguage:languageName,systemInstruction:`Reply entirely in ${languageName}. Use the supplied conversation and diagnosis as context.`,conversation:context})});
   if(res.ok){const data=await res.json();const text=String(data.reply??data.response??'');if(text){const localized=await translateContent(text,language as Language);return make('assistant',localized.translated?localized.text:'chatUnavailable',!localized.translated);}}
 }catch{/* show transparent example instead */}
 return make('assistant','chatUnavailable',true);
}
export { make as makeChatMessage };