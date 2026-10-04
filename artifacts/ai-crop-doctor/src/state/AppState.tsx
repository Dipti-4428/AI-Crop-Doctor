import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initialLanguage, TranslationContext, translate, type Language } from '../i18n';
import type { ChatMessage, Diagnosis } from '../services/types';
import { makeChatMessage } from '../services/chat';

type AppState = {
 language:Language; setLanguage:(language:Language)=>void; farmerMode:boolean; setFarmerMode:(value:boolean)=>void;
 history:Diagnosis[]; saveDiagnosis:(diagnosis:Diagnosis)=>void; removeDiagnosis:(id:string)=>void; clearHistory:()=>void;
 conversation:ChatMessage[]; addMessage:(message:ChatMessage)=>void; resetConversation:()=>void;
};
const StateContext=createContext<AppState|null>(null);
function read<T>(key:string,fallback:T):T { try {const value=localStorage.getItem(key);return value?JSON.parse(value) as T:fallback;}catch{return fallback;} }
export function AppStateProvider({children}:{children:ReactNode}) {
 const [language,setLanguageState]=useState<Language>(initialLanguage);
 const [farmerMode,setFarmerModeState]=useState(()=>read('khet-farmer-mode',false));
 const [history,setHistory]=useState<Diagnosis[]>(()=>read('khet-history',[]));
 const [conversation,setConversation]=useState<ChatMessage[]>(()=>read('khet-conversation',[]));
 useEffect(()=>{localStorage.setItem('khet-language',language);document.documentElement.lang=language;},[language]);
 useEffect(()=>{localStorage.setItem('khet-farmer-mode',JSON.stringify(farmerMode));document.documentElement.classList.toggle('farmer-mode',farmerMode);},[farmerMode]);
 useEffect(()=>{localStorage.setItem('khet-history',JSON.stringify(history));},[history]);
 useEffect(()=>{localStorage.setItem('khet-conversation',JSON.stringify(conversation));},[conversation]);
 const value=useMemo<AppState>(()=>({
  language,setLanguage:setLanguageState,farmerMode,setFarmerMode:setFarmerModeState,history,
  saveDiagnosis:(item)=>setHistory(old=>[item,...old.filter(x=>x.id!==item.id)]),
  removeDiagnosis:(id)=>setHistory(old=>old.filter(x=>x.id!==id)),clearHistory:()=>setHistory([]),
  conversation,addMessage:(item)=>setConversation(old=>[...old,item]),
  resetConversation:()=>setConversation([]),
 }),[language,farmerMode,history,conversation]);
 return <StateContext.Provider value={value}><TranslationContext.Provider value={(key)=>translate(language,key)}>{children}</TranslationContext.Provider></StateContext.Provider>;
}
export function useAppState() {const state=useContext(StateContext);if(!state)throw new Error('AppStateProvider is missing');return state;}
export const newUserMessage=(content:string)=>makeChatMessage('user',content,false);