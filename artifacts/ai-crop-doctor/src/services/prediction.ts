import type { Diagnosis } from './types';
import { localizeDiagnosisContent } from './translation';
const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
function fallback(crop: string, imageDataUrl?: string): Diagnosis {
  return { id:id(),date:new Date().toISOString(),crop,disease:'diseaseBlight',confidence:62,severity:'medium',symptoms:['sampleSymptom'],causes:['sampleCause'],treatment:['sampleTreatment'],prevention:['samplePrevention'],imageDataUrl,demo:true };
}
export async function predictCrop(file:File, crop:string, symptoms:string, language:string, imageDataUrl?:string):Promise<Diagnosis> {
  if (!base) return fallback(crop,imageDataUrl);
  try {
    const form=new FormData(); form.append('image',file);
    if(crop)form.append('crop',crop);
    if(symptoms)form.append('symptoms',symptoms);
    form.append('language',language);
    const response=await fetch(`${base.replace(/\/$/,'')}/predict`,{method:'POST',body:form});
    if(!response.ok) throw new Error(String(response.status));
    const raw=await response.json();
    const rawDisease=String(raw.disease??raw.prediction??'');
    const rawContent={
      disease:rawDisease,
      symptoms:Array.isArray(raw.symptoms)?raw.symptoms.map(String):[],
      causes:Array.isArray(raw.causes)?raw.causes.map(String):[],
      treatment:Array.isArray(raw.treatment)?raw.treatment.map(String):[],
      prevention:Array.isArray(raw.prevention)?raw.prevention.map(String):[],
    };
    const localized=language==='en'?{...rawContent,translationMissing:false}:await localizeDiagnosisContent(rawContent,language as import('../i18n').Language);
    const rawConfidence=Number(raw.confidence??raw.confidence_score??0.72);
    const confidence=rawConfidence>1?rawConfidence/100:rawConfidence;
    return {
      id:String(raw.id??id()),date:String(raw.date??new Date().toISOString()),crop:String(raw.crop??crop),
      disease:localized.disease,
      confidence:localized.translationMissing?Math.min(confidence,0.45):confidence,
      severity:localized.translationMissing?'low':(['low','medium','high'].includes(raw.severity)?raw.severity:'medium'),
      symptoms:localized.symptoms,causes:localized.causes,treatment:localized.treatment,prevention:localized.prevention,
      imageDataUrl,demo:false,translationMissing:localized.translationMissing,
    };
  } catch { return fallback(crop,imageDataUrl); }
}