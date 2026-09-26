'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
let engine=null,loading=null,status='대기',modelId='';
const emit=(text,cb)=>{status=String(text||status);try{cb?.(status)}catch{}};
const numTokens=s=>[...String(s||'').matchAll(/(?:\d+(?:[.,]\d+)?)(?:\s*(?:%|℃|°C|kg|g|mg|L|mL|ml|mmHg|cm|mm|m|km|초|분|시간|회|배|명|쪽))?/g)].map(x=>x[0].replace(/\s+/g,'').toLowerCase());
const hangulRatio=s=>{const t=String(s||'').replace(/\s/g,'');if(!t)return 0;return (t.match(/[가-힣0-9A-Za-z]/g)||[]).length/t.length};
function textQuality(s){
  const t=String(s||'').replace(/\s+/g,' ').trim(),compact=t.replace(/\s/g,'');if(!compact)return 0;
  const valid=hangulRatio(t),weird=(compact.match(/[�□▯]/g)||[]).length/compact.length;
  const tokenBonus=Math.min(1,(t.split(/\s+/).filter(Boolean).length||0)/28);
  const lenBonus=Math.min(1,compact.length/180);
  return Math.max(0,Math.min(1,valid*.55+tokenBonus*.2+lenBonus*.25-weird*.8));
}
function numbersPreserved(source,out){
  const a=numTokens(source);if(!a.length)return true;const b=new Set(numTokens(out));return a.every(x=>b.has(x));
}
function chooseModel(list=[]){
  const rows=[...list].filter(x=>x?.model_id),instruct=rows.filter(x=>/Instruct/i.test(x.model_id));
  const smallest=(instruct.length?instruct:rows).slice().sort((a,b)=>(a.vram_required_MB||99999)-(b.vram_required_MB||99999))[0]||null;
  const half=instruct.find(x=>/0\.5B.*Instruct/i.test(x.model_id))||smallest;
  const memory=Number(navigator.deviceMemory||0),cores=Number(navigator.hardwareConcurrency||0),mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'');
  const capable=!mobile&&((memory>=8)||(memory===0&&cores>=8));
  if(!capable)return half;
  const quality=instruct.filter(x=>/(?:1\.5B|1\.7B|1B|1\.0B).*Instruct/i.test(x.model_id)).sort((a,b)=>{
    const ar=/1\.[57]B/i.test(a.model_id)?0:1,br=/1\.[57]B/i.test(b.model_id)?0:1;
    return ar-br||(a.vram_required_MB||99999)-(b.vram_required_MB||99999)
  })[0];
  return quality||half
}
async function ensure({onProgress}={}){
  if(engine)return engine;if(loading)return loading;
  if(!navigator.gpu)throw Error('WEBGPU_UNAVAILABLE');
  loading=(async()=>{
    emit('로컬 AI 엔진 불러오는 중',onProgress);
    const m=V.RuntimeDeps?.loadWebLLM?await V.RuntimeDeps.loadWebLLM():await import('https://esm.run/@mlc-ai/web-llm@0.2.85'),list=m.prebuiltAppConfig?.model_list||[];
    const model=chooseModel(list);
    if(!model)throw Error('LOCAL_AI_MODEL_UNAVAILABLE');
    modelId=model.model_id;
    emit('AI 모델 선택 · '+modelId,onProgress);
    engine=await m.CreateMLCEngine(modelId,{initProgressCallback:p=>emit(p.text||'AI 모델 준비 중',onProgress)});
    emit('로컬 AI 준비됨 · '+modelId,onProgress);return engine;
  })().catch(err=>{engine=null;emit('로컬 AI 사용 불가',onProgress);throw err}).finally(()=>loading=null);
  return loading;
}
async function chat(messages,{temperature=.1,max_tokens=900,onProgress}={}){
  const e=await ensure({onProgress});
  const r=await e.chat.completions.create({messages,temperature,max_tokens});
  return String(r?.choices?.[0]?.message?.content||'').trim();
}
async function correctExtractedText({primary='',alternate='',confidence=null,onProgress}={}){
  const base=String(primary||alternate||'').trim();if(!base)return{accepted:false,text:'',reason:'empty'};
  if(!navigator.gpu)return{accepted:false,text:base,reason:'no-webgpu'};
  const prompt=`아래는 같은 페이지에서 얻은 텍스트 후보입니다.
규칙:
1) 입력에 없는 사실을 절대 추가하지 마라.
2) OCR 오탈자와 띄어쓰기만 교정하고 문장 순서를 자연스럽게 복원하라.
3) 숫자·단위·기호는 임의로 바꾸거나 새로 만들지 마라.
4) 표는 가능하면 행 단위 줄바꿈을 유지하라.
5) 설명 없이 교정된 본문만 출력하라.

[후보 A]
${base}

[후보 B]
${String(alternate||'없음')}

[OCR 신뢰도]
${confidence==null?'미상':confidence}`;
  let out='';
  try{out=await chat([{role:'system',content:'너는 한국어 소방·구급 교재 OCR 교정기다. 원문 밖의 내용을 만들지 않는다.'},{role:'user',content:prompt}],{temperature:0,max_tokens:1200,onProgress})}catch(err){return{accepted:false,text:base,reason:String(err?.message||err)}}
  if(!out||out.length<Math.max(20,base.length*.45)||out.length>base.length*2.1)return{accepted:false,text:base,reason:'length-guard'};
  if(!numbersPreserved(base,out))return{accepted:false,text:base,reason:'number-guard'};
  if(textQuality(out)+.03<textQuality(base))return{accepted:false,text:base,reason:'quality-guard'};
  return{accepted:true,text:out,reason:'ai-corrected'};
}
async function studyDigest({title='',text='',onProgress}={}){
  const src=String(text||'').trim();if(!src)throw Error('AI_DIGEST_TEXT_REQUIRED');
  const excerpt=src.slice(0,18000);
  return chat([
    {role:'system',content:'너는 소방공무원 시험용 개인자료 정리기다. 제공된 자료 안의 내용만 사용하고, 자료에 없는 사실·수치·법규를 절대 추가하지 않는다.'},
    {role:'user',content:`자료명: ${title||'개인자료'}

아래 추출문만 근거로 합격노트 초안을 작성해라.
형식:
[핵심]
• ...
[숫자·단위·기준]
• ...
[비교·구분]
• ...
[주의·예외]
• ...
[원문 확인 필요]
• OCR이 불확실하거나 문맥이 끊긴 부분

중요 규칙:
- 핵심은 짧고 시험용으로 정리한다.
- 숫자와 단위는 원문에 있는 것만 쓴다.
- 불확실하면 추정하지 말고 '원문 확인 필요'에 넣는다.
- 결과만 출력한다.

[추출문]
${excerpt}`}
  ],{temperature:.05,max_tokens:1100,onProgress});
}
V.LocalAI={
  ensure,chat,correctExtractedText,studyDigest,textQuality,numTokens,numbersPreserved,
  get ready(){return !!engine},
  get status(){return status},
  get engine(){return engine},
  get modelId(){return modelId}
};
})();