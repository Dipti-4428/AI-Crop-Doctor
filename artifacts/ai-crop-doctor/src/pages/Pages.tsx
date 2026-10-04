import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { ArrowDownRight, ArrowLeft, ArrowRight, AudioLines, Camera, Check, ChevronDown, CircleHelp, CloudSun, Flower2, ImagePlus, Leaf, Mic, MicOff, Search, Send, ShieldCheck, Sprout, Trash2, Upload, Volume2, Wheat, X, Cherry, Flame } from 'lucide-react';
import { languages, useT } from '../i18n';
import { useAppState, newUserMessage } from '../state/AppState';
import { predictCrop } from '../services/prediction';
import { askCropDoctor } from '../services/chat';
import { getAdviceAudio, transcribeAudio } from '../services/voice';
import DiagnosisCard from '../components/DiagnosisCard';

const crops=[
 {id:'rice',group:'grains',tone:'#dce9c7',desc:'riceDesc',Icon:Wheat},
 {id:'wheat',group:'grains',tone:'#efe0bc',desc:'wheatDesc',Icon:Flower2},
 {id:'cotton',group:'all',tone:'#e7e4d2',desc:'cottonDesc',Icon:Flower2},
 {id:'tomato',group:'vegetables',tone:'#f0d9c9',desc:'tomatoDesc',Icon:Cherry},
 {id:'chilli',group:'vegetables',tone:'#e7dfc5',desc:'chilliDesc',Icon:Flame},
 {id:'mango',group:'fruits',tone:'#efdfae',desc:'mangoDesc',Icon:Cherry},
 {id:'chickpea',group:'pulses',tone:'#e8ddc6',desc:'chickpeaDesc',Icon:CircleHelp},
 {id:'banana',group:'fruits',tone:'#eee5bd',desc:'bananaDesc',Icon:Leaf},
];
const cropKey=(id:string)=>`crop${id[0]?.toUpperCase()}${id.slice(1)}`;
function PageHeading({eyebrow,title,sub}:{eyebrow?:string;title:string;sub?:string}) {
 return <div className="mb-7 md:mb-9 page-enter">{eyebrow&&<p className="text-[11px] font-bold tracking-[.2em] uppercase text-[#788875] mb-2">{eyebrow}</p>}<h1 className="font-serif text-[34px] md:text-[44px] leading-[1.04] tracking-[-.025em] max-w-3xl" data-testid="text-page-title">{title}</h1>{sub&&<p className="text-sm md:text-base leading-6 text-[#68786a] mt-3 max-w-2xl">{sub}</p>}</div>;
}
function cropTitle(id:string,t:(s:string)=>string) {return t(cropKey(id));}

export function HomePage() {
 const t=useT();const {history,farmerMode}=useAppState();
 const scans=history.length;const checks=history.slice(0,3);
 return <div className="page-enter">
  <div className="flex items-center justify-between mb-6">
   <div><p className="text-sm font-semibold text-[#647767]">{t('welcome')}</p><p className="text-xs text-[#859184] mt-1">{t('morning')}</p></div>
   <div className="hidden sm:flex items-center gap-2 rounded-full bg-[#e7eddc] px-3 py-2 text-xs text-[#476047]"><CloudSun size={17}/>{t('today')}</div>
  </div>
  <section className="relative overflow-hidden rounded-[30px] bg-[#dce8c7] min-h-[340px] md:min-h-[360px] flex items-center px-6 py-9 sm:px-10 md:px-12">
   <div className="absolute right-[-10px] top-[-54px] w-[270px] h-[270px] md:w-[390px] md:h-[390px] rounded-full border border-[#8ba376]/30 opacity-80"></div>
   <div className="absolute right-[5%] top-[14%] w-[220px] h-[220px] md:w-[310px] md:h-[310px] rounded-full border border-[#8ba376]/30"></div>
   <div className="absolute right-[10%] top-[24%] w-[170px] h-[170px] md:w-[230px] md:h-[230px] rounded-full border border-[#8ba376]/30"></div>
   <div className="absolute right-[10%] bottom-[-55px] w-[220px] h-[250px] md:w-[310px] md:h-[320px] rounded-[100%_0_0_0] bg-gradient-to-br from-[#6c8957]/80 to-[#315e40] rotate-[-26deg] shadow-2xl opacity-90"></div>
   <div className="absolute right-[17%] bottom-[-43px] w-[150px] h-[230px] md:w-[220px] md:h-[280px] rounded-[100%_0_0_0] bg-gradient-to-br from-[#adc88a] to-[#597a4c] rotate-[24deg]"></div>
   <div className="absolute right-[32%] bottom-[-51px] w-[120px] h-[210px] md:w-[155px] md:h-[250px] rounded-[100%_0_0_0] bg-gradient-to-br from-[#bfd19d] to-[#668552] rotate-[-4deg]"></div>
   <div className="relative z-10 max-w-[520px]">
    <span className="inline-flex items-center gap-2 rounded-full bg-[#f8faef]/75 px-3 py-1.5 text-xs font-bold text-[#4d6948] mb-4"><span className="w-1.5 h-1.5 rounded-full bg-[#709052]"></span>{t('brandSub')}</span>
    <h1 className={`font-serif leading-[1.03] tracking-[-.03em] text-[#204331] ${farmerMode?'text-[37px] md:text-[54px]':'text-[34px] sm:text-[43px] md:text-[56px]'}`} data-testid="text-home-title">{t('homeTitle')}</h1>
    <p className="text-sm md:text-base leading-6 text-[#536c56] mt-4 max-w-md">{t('homeSub')}</p>
    <Link href="/detect" data-testid="button-start-scan" className="mt-6 inline-flex items-center gap-3 bg-[#254d35] hover:bg-[#1a3e2a] text-[#f5f3e8] px-5 py-3.5 rounded-2xl font-bold text-sm no-underline shadow-lg shadow-[#234c35]/15 transition-colors"><ScanLabel/>{t('scanNow')}<ArrowRight size={17}/></Link>
   </div>
   <span className="absolute bottom-5 right-6 text-xs text-[#496448] hidden sm:block">{t('demoData')}</span>
  </section>
  <section className="grid sm:grid-cols-[1.4fr_.9fr] gap-5 mt-6">
   <div className="glass rounded-[24px] p-5 sm:p-6">
    <div className="flex justify-between items-start mb-4"><div><p className="text-xs text-[#7b887b]">{t('recent')}</p><h2 className="font-serif text-[23px] mt-1">{t('recent')}</h2></div><Link href="/history" className="text-xs text-[#456348] font-bold no-underline flex items-center gap-1" data-testid="link-see-history">{t('seeAll')}<ArrowRight size={14}/></Link></div>
    {checks.length? <div className="space-y-3">{checks.map(item=><DiagnosisCard item={item} key={item.id} compact/>)}</div>:
     <div className="rounded-2xl bg-[#f4f4e8] p-5 flex gap-4 items-center" data-testid="empty-home-history"><span className="w-12 h-12 rounded-2xl bg-[#e3ebd4] text-[#527048] grid place-items-center"><Sprout size={24}/></span><div><p className="font-semibold">{t('noScans')}</p><p className="text-sm text-[#7a8878] mt-1">{t('noScansSub')}</p></div></div>}
   </div>
   <div className="rounded-[24px] bg-[#244b35] text-[#f2f2e4] p-5 sm:p-6 flex flex-col justify-between overflow-hidden relative">
    <div className="absolute w-36 h-36 rounded-full border border-white/10 right-[-30px] top-[-30px]"></div>
    <div className="relative"><div className="w-10 h-10 rounded-xl bg-[#d3e5a8] text-[#264a34] grid place-items-center mb-5"><Leaf size={21}/></div><p className="text-xs text-[#b3c6a9]">{t('scans')}</p><p className="font-serif text-[48px] mt-1" data-testid="text-scan-count">{scans.toString().padStart(2,'0')}</p></div>
    <Link href="/dashboard" className="relative mt-5 border-t border-white/15 pt-4 flex items-center justify-between text-sm text-[#dae5d0] no-underline" data-testid="link-dashboard-summary"><span>{t('dashboard')}</span><ArrowRight size={17}/></Link>
   </div>
  </section>
  <section className="mt-7">
   <div className="flex items-end justify-between mb-4"><div><p className="text-xs text-[#7c897b]">{t('cropsSub')}</p><h2 className="font-serif text-[25px] mt-1">{t('crops')}</h2></div><Link href="/crops" className="text-xs font-bold text-[#456348] no-underline" data-testid="link-crop-guide">{t('seeAll')}</Link></div>
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{crops.slice(0,4).map(c=><Link href={`/crops/${c.id}`} key={c.id} data-testid={`crop-quick-${c.id}`} className="glass rounded-2xl p-4 no-underline text-[#264432] hover:-translate-y-1 transition-transform"><div className="w-10 h-10 rounded-xl grid place-items-center text-xl mb-3 text-[#57764c]" style={{background:c.tone}}><c.Icon size={22}/></div><span className="font-semibold text-sm">{cropTitle(c.id,t)}</span><span className="block text-[11px] text-[#778578] mt-1">{t(c.group)}</span></Link>)}</div>
  </section>
 </div>;
}
function ScanLabel(){return <span className="w-7 h-7 rounded-lg bg-white/10 grid place-items-center"><Leaf size={16}/></span>;}

export function DetectPage() {
 const t=useT();const {language,saveDiagnosis}=useAppState();
 const [file,setFile]=useState<File|null>(null);const [preview,setPreview]=useState('');const [crop,setCrop]=useState('rice');const [symptoms,setSymptoms]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [,navigate]=useLocation();const [recording,setRecording]=useState(false);
 const recorder=useRef<MediaRecorder|null>(null);const chunks=useRef<Blob[]>([]);const fileRef=useRef<HTMLInputElement>(null);
 const setImage=(f?:File)=>{if(!f)return;const validType=['image/jpeg','image/png','image/webp'].includes(f.type)||/\.(jpe?g|png|webp)$/i.test(f.name);if(!validType){setError(t('invalidPhotoFormat'));return;}if(preview)URL.revokeObjectURL(preview);setFile(f);setPreview(URL.createObjectURL(f));setError('');};
 const previewData=(f:File)=>new Promise<string>(resolve=>{const image=new Image();const url=URL.createObjectURL(f);image.onload=()=>{const scale=Math.min(1,900/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);const context=canvas.getContext('2d');if(!context){URL.revokeObjectURL(url);resolve('');return;}context.drawImage(image,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);resolve(canvas.toDataURL('image/jpeg',.78));};image.onerror=()=>{URL.revokeObjectURL(url);resolve('');};image.src=url;});
 const submit=async()=>{if(!file){setError(t('photoRequired'));return;}setLoading(true);setError('');try{const dataUrl=await previewData(file);const result=await predictCrop(file,crop||'rice',symptoms,language,dataUrl||undefined);saveDiagnosis(result);navigate('/result');}catch{setError(t('error'));}finally{setLoading(false);}};
 const toggleRecord=async()=>{if(recording){recorder.current?.stop();setRecording(false);return;}
  if(!import.meta.env.VITE_VOICE_API_URL){setError(t('micUnavailable'));return;}
  try {if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){setError(t('micUnavailable'));return;}const stream=await navigator.mediaDevices.getUserMedia({audio:true});const rec=new MediaRecorder(stream);recorder.current=rec;chunks.current=[];rec.ondataavailable=e=>chunks.current.push(e.data);rec.onstop=async()=>{stream.getTracks().forEach(track=>track.stop());const text=await transcribeAudio(new Blob(chunks.current,{type:rec.mimeType}),language);if(text)setSymptoms(old=>`${old}${old?' ':''}${text}`);else setError(t('micUnavailable'));};rec.start();setRecording(true);}catch{setError(t('micUnavailable'));}
 };
 return <div className="page-enter">
  <PageHeading eyebrow={t('detect')} title={t('detectTitle')} sub={t('detectSub')}/>
  <div className="grid lg:grid-cols-[1.03fr_.97fr] gap-5 items-start">
   <section className="glass rounded-[26px] p-4 sm:p-6">
    <div className="flex justify-between items-start mb-4"><div><h2 className="font-serif text-[23px]">{t('upload')}</h2><p className="text-xs text-[#788679] mt-1">{t('uploadHint')}</p></div><span className="w-9 h-9 bg-[#e6edd9] rounded-xl grid place-items-center text-[#446444]"><ImagePlus size={19}/></span></div>
    {preview?<div className="relative h-[250px] rounded-2xl overflow-hidden bg-[#edf0e6]"><img src={preview} alt={t('upload')} className="w-full h-full object-cover" data-testid="image-crop-preview"/><button type="button" onClick={()=>{URL.revokeObjectURL(preview);setPreview('');setFile(null);}} aria-label={t('removePhoto')} data-testid="button-remove-image" className="absolute right-3 top-3 rounded-xl bg-[#fcfaf0] text-[#28452f] shadow px-3 py-2 text-xs font-bold flex gap-2 items-center"><X size={15}/>{t('removePhoto')}</button></div>:
      <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();setImage(e.dataTransfer.files[0]);}} className="min-h-[245px] rounded-2xl border-2 border-dashed border-[#b9c9ae] bg-[#f3f5eb] flex flex-col items-center justify-center text-center px-5" data-testid="dropzone-image">
       <div className="w-14 h-14 rounded-2xl bg-[#e1ebd3] grid place-items-center text-[#52754d] mb-3"><Upload size={25}/></div><p className="font-semibold">{t('upload')}</p><p className="text-xs text-[#7d8979] mt-1">{t('uploadHint')}</p>
       <div className="flex flex-wrap justify-center gap-2 mt-5">
        <button type="button" onClick={()=>fileRef.current?.click()} data-testid="button-choose-photo" className="px-4 py-2.5 rounded-xl bg-[#315c3d] hover:bg-[#244c34] text-white text-xs font-bold flex items-center gap-2"><ImagePlus size={15}/>{t('chooseFile')}</button>
        <label className="px-4 py-2.5 rounded-xl border border-[#cbd6c3] text-[#34533b] bg-[#fffdf3] text-xs font-bold flex items-center gap-2 cursor-pointer"><input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" capture="environment" onChange={e=>setImage(e.target.files?.[0])} className="sr-only" data-testid="input-camera-photo"/><Camera size={15}/>{t('camera')}</label>
       </div>
      </div>}
    <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={e=>setImage(e.target.files?.[0])} className="hidden" data-testid="input-image-file"/>
   </section>
   <section className="glass rounded-[26px] p-4 sm:p-6">
    <label className="block text-sm font-bold mb-2" htmlFor="crop-select">{t('crop')}</label>
    <div className="relative"><select id="crop-select" value={crop} onChange={e=>setCrop(e.target.value)} data-testid="select-crop" className="w-full appearance-none rounded-xl bg-[#f4f5eb] border border-[#d8dfd0] px-4 py-3 text-sm text-[#314c37]"><option value="">{t('chooseCrop')}</option>{crops.map(c=><option key={c.id} value={c.id}>{cropTitle(c.id,t)}</option>)}</select><ChevronDown size={16} className="absolute right-4 top-3.5 pointer-events-none text-[#778376]"/></div>
    <div className="flex items-center justify-between mt-6 mb-2"><label htmlFor="symptoms-input" className="text-sm font-bold">{t('symptoms')}</label><button type="button" onClick={toggleRecord} data-testid="button-speak-symptoms" className={`rounded-lg p-2 flex items-center gap-1.5 text-xs font-bold ${recording?'bg-[#f7dfd6] text-[#983f2d]':'bg-[#edf0e4] text-[#47664a]'}`}>{recording?<MicOff size={15}/>:<Mic size={15}/>}<span>{recording?t('listening'):t('speak')}</span></button></div>
    <textarea id="symptoms-input" value={symptoms} onChange={e=>setSymptoms(e.target.value)} placeholder={t('symptomsHint')} data-testid="input-symptoms" rows={4} className="w-full rounded-xl bg-[#f4f5eb] border border-[#d8dfd0] px-4 py-3 text-sm resize-y placeholder:text-[#8b9688]"/>
    {error&&<p role="alert" data-testid="status-detect-error" className="mt-3 rounded-xl bg-[#fae4dc] text-[#8c392d] px-3 py-2 text-xs">{error}</p>}
    <button type="button" onClick={submit} disabled={loading} data-testid="button-analyze" className="mt-5 w-full rounded-xl bg-[#284e35] hover:bg-[#1f422e] disabled:opacity-70 text-white py-3.5 font-bold flex justify-center items-center gap-2">{loading?<><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>{t('analyzing')}</>:<><Leaf size={17}/>{t('analyze')}<ArrowRight size={16}/></>}</button>
    {loading&&<p className="text-center text-xs text-[#768276] mt-2">{t('analyzingHint')}</p>}
   </section>
  </div>
 </div>;
}

export function ResultPage() {
 const t=useT();const {history,language,conversation,addMessage}=useAppState();const diagnosis=history[0];const [message,setMessage]=useState('');const [sending,setSending]=useState(false);const [voiceNotice,setVoiceNotice]=useState('');const [audioBusy,setAudioBusy]=useState(false);
 const chatBox=useRef<HTMLDivElement>(null);
  const send=async()=>{if(!message.trim()||!diagnosis)return;const text=message.trim();addMessage(newUserMessage(text));setMessage('');setSending(true);const reply=await askCropDoctor(text,diagnosis,language,conversation);addMessage(reply);setSending(false);setTimeout(()=>chatBox.current?.scrollTo({top:chatBox.current.scrollHeight,behavior:'smooth'}),60);};
 const listen=async()=>{if(!diagnosis)return;setAudioBusy(true);setVoiceNotice('');const audio=await getAdviceAudio(`${t(diagnosis.disease)}. ${diagnosis.treatment.map(x=>t(x)).join('. ')}`,language);if(!audio){setVoiceNotice(t('voiceUnavailable'));setAudioBusy(false);return;}const player=new Audio(audio);player.onended=()=>{URL.revokeObjectURL(audio);setAudioBusy(false);};player.onerror=()=>{setVoiceNotice(t('voiceUnavailable'));setAudioBusy(false);};await player.play().catch(()=>{setVoiceNotice(t('voiceUnavailable'));setAudioBusy(false);});};
 if(!diagnosis)return <div><PageHeading title={t('resultEmpty')} sub={t('resultEmptySub')}/><div className="glass rounded-[25px] p-9 text-center"><div className="w-14 h-14 rounded-2xl bg-[#e4ecd9] text-[#55734e] grid place-items-center mx-auto mb-4"><Leaf size={26}/></div><p className="text-[#718071]">{t('resultEmptySub')}</p><Link href="/detect" data-testid="button-first-check" className="inline-flex items-center gap-2 mt-5 rounded-xl bg-[#284e35] px-4 py-3 text-white no-underline text-sm font-bold"><Leaf size={17}/>{t('scanNow')}</Link></div></div>;
 return <div className="page-enter">
  <PageHeading eyebrow={t('result')} title={t('diagnosis')} sub={t('resultEmptySub')}/>
   {diagnosis.demo&&<div className="mb-4 bg-[#f4ebcf] border border-[#e7d9ae] text-[#725d29] rounded-xl px-4 py-3 text-xs leading-5 font-semibold flex gap-2 items-start" role="note" data-testid="status-demo-diagnosis"><CircleHelp size={16} className="mt-0.5 shrink-0"/><span>{t('demoLabel')}<span className="block font-normal">{t('predictionUnavailable')}</span></span></div>}
   {(diagnosis.translationMissing||diagnosis.confidence<.75)&&<div className="mb-4 space-y-2 bg-[#f8f0d8] border border-[#eadcb5] text-[#715d2d] rounded-xl px-4 py-3 text-xs leading-5 font-semibold" role="status" data-testid="status-low-confidence"><p>{t('lowConfidence')}</p>{diagnosis.translationMissing&&<p>{t('translationUnavailable')}</p>}</div>}
  <div className="grid xl:grid-cols-[1.05fr_.95fr] gap-5 items-start">
   <div className="space-y-4">
    <section className="glass rounded-[26px] overflow-hidden">
     <div className="grid sm:grid-cols-[.9fr_1.1fr]">
      {diagnosis.imageDataUrl?<img src={diagnosis.imageDataUrl} alt={t('upload')} className="w-full h-[230px] sm:h-full object-cover" data-testid="image-diagnosis"/>:<div className="crop-visual min-h-[210px] flex items-center justify-center relative overflow-hidden"><div className="leaf-orbit"></div><Sprout size={74} strokeWidth={1.2} className="text-[#52784d] relative"/></div>}
      <div className="p-5 sm:p-6"><div className="flex items-center justify-between"><span className="bg-[#e4edd8] text-[#416246] px-2.5 py-1 rounded-full text-[10px] font-bold">{cropTitle(diagnosis.crop,t)}</span><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${diagnosis.severity==='high'?'bg-[#f8ded4] text-[#94402f]':diagnosis.severity==='medium'?'bg-[#f6edcc] text-[#775b1d]':'bg-[#e4edd8] text-[#416246]'}`}>{t(diagnosis.severity)}</span></div>
       <h2 className="font-serif text-[30px] leading-tight mt-4" data-testid="text-result-disease">{t(diagnosis.disease)}</h2>
       <p className="text-sm text-[#758174] mt-2">{Math.round(diagnosis.confidence*100)}% {t('confidence').toLowerCase()}</p>
       <div className="mt-5 h-2 rounded-full bg-[#e7eadf] overflow-hidden"><div className="h-full rounded-full bg-[#7f9c5d]" style={{width:`${Math.min(100,Math.round(diagnosis.confidence*100))}%`}}></div></div>
       <div className="flex items-center gap-2 mt-5 text-xs text-[#687968]"><ShieldCheck size={16}/>{t('saved')}</div>
      </div>
     </div>
     <div className="flex flex-wrap gap-2 p-4 border-t border-[#e3e7da]">
      <button type="button" onClick={listen} disabled={audioBusy} data-testid="button-listen-result" className="rounded-xl bg-[#e7eddc] px-4 py-2.5 text-xs font-bold text-[#3e6044] flex gap-2 items-center"><Volume2 size={16}/>{audioBusy?t('listening'):t('listen')}</button>
      <Link href="/detect" data-testid="button-new-check" className="rounded-xl bg-[#284e35] px-4 py-2.5 text-xs font-bold text-white no-underline flex gap-2 items-center"><ScanLineIcon/>{t('scanNow')}</Link>
     </div>
    </section>
    {voiceNotice&&<p role="status" data-testid="status-voice" className="rounded-xl bg-[#f5edcf] px-4 py-3 text-xs text-[#715d2d]">{voiceNotice}</p>}
     {diagnosis.translationMissing?<section className="glass rounded-[24px] p-5"><h3 className="font-serif text-[23px] mb-3">{t('symptomsFound')}</h3><p className="text-sm leading-6 text-[#667567]">{t('translationUnavailable')}</p></section>:<section className="glass rounded-[24px] p-5"><h3 className="font-serif text-[23px] mb-4">{t('symptomsFound')}</h3><ul className="space-y-3">{diagnosis.symptoms.map((s,i)=><li key={`${i}-${s}`} className="flex gap-3 text-sm leading-6 text-[#56695a]"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#87a166] shrink-0"/>{t(s)}</li>)}</ul></section>}
   </div>
   <div className="space-y-4">
     {diagnosis.translationMissing?<section className="glass rounded-[24px] p-5"><h3 className="font-serif text-[23px]">{t('treatment')}</h3><p className="text-sm leading-6 text-[#667567] mt-2">{t('translationUnavailable')}</p></section>:<>
      <AdviceList title={t('causes')} items={diagnosis.causes} icon={<CircleHelp size={18}/>}/>
      <AdviceList title={t('treatment')} items={diagnosis.treatment} icon={<Check size={18}/>}/>
      <AdviceList title={t('prevention')} items={diagnosis.prevention} icon={<Leaf size={18}/>}/>
     </>}
    <section className="glass rounded-[24px] overflow-hidden">
     <div className="px-5 py-4 border-b border-[#e2e7dc] flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-[#dfe9ce] text-[#466444] grid place-items-center"><AudioLines size={19}/></span><div><h3 className="font-serif text-[20px]">{t('chatTitle')}</h3><p className="text-[11px] text-[#758374]">{cropTitle(diagnosis.crop,t)}</p></div></div>
     <div ref={chatBox} className="p-4 space-y-3 max-h-[340px] overflow-y-auto scrollbar-thin" data-testid="chat-message-list">
      {!conversation.length&&<div className="rounded-2xl bg-[#f1f3e9] p-4 text-sm text-[#69796a]">{t('askMore')}</div>}
      {conversation.map(msg=><div key={msg.id} className={`max-w-[90%] rounded-2xl px-3.5 py-3 text-sm leading-5 ${msg.role==='user'?'ml-auto bg-[#315c3d] text-white':'mr-auto bg-[#eef1e5] text-[#425843]'}`} data-testid={`chat-message-${msg.id}`}><p>{msg.role==='assistant'?t(msg.content):msg.content}</p>{msg.demo&&msg.role==='assistant'&&<span className="block text-[10px] opacity-70 mt-2">{t('chatDemo')}</span>}</div>)}
      {sending&&<div className="rounded-2xl bg-[#eef1e5] w-fit px-4 py-3 text-xs text-[#657664]">{t('analyzing')}</div>}
     </div>
     <form onSubmit={e=>{e.preventDefault();void send();}} className="p-3 border-t border-[#e2e7dc] flex items-center gap-2">
      <input value={message} onChange={e=>setMessage(e.target.value)} placeholder={t('chatHint')} aria-label={t('chatHint')} data-testid="input-chat-message" className="flex-1 min-w-0 bg-[#f2f3e9] rounded-xl px-3 py-3 text-sm placeholder:text-[#899488]"/>
      <button disabled={sending||!message.trim()} type="submit" aria-label={t('send')} data-testid="button-send-chat" className="w-11 h-11 rounded-xl bg-[#315c3d] text-white grid place-items-center disabled:opacity-45"><Send size={17}/></button>
     </form>
    </section>
   </div>
  </div>
 </div>;
}
function ScanLineIcon(){return <Leaf size={15}/>;}
function AdviceList({title,items,icon}:{title:string;items:string[];icon:ReactNode}) {const t=useT();return <section className="glass rounded-[22px] p-5"><h3 className="font-serif text-[21px] flex gap-2 items-center mb-3 text-[#2c4934]">{icon}{title}</h3><ul className="space-y-3">{items.map((item,i)=><li className="flex gap-3 text-sm leading-6 text-[#586a59]" key={`${item}-${i}`}><span className="w-6 h-6 rounded-full bg-[#e9eedf] text-[#53704e] text-xs font-bold grid place-items-center shrink-0">{i+1}</span>{t(item)}</li>)}</ul></section>;}

export function DashboardPage() {
 const t=useT();const {history}=useAppState();
 const issues=history.filter(x=>x.severity!=='low').length;
 const most=history.length?Object.entries(history.reduce<Record<string,number>>((all,x)=>(all[x.crop]=(all[x.crop]??0)+1,all),{})).sort((a,b)=>b[1]-a[1])[0][0]:'—';
 const bars=history.slice(0,7).reverse();const values=bars.length?bars.map(x=>x.severity==='high'?92:x.severity==='medium'?62:28):[22,34,26,47,32,39,29];
 return <div className="page-enter">
  <PageHeading eyebrow={t('dashboard')} title={t('dashboardTitle')} sub={t('dashboardSub')}/>
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5">
   <StatCard title={t('totalChecks')} value={history.length.toString()} Icon={ScanLineIcon}/>
   <StatCard title={t('needsCare')} value={issues.toString()} Icon={ArrowDownRight}/>
   <StatCard title={t('commonCrop')} value={most==='—'?t('noScans'):cropTitle(most,t)} Icon={Leaf}/>
   <StatCard title={t('saved')} value={history.length?t('today'):t('noScans')} Icon={ShieldCheck}/>
  </div>
  <div className="grid lg:grid-cols-[1.4fr_.8fr] gap-5">
   <section className="glass rounded-[25px] p-5 sm:p-6"><div className="flex justify-between items-start"><div><p className="text-xs text-[#7b897b]">{t('dashboard')}</p><h2 className="font-serif text-[23px] mt-1">{t('careTrend')}</h2></div><span className="rounded-full bg-[#e9efdd] px-3 py-1 text-[10px] text-[#55704f]">{t('lastSeven')}</span></div>
    <div className="h-[230px] flex items-end gap-2 sm:gap-4 mt-8 border-b border-[#dfe5d8] px-1" data-testid="chart-scan-summary">{values.map((v,i)=><div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2"><span className="text-[10px] text-[#879184]">{history.length?`${Math.round((bars[i]?.confidence??0)*100)}%`:''}</span><div className="w-full max-w-[44px] rounded-t-xl bg-gradient-to-t from-[#476c48] to-[#aac07f] transition-all" style={{height:`${v}%`}} data-testid={`chart-bar-${i}`}></div><span className="text-[9px] text-[#839082]">{history.length?new Date(bars[i]?.date??Date.now()).toLocaleDateString(undefined,{weekday:'short'}):t('today')}</span></div>)}</div>
    {!history.length&&<p className="text-xs text-center text-[#778476] mt-4">{t('demoData')}</p>}
   </section>
   <section className="rounded-[25px] bg-[#244b35] text-[#f2f2e4] p-5 sm:p-6 relative overflow-hidden"><div className="absolute w-40 h-40 rounded-full border border-white/10 right-[-35px] bottom-[-35px]"></div><div className="relative"><p className="text-xs text-[#b7c8ad]">{t('needsCare')}</p><p className="font-serif text-[58px] mt-2 leading-none" data-testid="text-attention-count">{issues.toString().padStart(2,'0')}</p><p className="text-sm leading-6 text-[#d2dfca] mt-4">{history.length?t('careTrend'):t('noScansSub')}</p><Link href="/history" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#d8e8bd] no-underline" data-testid="link-attention-history">{t('history')}<ArrowRight size={15}/></Link></div></section>
  </div>
  <section className="mt-5 glass rounded-[24px] p-5"><div className="flex items-center justify-between mb-4"><h2 className="font-serif text-[22px]">{t('recent')}</h2><Link href="/history" className="text-xs text-[#456348] no-underline font-bold" data-testid="link-dashboard-history">{t('seeAll')}</Link></div>{history.length?<div className="grid md:grid-cols-2 gap-3">{history.slice(0,4).map(item=><DiagnosisCard item={item} key={item.id}/>)}</div>:<EmptyNotice title={t('noScans')} sub={t('noScansSub')}/>}</section>
 </div>;
}
function StatCard({title,value,Icon}:{title:string;value:string;Icon:React.ComponentType<{size?:number}>}) {return <div className="glass rounded-[20px] p-4 sm:p-5 min-h-[115px]"><div className="flex justify-between items-start gap-2"><p className="text-[11px] leading-4 text-[#758477]">{title}</p><span className="w-8 h-8 rounded-xl bg-[#e6edd9] grid place-items-center text-[#52714c] shrink-0"><Icon size={16}/></span></div><p className="font-serif text-[27px] leading-tight mt-3 truncate" data-testid={`stat-${title}`}>{value}</p></div>;}
function EmptyNotice({title,sub}:{title:string;sub:string}){return <div className="rounded-2xl bg-[#f2f4e9] px-5 py-6 flex items-center gap-4" data-testid="empty-state"><span className="w-12 h-12 rounded-2xl bg-[#e4ecd8] text-[#55704d] grid place-items-center"><Sprout size={24}/></span><div><p className="font-semibold">{title}</p><p className="text-sm text-[#778477] mt-1">{sub}</p></div></div>;}

export function HistoryPage() {
 const t=useT();const {history,clearHistory,removeDiagnosis}=useAppState();const [query,setQuery]=useState('');const [confirm,setConfirm]=useState(false);
 const filtered=history.filter(d=>`${d.crop} ${d.disease}`.toLowerCase().includes(query.toLowerCase()));
 return <div className="page-enter">
  <PageHeading eyebrow={t('history')} title={t('historyTitle')} sub={t('historySub')}/>
  <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-5">
   <label className="flex-1 relative"><Search size={17} className="absolute left-4 top-3.5 text-[#788779]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('search')} aria-label={t('search')} data-testid="input-history-search" className="w-full rounded-xl border border-[#d9dfd2] bg-[#fffdf5]/80 pl-11 pr-4 py-3 text-sm"/></label>
   {history.length>0&&<button type="button" onClick={()=>setConfirm(true)} data-testid="button-clear-history" className="rounded-xl border border-[#e1c9bd] text-[#965241] bg-[#fff8f2] px-4 py-3 text-xs font-bold flex gap-2 items-center justify-center"><Trash2 size={15}/>{t('clearHistory')}</button>}
  </div>
   {!filtered.length?<EmptyNotice title={history.length?t('noMatch'):t('noScans')} sub={history.length?t('search'):t('noScansSub')}/>:
   <div className="grid md:grid-cols-2 gap-3">{filtered.map(d=><div className="relative" key={d.id}><DiagnosisCard item={d}/><button type="button" onClick={()=>removeDiagnosis(d.id)} aria-label={t('clearHistory')} data-testid={`button-delete-scan-${d.id}`} className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-[#fffaf1] border border-[#ebe4d7] text-[#89665a] grid place-items-center"><Trash2 size={14}/></button></div>)}</div>}
  {confirm&&<div className="fixed inset-0 z-50 bg-[#183c2c]/40 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" data-testid="dialog-clear-history"><div className="glass rounded-[24px] max-w-sm w-full p-6"><div className="w-11 h-11 rounded-xl bg-[#f5e3d9] text-[#95533e] grid place-items-center"><Trash2 size={20}/></div><h2 className="font-serif text-[24px] mt-4">{t('confirmClear')}</h2><div className="flex gap-2 mt-6"><button type="button" onClick={()=>setConfirm(false)} data-testid="button-cancel-clear" className="flex-1 rounded-xl border border-[#dce1d5] bg-[#f8f7ed] py-3 font-bold text-sm">{t('cancel')}</button><button type="button" onClick={()=>{clearHistory();setConfirm(false);}} data-testid="button-confirm-clear" className="flex-1 rounded-xl bg-[#9b4d3d] text-white py-3 font-bold text-sm">{t('clearHistory')}</button></div></div></div>}
 </div>;
}

export function CropsPage() {
 const t=useT();const [query,setQuery]=useState('');const [group,setGroup]=useState('all');
 const filtered=crops.filter(c=>(group==='all'||c.group===group)&&`${t(cropKey(c.id))} ${t(c.desc)}`.toLowerCase().includes(query.toLowerCase()));
 const groups=['all','grains','vegetables','fruits','pulses'];
 return <div className="page-enter"><PageHeading eyebrow={t('crops')} title={t('cropsTitle')} sub={t('cropsSub')}/>
  <label className="block relative mb-4"><Search size={17} className="absolute left-4 top-3.5 text-[#788779]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('searchCrops')} aria-label={t('searchCrops')} data-testid="input-crop-search" className="w-full rounded-xl border border-[#d9dfd2] bg-[#fffdf5]/80 pl-11 pr-4 py-3 text-sm"/></label>
  <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-thin">{groups.map(g=><button type="button" key={g} onClick={()=>setGroup(g)} data-testid={`filter-${g}`} className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap ${group===g?'bg-[#284e35] text-white':'bg-[#e8eddf] text-[#536750]'}`}>{t(g)}</button>)}</div>
  {filtered.length?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map(c=><Link href={`/crops/${c.id}`} key={c.id} data-testid={`card-crop-${c.id}`} className="glass rounded-[23px] overflow-hidden no-underline text-[#263e2f] group">
   <div className="h-[145px] relative overflow-hidden flex items-center justify-center" style={{background:c.tone}}><div className="absolute w-[180px] h-[180px] border border-[#31563b]/15 rounded-full"></div><div className="absolute w-[135px] h-[135px] border border-[#31563b]/15 rounded-full"></div><c.Icon size={58} strokeWidth={1.15} className="relative text-[#547348] group-hover:scale-110 transition-transform"/><span className="absolute top-4 left-4 rounded-full bg-[#fffdf1]/70 backdrop-blur px-3 py-1 text-[10px] font-bold text-[#53694e]">{t(c.group)}</span></div>
   <div className="p-4"><h2 className="font-serif text-[22px]">{cropTitle(c.id,t)}</h2><p className="text-xs leading-5 text-[#758276] mt-1.5 min-h-10">{t(c.desc)}</p><span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#416147]">{t('learnMore')}<ArrowRight size={14}/></span></div>
  </Link>)}</div>:<EmptyNotice title={t('noMatch')} sub={t('searchCrops')}/>}
 </div>;
}

export function CropDetailPage() {
 const t=useT();const [,params]=useRoute('/crops/:crop');const crop=crops.find(c=>c.id===params?.crop);
 if(!crop)return <CropsPage/>;
 return <div className="page-enter"><Link href="/crops" className="inline-flex items-center gap-2 text-sm font-bold text-[#526c53] no-underline mb-5" data-testid="link-back-crops"><ArrowLeft size={16}/>{t('back')}</Link>
   <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5">
   <div className="rounded-[28px] overflow-hidden min-h-[300px] flex items-center justify-center relative" style={{background:crop.tone}}><div className="leaf-orbit"></div><crop.Icon size={96} strokeWidth={1.1} className="text-[#547348] relative"/><span className="absolute top-5 left-5 bg-[#fffdf1]/75 rounded-full px-3 py-1.5 text-xs font-bold">{t(crop.group)}</span></div>
   <div className="glass rounded-[28px] p-6 sm:p-8"><span className="text-[10px] font-bold rounded-full bg-[#f4ebcf] text-[#725d29] px-2.5 py-1">{t('demoData')}</span><p className="text-[11px] font-bold tracking-[.2em] uppercase text-[#788875] mt-4">{t('crops')}</p><h1 className="font-serif text-[42px] mt-2">{cropTitle(crop.id,t)}</h1><p className="text-[#637466] leading-7 mt-3">{t(crop.desc)}</p><div className="border-t border-[#dfe5d9] mt-7 pt-5"><h2 className="font-serif text-[23px]">{t('signs')}</h2><p className="mt-2 text-sm leading-6 text-[#637466]">{t('sampleSymptom')}</p></div><div className="border-t border-[#dfe5d9] mt-6 pt-5"><h2 className="font-serif text-[23px]">{t('care')}</h2><p className="mt-2 text-sm leading-6 text-[#637466]">{t('samplePrevention')}</p></div><Link href="/detect" data-testid="button-check-this-crop" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#284e35] text-white no-underline font-bold text-sm px-5 py-3"><Leaf size={16}/>{t('scanNow')}</Link></div>
  </div>
 </div>;
}

export function SettingsPage() {
 const t=useT();const {language,setLanguage,farmerMode,setFarmerMode}=useAppState();
 return <div className="page-enter"><PageHeading eyebrow={t('settings')} title={t('settingsTitle')} sub={t('settingsSub')}/>
  <div className="max-w-3xl space-y-4">
   <section className="glass rounded-[24px] p-5 sm:p-6"><div className="flex gap-4 items-start"><span className="w-11 h-11 rounded-xl bg-[#e4edd7] text-[#476947] grid place-items-center"><AudioLines size={20}/></span><div className="flex-1"><h2 className="font-serif text-[23px]">{t('language')}</h2><p className="text-xs text-[#788579] mt-1">{t('languageNote')}</p></div></div>
    <div className="grid sm:grid-cols-2 gap-2 mt-5">{languages.map(([code,label])=><button type="button" key={code} onClick={()=>setLanguage(code)} data-testid={`button-language-${code}`} className={`rounded-xl px-4 py-3 flex items-center justify-between border text-left transition-colors ${language===code?'bg-[#e2ecd2] border-[#a8bc93] text-[#2f5438]':'bg-[#fffdf4]/75 border-[#e0e5d9] text-[#506050]'}`}><span className="text-sm font-semibold">{label}</span>{language===code&&<Check size={17}/>}</button>)}</div>
   </section>
   <section className="glass rounded-[24px] p-5 sm:p-6 flex items-center gap-4"><span className="w-11 h-11 rounded-xl bg-[#e4edd7] text-[#476947] grid place-items-center"><Sprout size={21}/></span><div className="flex-1"><h2 className="font-serif text-[23px]">{t('farmerMode')}</h2><p className="text-xs leading-5 text-[#788579] mt-1">{t('farmerModeDesc')}</p></div><button type="button" onClick={()=>setFarmerMode(!farmerMode)} role="switch" aria-checked={farmerMode} aria-label={t('farmerMode')} data-testid="toggle-farmer-mode" className={`w-[54px] h-[31px] rounded-full p-1 transition-colors ${farmerMode?'bg-[#345f3f]':'bg-[#cbd3c6]'}`}><span className={`block h-[23px] w-[23px] rounded-full bg-[#fffdf3] shadow transition-transform ${farmerMode?'translate-x-[23px]':''}`}></span></button></section>
   <section className="rounded-[24px] bg-[#254c35] text-[#eff2e5] p-5 sm:p-6 flex gap-4 items-center"><span className="w-11 h-11 rounded-xl bg-white/10 grid place-items-center"><ShieldCheck size={21}/></span><div><p className="font-semibold">{t('offline')}</p><p className="text-xs text-[#c1d0bc] mt-1">{t('saved')}</p></div></section>
  </div>
 </div>;
}