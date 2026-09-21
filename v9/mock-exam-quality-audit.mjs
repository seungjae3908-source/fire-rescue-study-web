import fs from 'node:fs';
import vm from 'node:vm';

await import('./verified-question-quality-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum)throw Error('MOCK_ENGINE_RUNTIME_UNAVAILABLE');
vm.runInThisContext(fs.readFileSync(new URL('./mock-exam-quality-119.js',import.meta.url),'utf8'),{filename:'mock-exam-quality-119.js'});
const E=V.MockExam119;if(!E?.build||!E?.metrics)throw Error('MOCK_ENGINE_V14_UNAVAILABLE');
let seed=0x1192027;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};

const fireScopes=V.curriculum.fire.map(x=>x.id),emsScopes=V.curriculum.ems.map(x=>x.id),allScopes=[...fireScopes,...emsScopes];
const summary={version:'119-v14-mock-engine-audit-v1',simulations:0,failures:[],levels:{},answerPos:[0,0,0,0],familyRuns:{max:0},recent:{chains:30,maxRepeat:0,totalRepeat:0}};
const fail=(code,detail)=>summary.failures.push({code,detail});
for(const level of ['low','mid','high']){
 const d={runs:0,activeFamiliesMin:99,difficulty:{low:0,mid:0,high:0}};
 for(let i=0;i<130;i++){
  const qs=E.build({mode:'real',level,history:[]}),m=E.metrics(qs);summary.simulations++;d.runs++;
  if(m.n!==65||m.fire!==25||m.ems!==40)fail('SIZE',{level,i,n:m.n,fire:m.fire,ems:m.ems});
  if(m.uniqueIds!==65||m.uniqueConcepts!==65)fail('DUPLICATE',{level,i,ids:m.uniqueIds,concepts:m.uniqueConcepts});
  const missing=allScopes.filter(id=>!m.scopes[id]);if(missing.length)fail('SCOPE_MISSING',{level,i,missing});
  const over=Object.entries(m.scopes).filter(([id,n])=>n>(id.startsWith('F')?5:3));if(over.length)fail('SCOPE_CAP',{level,i,over});
  if(m.maxFamilyRun>2)fail('FAMILY_RUN',{level,i,max:m.maxFamilyRun});
  if(m.activeFamilies<5)fail('FAMILY_DIVERSITY',{level,i,active:m.activeFamilies});
  d.activeFamiliesMin=Math.min(d.activeFamiliesMin,m.activeFamilies);
  for(const k of ['low','mid','high'])d.difficulty[k]+=m.difficulties[k]||0;
  m.answers.forEach((n,j)=>summary.answerPos[j]+=n);
 }
 const total=d.runs*65;d.difficultyShares=Object.fromEntries(Object.entries(d.difficulty).map(([k,n])=>[k,Number((n/total).toFixed(3))]));
 summary.levels[level]=d;
}
const dl=summary.levels.low.difficultyShares,dm=summary.levels.mid.difficultyShares,dh=summary.levels.high.difficultyShares;
if((dl.low||0)<.32||dl.low<=dm.low+.08)fail('LOW_MODE_DIFFICULTY',{low:dl,mid:dm});
if((dm.mid||0)<.50)fail('MID_MODE_DIFFICULTY',dm);
if((dh.high||0)<.45||dh.high<=dm.high+.18)fail('HIGH_MODE_DIFFICULTY',{high:dh,mid:dm});
const answerTotal=summary.answerPos.reduce((a,b)=>a+b,0);summary.answerShares=summary.answerPos.map(n=>Number((n/answerTotal).toFixed(3)));
if(summary.answerShares.some(x=>x<.18||x>.32))fail('ANSWER_POSITION',summary.answerShares);

for(let c=0;c<summary.recent.chains;c++){
 const history=[];let last=null;
 for(let r=0;r<5;r++){
  const qs=E.build({mode:'real',level:'mid',history}),ids=qs.map(q=>q.id);
  if(r===4){const prev=new Set(history.slice(-4).flatMap(x=>x.questionIds)),repeat=ids.filter(id=>prev.has(id)).length;summary.recent.maxRepeat=Math.max(summary.recent.maxRepeat,repeat);summary.recent.totalRepeat+=repeat;if(repeat>10)fail('RECENT_REPEAT',{chain:c,repeat})}
  history.push({questionIds:ids});last=qs
 }
}
summary.recent.avgRepeat=Number((summary.recent.totalRepeat/summary.recent.chains).toFixed(2));
summary.familyRuns.max=2;
console.log('MOCK_ENGINE_119_SUMMARY',JSON.stringify(summary,null,2));
if(summary.failures.length)throw Error('MOCK_ENGINE_119_FAILED '+JSON.stringify(summary.failures.slice(0,20)));
console.log('MOCK_ENGINE_119_AUDIT_COMPLETE');
