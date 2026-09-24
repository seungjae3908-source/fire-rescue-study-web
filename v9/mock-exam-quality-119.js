'use strict';
(()=>{const V=window.AITUTOR_V9=window.AITUTOR_V9||{},
seeded=seed=>{let a=(Number(seed)>>>0)||0x9e3779b9;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}},
sh=(a,r=Math.random)=>{a=[...a];for(let i=a.length-1;i;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},
fam=q=>V.QuestionType119?.classify?.(q)?.key||'recall',
family=q=>V.VariantEngine119?.familyId?.(q)||q?.familyId||q?.masterQuestionId||q?.id||'',
dif=q=>q.difficulty||V.QuestionDifficulty?.infer?.(q)||'mid',
goal=(l,n)=>{const r=l==='low'?[.65,.3,.05]:l==='high'?[.1,.35,.55]:[.25,.55,.2],a=Math.round(n*r[0]),b=Math.round(n*r[1]);return{low:a,mid:b,high:n-a-b}},
recent=(h,n=4)=>new Set((h||[]).slice(-n).flatMap(x=>(x.familyIds&&x.familyIds.length?x.familyIds:x.questionIds)||[])),
norm=s=>String(s||'').replace(/\s+/g,' ').trim();

function factoryLike(q){return /(?:^|-)q?2?factory-|generated/i.test(String(q?.id||''))||q?.generatedPractice===true}
function sourceSpecific(q){const s=String(q?.source||'');return q?.officialPastExam===true||q?.pageVerified===true||/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽|제\s*\d+\s*조|국가법령정보센터|시행령|시행규칙|https:\/\/[^\s]*\.go\.kr/.test(s)}
function explanationStrength(q){const a=q?.choiceExplanations||[];return a.length===4?Math.round(a.reduce((n,x)=>n+norm(x).length,0)/4):0}
function quality(q){
  const stem=norm(q?.q),choices=(q?.choices||[]).map(norm),lens=choices.map(x=>x.length),max=Math.max(1,...lens),min=lens.length?Math.min(...lens):0,family=fam(q);
  let score=0;
  if(q?.grade==='A'||q?.grade==='B')score+=20;
  if(q?.pageVerified===true)score+=18;
  if(q?.reviewStatus==='source-reviewed')score+=12;
  if(q?.officialPastExam===true)score+=42;
  if(sourceSpecific(q))score+=8;
  if(factoryLike(q))score-=55;else score+=24;
  if(q?.generatedPractice===true)score-=22;
  if(stem.length>=22&&stem.length<=150)score+=9;else if(stem.length<14)score-=16;
  if(choices.length===4&&lens.every(x=>x>=4&&x<=120))score+=7;
  if(min/max>=.18)score+=4;
  const ex=explanationStrength(q);if(ex>=24)score+=7;else if(ex>=14)score+=3;
  score+=({scenario:13,integrated:12,process:10,principle:9,compare:9,numeric:9,trap:8,recall:4})[family]||0;
  if(/사례|상황|가장\s*먼저|우선|순서|적절|옳지\s*않|구분|연결|계산|판단|작동|적용/.test(stem))score+=5;
  if(/검증|승격|학습팩|factory|generated|메타|내부/.test(stem))score-=50;
  return score;
}
function strong(q){return quality(q)>=62&&!factoryLike(q)&&sourceSpecific(q)}
function support(a,n,sc){return a.length>=n&&new Set(a.map(q=>q.conceptId)).size>=n&&sc.every(s=>a.some(q=>q.scopeId===s))}
function subjectPool(all,subject,n,sc,preferStrong=true){
  const base=all.filter(q=>q.subject===subject);if(!preferStrong)return base;
  const preferred=base.filter(strong);
  return support(preferred,n,sc)?preferred:base
}
function pick(a,n,l,sc,h=[],random=Math.random){
  const seen=recent(h),w=goal(l,n),o=[],uc=new Set,cs={},cd={low:0,mid:0,high:0},cf={},ca=[0,0,0,0],answerGoal=Math.ceil(n/4);
  const add=q=>{o.push(q);uc.add(q.conceptId);cs[q.scopeId]=(cs[q.scopeId]||0)+1;cd[dif(q)]++;cf[fam(q)]=(cf[fam(q)]||0)+1;ca[q.a]=(ca[q.a]||0)+1};
  const rank=q=>{
    const d=dif(q),f=fam(q),ans=Number(q.a)||0,deficit=(w[d]||0)-(cd[d]||0);
    return quality(q)+(seen.has(family(q))?-180:0)+deficit*32-(cf[f]||0)*5-(cs[q.scopeId]||0)*4+(ca[ans]<answerGoal?10:0)-(ca[ans]||0)*2
  };
  for(const s of sh(sc,random)){
    const p=sh(a.filter(q=>q.scopeId===s&&!uc.has(q.conceptId)),random).sort((x,y)=>rank(y)-rank(x)),q=p[0];if(!q)return[];add(q)
  }
  const cap=Math.max(1,Math.ceil(n/Math.max(1,sc.length))+1);
  while(o.length<n){
    const p=a.filter(q=>!uc.has(q.conceptId)&&(cs[q.scopeId]||0)<cap);if(!p.length)break;
    const q=sh(p,random).map(q=>[q,rank(q)]).sort((x,y)=>y[1]-x[1])[0][0];add(q)
  }
  return o.length===n?o:[]
}
function seq(qs,random=Math.random){const s=sh(qs,random),o=[];while(s.length){const a=o.at(-1),b=o.at(-2),ban=a&&b&&fam(a)===fam(b)?fam(a):'',c={};for(const q of s)c[fam(q)]=(c[fam(q)]||0)+1;const fs=Object.keys(c).filter(f=>f!==ban).sort((x,y)=>c[y]-c[x]);let i=-1;for(const f of fs){i=s.findIndex(q=>fam(q)===f&&(!a||q.scopeId!==a.scopeId));if(i<0)i=s.findIndex(q=>fam(q)===f);if(i>=0)break}if(i<0)i=0;o.push(s.splice(i,1)[0])}return o}
function build({mode='real',level='mid',history=[],seed=null}={}){
  V.VariantEngine119?.annotateAll?.();
  const random=seed===null||seed===undefined?Math.random:seeded(seed);
  const ok=q=>mode==='real'?((q.grade==='A'||q.grade==='B')&&(!q.officialPastExam||q.currentCompatibility===true)):V.QuestionQuality119?.isExamStyle?.(q)!==false,all=(V.questions||[]).filter(ok);
  const fs=V.curriculum.fire.map(x=>x.id),es=V.curriculum.ems.map(x=>x.id);
  const fp=subjectPool(all,'fire',25,fs,mode==='real'),ep=subjectPool(all,'ems',40,es,mode==='real');
  const f=pick(fp,25,level,fs,history,random),e=pick(ep,40,level,es,history,random);
  return f.length===25&&e.length===40?seq([...f,...e],random):[]
}
function metrics(qs){
  const f=qs.map(fam),sc={},d={low:0,mid:0,high:0},ans=[0,0,0,0],families={};let run=0;
  for(let i=0;i<f.length;i++)run=Math.max(run,f[i]===f[i-1]?(f[i]===f[i-2]?3:2):1);
  for(const q of qs){sc[q.scopeId]=(sc[q.scopeId]||0)+1;d[dif(q)]++;ans[q.a]++;families[fam(q)]=(families[fam(q)]||0)+1}
  const scores=qs.map(quality),factoryCount=qs.filter(factoryLike).length,strongCount=qs.filter(strong).length,pageVerified=qs.filter(q=>q.pageVerified===true).length,sourceSpecificCount=qs.filter(sourceSpecific).length,officialWebCount=qs.filter(q=>sourceSpecific(q)&&q.pageVerified!==true).length,officialPastCount=qs.filter(q=>q.officialPastExam===true).length;
  return{n:qs.length,uniqueIds:new Set(qs.map(q=>q.id)).size,uniqueConcepts:new Set(qs.map(q=>q.conceptId)).size,fire:qs.filter(q=>q.subject==='fire').length,ems:qs.filter(q=>q.subject==='ems').length,maxFamilyRun:run,activeFamilies:new Set(f).size,scopes:sc,difficulties:d,answers:ans,families,factoryCount,strongCount,pageVerified,sourceSpecificCount,officialWebCount,officialPastCount,qualityAverage:scores.length?Number((scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1)):0,qualityMin:scores.length?Math.min(...scores):0}
}
V.MockExam119={build,metrics,quality,strong,factoryLike,policy:{version:'119-mock-quality-v3-official-past-priority',recentWindow:4,uniqueConceptPerExam:true,maxFamilyRun:2,realPrefersSourceReviewedNonFactory:true,answerPositionBalance:true,notOfficialExamWeight:true,practiceUsesExpandedExamStylePool:true,realKeepsVerifiedABOnly:true,seededRounds:true,familyRecentSuppression:true}};
})();