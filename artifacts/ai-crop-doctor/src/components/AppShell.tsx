import { Link, useLocation } from 'wouter';
import type { ReactNode } from 'react';
import { BookOpen, ChartNoAxesCombined, ChevronRight, ClipboardList, Globe2, Leaf, ScanLine, Settings, Sprout } from 'lucide-react';
import { languages, useT } from '../i18n';
import { useAppState } from '../state/AppState';
import VoiceAssistant from './VoiceAssistant';

const items=[
 {href:'/',key:'home',Icon:Leaf},{href:'/detect',key:'detect',Icon:ScanLine},{href:'/dashboard',key:'dashboard',Icon:ChartNoAxesCombined},
 {href:'/history',key:'history',Icon:ClipboardList},{href:'/crops',key:'crops',Icon:BookOpen},{href:'/settings',key:'settings',Icon:Settings},
];
export default function AppShell({children}:{children:ReactNode}) {
 const [location]=useLocation();const t=useT();const {language,setLanguage}=useAppState();
 const languagePicker=<label className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dfe5d8] bg-[#fffdf4]/90 px-3 text-sm text-[#34543c] shadow-sm">
  <span className="sr-only">{t('language')}</span><Globe2 size={16} aria-hidden="true"/>
  <select value={language} onChange={event=>setLanguage(event.target.value as typeof language)} aria-label={t('language')} data-testid="select-global-language" className="max-w-[132px] bg-transparent text-xs font-semibold outline-none">
   {languages.map(([code,label])=><option key={code} value={code}>{label}</option>)}
  </select>
 </label>;
 return <div className="app-shell soft-grain min-h-[100dvh] text-[#21382c]">
  <aside className="hidden md:flex fixed z-20 inset-y-0 left-0 w-[258px] flex-col bg-[#183c2c] text-[#f4f3e8] px-5 py-7">
   <Link href="/" className="flex items-center gap-3 px-2 mb-10 no-underline text-inherit" data-testid="link-brand">
    <span className="w-11 h-11 rounded-2xl bg-[#d4e6a7] text-[#1d422e] grid place-items-center"><Sprout size={25}/></span>
    <span><strong className="font-serif text-[23px] block leading-6">AI Crop Doctor</strong><span className="text-[11px] text-[#c2d0bf]">{t('brandSub')}</span></span>
   </Link>
   <p className="uppercase tracking-[.19em] text-[10px] text-[#91aa94] font-bold px-3 mb-3">{t('navigation')}</p>
   <nav className="space-y-1" aria-label={t('navigation')}>
    {items.map(({href,key,Icon})=>{const active=location===href||(href==='/crops'&&location.startsWith('/crops/'));return <Link key={href} href={href} data-testid={`nav-${key}`} className={`nav-item flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] no-underline ${active?'bg-[#d5e6aa] text-[#1c3f2c] font-bold':'text-[#d3dfd0] hover:bg-white/10'}`}><Icon size={18}/><span>{t(key)}</span>{active&&<ChevronRight size={15} className="ml-auto"/>}</Link>;})}
   </nav>
   <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.06] p-4">
    <div className="w-9 h-9 grid place-items-center rounded-xl bg-[#d5e6aa] text-[#21432f] mb-3"><Leaf size={19}/></div>
    <p className="font-serif text-[18px] leading-5 mb-1">{t('tipTitle')}</p>
    <p className="text-xs leading-5 text-[#c2d0bf]">{t('tip')}</p>
   </div>
  </aside>
  <header className="md:hidden sticky top-0 z-30 px-4 pt-3">
   <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
    <Link href="/" className="flex items-center gap-2 no-underline text-inherit min-w-0" data-testid="link-mobile-brand">
     <span className="w-9 h-9 rounded-xl bg-[#dce9be] text-[#234331] grid place-items-center"><Sprout size={21}/></span>
     <span className="font-serif text-[18px] font-semibold whitespace-nowrap">AI Crop Doctor</span>
    </Link>
    <div className="flex items-center gap-1.5">{languagePicker}<Link href="/settings" className="w-10 h-10 rounded-xl grid place-items-center text-[#33543e] hover:bg-[#e8edda]" aria-label={t('settings')} data-testid="nav-settings-mobile"><Settings size={20}/></Link></div>
   </div>
  </header>
  <main className="md:pl-[258px] min-h-[100dvh]">
   <div className="max-w-[1240px] mx-auto px-4 md:px-9 pt-5 md:pt-7 pb-28 md:pb-12 mobile-safe">
    <div className="hidden md:flex justify-end mb-3">{languagePicker}</div>
    {children}
   </div>
  </main>
  <nav className="md:hidden fixed z-40 bottom-0 inset-x-0 px-3 pb-[max(.7rem,env(safe-area-inset-bottom))] pt-2 bg-[#f5f3e9]/90 backdrop-blur-xl border-t border-[#dfe4d6]" aria-label={t('navigation')}>
   <div className="max-w-lg mx-auto grid grid-cols-5 gap-1">
    {[items[0],items[1],items[2],items[3],items[4]].map(({href,key,Icon})=>{const active=location===href||(href==='/crops'&&location.startsWith('/crops/'));return <Link key={href} href={href} data-testid={`mobile-nav-${key}`} className={`flex flex-col gap-1 items-center justify-center py-2 rounded-xl no-underline text-[10px] font-semibold ${active?'text-[#1e5636]':'text-[#758275]'}`}><Icon size={19}/><span>{t(key)}</span></Link>;})}
   </div>
  </nav>
  <VoiceAssistant/>
 </div>;
}