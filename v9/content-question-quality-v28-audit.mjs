import fs from 'node:fs';

await import('./verified-question-quality-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.curriculum?.concepts||!V?.questions||!V?.contentPacks?.authored)throw new Error('V28_AUDIT_RUNTIME_UNAVAILABLE');

const concepts=V.curriculum.concepts;
const verified=V.questions.filter(q=>q.grade==='A'||q.grade==='B');
const P=V.contentPacks.authored;
const chars=x=>String(x||'').replace(/\s+/g,'').length;
const packChars=p=>{
  const deep=(p?.deepSections||[]).flatMap(x=>[x?.title,x?.body,...(x?.bullets||[])]).filter(Boolean);
  const detail=deep.length?deep:(p?.detail||[]);
  return chars([p?.summary,...detail,...(p?.must||[]),...(p?.traps||[]),...(p?.compare||[]).flat(),...(p?.flow||[])].join(' '));
};
const rows=concepts.map(c=>{
  const qs=verified.filter(q=>q.conceptId===c.id);
  const pos=[0,0,0,0];for(const q of qs)pos[q.a]=(pos[q.a]||0)+1;
  const nonzero=pos.filter(Boolean).length,maxPos=Math.max(...pos,0);
  return{
    id:c.id,title:c.title,scopeId:c.scopeId,subject:c.subject,
    chars:packChars(P[c.id]),verified:qs.length,A:qs.filter(q=>q.grade==='A').length,B:qs.filter(q=>q.grade==='B').length,
    answerPositions:pos.join('/'),answerPositionKinds:nonzero,maxAnswerShare:qs.length?Number((maxPos/qs.length).toFixed(3)):0
  };
});
const depthBottom=[...rows].sort((a,b)=>a.chars-b.chars||a.id.localeCompare(b.id));
const depthBelow750=depthBottom.filter(x=>x.chars<750);
const verifiedUnder3=rows.filter(x=>x.verified<3).sort((a,b)=>a.verified-b.verified||a.id.localeCompare(b.id));
const verifiedUnder4=rows.filter(x=>x.verified<4).sort((a,b)=>a.verified-b.verified||a.id.localeCompare(b.id));
const verifiedAllBOnly=rows.filter(x=>x.verified>0&&x.A===0);
const answerPositionConcentration=rows.filter(x=>x.verified>=3&&(x.answerPositionKinds<2||x.maxAnswerShare>=0.8))
  .sort((a,b)=>b.maxAnswerShare-a.maxAnswerShare||b.verified-a.verified||a.id.localeCompare(b.id));

const awkwardRe=/(?:다음\s*(?:심화|상세)\s*설명|핵심\s*설명).*(?:가장\s*정확히|개념)|가장\s*정확히\s*설명하는\s*개념/;
const awkward=V.questions.filter(q=>awkwardRe.test(String(q.q||''))).map(q=>({id:q.id,conceptId:q.conceptId,q:q.q}));
const exactQuestionTexts=new Map,duplicates=[];
for(const q of V.questions){
  const k=String(q.q||'').replace(/\s+/g,' ').trim().toLowerCase();
  if(!k)continue;
  if(exactQuestionTexts.has(k))duplicates.push({a:exactQuestionTexts.get(k),b:q.id,text:q.q});
  else exactQuestionTexts.set(k,q.id);
}

const flame=P['F03-C10'];
const flameText=JSON.stringify({summary:flame?.summary,detail:flame?.detail,must:flame?.must,traps:flame?.traps,compare:flame?.compare,deepSections:flame?.deepSections});
const flameQs=verified.filter(q=>q.conceptId==='F03-C10');
const flamePositions=new Set(flameQs.map(q=>q.a));
const factualErrors=[];
if(!flame||!/(?:물체|가연성).*표면|표면.*(?:화염|확산)/.test(flameText))factualErrors.push('F03-C10_SURFACE_SPREAD_DEFINITION_MISSING');
if(/벽면\s*→\s*천장\s*화염의\s*면이동/.test(JSON.stringify(flame?.must||[])))factualErrors.push('F03-C10_DIRECTION_OVERCONSTRAINED');
if(flameQs.length<3)factualErrors.push('F03-C10_VERIFIED_UNDER_THREE');
if(flamePositions.size<2)factualErrors.push('F03-C10_ANSWER_POSITION_MONOTONY');

const summary={
  version:'119-v28-content-question-quality-audit-v1',
  concepts:concepts.length,
  fire:rows.filter(x=>x.subject==='fire').length,
  ems:rows.filter(x=>x.subject==='ems').length,
  totalQuestions:V.questions.length,
  verified:verified.length,
  depth:{min:depthBottom[0]?.chars||0,below750:depthBelow750.length,bottom20:depthBottom.slice(0,20).map(x=>({id:x.id,chars:x.chars}))},
  verifiedCoverage:{under3:verifiedUnder3.length,under4:verifiedUnder4.length,allBOnly:verifiedAllBOnly.length},
  answerPositionConcentration:answerPositionConcentration.length,
  awkwardStems:awkward.length,
  exactDuplicateTexts:duplicates.length,
  factualErrors
};
console.log('V28_CONTENT_QUESTION_QUALITY_SUMMARY',JSON.stringify(summary,null,2));
console.log('V28_DEPTH_BOTTOM_30');console.table(depthBottom.slice(0,30));
console.log('V28_VERIFIED_UNDER_THREE');console.table(verifiedUnder3);
console.log('V28_VERIFIED_UNDER_FOUR');console.table(verifiedUnder4.slice(0,120));
console.log('V28_VERIFIED_ALL_B_ONLY');console.table(verifiedAllBOnly.slice(0,120));
console.log('V28_ANSWER_POSITION_CONCENTRATION');console.table(answerPositionConcentration.slice(0,120));
console.log('V28_AWKWARD_STEMS');console.table(awkward);
console.log('V28_EXACT_DUPLICATE_TEXTS');console.table(duplicates.slice(0,80));

if(concepts.length!==183)throw new Error('V28_CONCEPT_COUNT '+concepts.length);
if(duplicates.length)throw new Error('V28_DUPLICATE_QUESTION_TEXT '+JSON.stringify(duplicates.slice(0,10)));
if(awkward.length)throw new Error('V28_AWKWARD_GENERATED_STEM '+JSON.stringify(awkward.slice(0,20)));
if(factualErrors.length)throw new Error('V28_FACTUAL_CONTRACT_FAILED '+JSON.stringify(factualErrors));
console.log('V28_CONTENT_QUESTION_QUALITY_AUDIT_COMPLETE');
