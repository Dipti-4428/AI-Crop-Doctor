export type Severity = 'low' | 'medium' | 'high';
export interface Diagnosis {
  id:string; date:string; crop:string; disease:string; confidence:number; severity:Severity;
  symptoms:string[]; causes:string[]; treatment:string[]; prevention:string[];
   imageDataUrl?:string; demo:boolean; translationMissing?:boolean;
}
export interface ChatMessage { id:string; role:'user'|'assistant'; content:string; date:string; demo:boolean; }