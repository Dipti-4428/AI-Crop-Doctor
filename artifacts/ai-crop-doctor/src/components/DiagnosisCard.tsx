import { Link } from 'wouter';
import { ArrowUpRight, CalendarDays, CircleAlert, Leaf } from 'lucide-react';
import { useT } from '../i18n';
import { useAppState } from '../state/AppState';
import type { Diagnosis } from '../services/types';
type Props={item:Diagnosis;compact?:boolean};
export default function DiagnosisCard({item,compact=false}:Props) {
 const t=useT();const {language}=useAppState();const severityColor=item.severity==='high'?'bg-[#fae1d8] text-[#923e2d]':item.severity==='medium'?'bg-[#f7edcc] text-[#785b19]':'bg-[#e0ebd1] text-[#355d37]';
 const crop=t(`crop${item.crop[0]?.toUpperCase()}${item.crop.slice(1)}`);const disease=t(item.disease);
 return <article className="glass rounded-[22px] p-4 sm:p-5 flex gap-4 min-w-0" data-testid={`diagnosis-card-${item.id}`}>
  {item.imageDataUrl?<img src={item.imageDataUrl} alt={t('upload')} className="w-[72px] h-[82px] object-cover rounded-2xl shrink-0"/>:<div className="w-[72px] h-[82px] rounded-2xl crop-visual grid place-items-center text-[#55764d] shrink-0"><Leaf size={26}/></div>}
  <div className="flex-1 min-w-0">
   <div className="flex flex-wrap items-center gap-2 mb-1">
    <span className={`text-[11px] font-bold rounded-full px-2.5 py-1 ${severityColor}`}><CircleAlert size={12} className="inline mr-1"/>{t(item.severity)}</span>
    {item.demo&&<span className="text-[10px] text-[#727b6c] border border-[#d8ddce] rounded-full px-2 py-1">{t('demoData')}</span>}
   </div>
   <h3 className="font-serif text-[19px] leading-tight truncate" data-testid={`text-diagnosis-${item.id}`}>{disease}</h3>
   <p className="text-xs text-[#6e7b6e] mt-1">{crop} <span className="mx-1">·</span> {Math.round(item.confidence*100)}% {t('confidence').toLowerCase()}</p>
   <div className="flex items-center justify-between mt-3">
    <span className="text-[11px] text-[#748071] flex gap-1.5 items-center"><CalendarDays size={13}/>{new Intl.DateTimeFormat(language,{month:'short',day:'numeric'}).format(new Date(item.date))}</span>
    <Link href="/result" className="inline-flex items-center gap-1 text-xs font-bold text-[#315c3d] no-underline hover:underline" data-testid={`link-result-${item.id}`}>{t('learnMore')}<ArrowUpRight size={14}/></Link>
   </div>
  </div>
  {!compact&&null}
 </article>;
}