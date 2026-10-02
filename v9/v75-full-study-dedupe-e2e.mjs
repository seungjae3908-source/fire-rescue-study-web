import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const norm=v=>String(v||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const words=v=>new Set(String(v||'').toLowerCase().replace(/(?:119|112)(?=\s*(?:안전센터|구조대|구급대|지역대|출장소|구조구급센터|종합상황실|신고|구조|구급))/g,'').split(/[\s·,()\/→←:=+\-–~]+/).map(x=>x.replace(/[^0-9a-z가-힣%℃]/g,'').replace(/(?:으로는|에서는|에게서|으로|에서|에게|에는|까지|부터|보다|처럼|은|는|이|가|을|를|과|와|의|에|로|도|만)$/,'')).filter(x=>x.length>=2));
function dice(a,b){const x=norm(a),y=norm(b);if(x.length<4||y.length<4)return 0;const grams=s=>{const m=new Map;for(let i=0;i<s.length-1;i++){const g=s.slice(i,i+2);m.set(g,(m.get(g)||0)+1)}return m},A=grams(x),B=grams(y);let hit=0,total=0;for(const n of A.values())total+=n;for(const n of B.values())total+=n;for(const [g,n] of A)hit+=Math.min(n,B.get(g)||0);return total?2*hit/total:0}
function sameFact(a,b){
 const x=norm(a),y=norm(b);if(!x||!y)return false;if(x===y)return true;
 const min=Math.min(x.length,y.length),max=Math.max(x.length,y.length);
 if(min>=24&&min/max>=.82&&(x.includes(y)||y.includes(x)))return true;
 if(min>=14&&dice(a,b)>=.78)return true;
 const A=words(a),B=words(b);if(!A.size||!B.size)return false;let hit=0;for(const w of A)if(B.has(w))hit++;
 return min>=10&&hit/Math.min(A.size,B.size)>=.78&&dice(a,b)>=.48
}
function pairDuplicates(rows){
 const out=[];for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)if(sameFact(rows[i],rows[j]))out.push([rows[i],rows[j]]);
 return out
}

const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:1024,height:768},serviceWorkers:'block'});
 const page=await ctx.newPage();page.setDefaultTimeout(45000);
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.StudyEmphasis119);
 const ids=await page.evaluate(()=>window.AITUTOR_V9.curriculum.concepts.map(x=>x.id));
 assert(ids.length===183,'V75 dedupe audit covers all 183 fire/EMS concepts');
 const issues=[],stats={coreFacts:0,detailFacts:0,numberRows:0,serviceNumberLeaks:0,crossOverlapAllowed:0,coreDup:0,detailDup:0};
 for(const id of ids){
  await page.evaluate(id=>{const V=window.AITUTOR_V9,c=V.curriculum.byId[id],s=V.Store.state;s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=id;s.studyTab='core';s.outline=false;V.Store.save();V.App.render()},id);
  await page.waitForSelector('.page-study .core-view');
  const core=await page.locator('.page-study .core-view').evaluate(root=>{
    const text=x=>String(x?.textContent||'').replace(/\s+/g,' ').trim();
    return{
      facts:[
        ...[...root.querySelectorAll('.study-quick .lead')].map(text),
        ...[...root.querySelectorAll('.study-core-essentials li')].map(text),
        ...[...root.querySelectorAll('.study-numbers li')].map(text),
        ...[...root.querySelectorAll('.study-traps li')].map(text)
      ].filter(Boolean),
      numbers:[...root.querySelectorAll('.study-numbers li')].map(text).filter(Boolean),
      compare:root.querySelectorAll('.study-core-compare-row').length
    }
  });
  stats.coreFacts+=core.facts.length;stats.numberRows+=core.numbers.length;
  if(core.compare!==0)issues.push({id,type:'CORE_COMPARE_REPEAT',count:core.compare});
  const coreDup=pairDuplicates(core.facts);if(coreDup.length){stats.coreDup+=coreDup.length;issues.push({id,type:'CORE_DUP',rows:coreDup.slice(0,4)})}
  const invalidNumbers=await page.evaluate(rows=>rows.filter(x=>!window.AITUTOR_V9.StudyEmphasis119.isNumericCriterion(x)),core.numbers);
  if(invalidNumbers.length){stats.serviceNumberLeaks+=invalidNumbers.length;issues.push({id,type:'NON_CRITERION_NUMBER',rows:invalidNumbers})}

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='detail';V.Store.save();V.App.render()});
  await page.waitForSelector('.page-study .detail-view');
  const detail=await page.locator('.page-study .detail-view').evaluate(root=>{
    const text=x=>String(x?.textContent||'').replace(/\s+/g,' ').trim();
    const tagged=[
      ...[...root.querySelectorAll('.detail-definition p')].map(x=>({source:'definition',text:text(x)})),
      ...[...root.querySelectorAll('.detail-fold .detail-copy > p')].map(x=>({source:'detail-body',text:text(x)})),
      ...[...root.querySelectorAll('.detail-fold .detail-copy li')].map(x=>({source:'detail-bullet',text:text(x)})),
      ...[...root.querySelectorAll('.detail-criteria li')].map(x=>({source:'criteria',text:text(x)})),
      ...[...root.querySelectorAll('.detail-exam-points li')].map(x=>({source:'trap',text:text(x)}))
    ].filter(x=>x.text);
    const compare=[...root.querySelectorAll('.detail-compare .concept-class-card')].map(x=>({label:text(x.querySelector('b')),body:text(x.querySelector('p'))})).filter(x=>x.label&&x.body);
    return{facts:tagged.map(x=>x.text),tagged,compare}
  });
  stats.detailFacts+=detail.facts.length+detail.compare.length;
  const detailDup=pairDuplicates(detail.facts);if(detailDup.length){stats.detailDup+=detailDup.length;issues.push({id,type:'DETAIL_DUP',rows:detailDup.slice(0,4).map(pair=>pair.map(text=>({text,source:detail.tagged.find(x=>x.text===text)?.source||'?'})))})}
  const cross=[];for(const a of core.facts)for(const b of detail.facts)if(sameFact(a,b))cross.push([a,b]);
  stats.crossOverlapAllowed+=cross.length;
  const labels=new Set;
  for(const row of detail.compare){
    const lk=norm(row.label);if(labels.has(lk))issues.push({id,type:'COMPARE_LABEL_DUP',label:row.label});labels.add(lk);
    const related=detail.facts.find(seed=>sameFact(seed,row.body)&&!([...new Set((row.body.match(/\d+(?:[.,]\d+)?/g)||[]))].some(n=>!(seed.match(/\d+(?:[.,]\d+)?/g)||[]).includes(n))));
    const numbered=/^(?:제?\d+\s*(?:종|류|급))$/.test(row.label);
    if(related&&!numbered)issues.push({id,type:'COMPARE_REPEAT',rows:[[related,row.label+' '+row.body]]});
  }
 }
 const priorityContracts=[
  ['F04-C01',['냉각','질식','제거','연쇄반응']],
  ['F06-C02',['현장보존','전체','근접','진압수','분석']],
  ['F06-C03',['발화부','점화원','최초착화물','환기']],
  ['E08-C01',['현장안전','환자수','추가지원','위험']],
  ['E13-C05',['조직관류','혈압','의식','보상']],
  ['E17-C04',['얼굴','팔','말','마지막','정상']],
  ['E24-C04',['30:2','2분','5주기','10초']]
 ];
 for(const [id,terms] of priorityContracts){
  await page.evaluate(id=>{
   const V=window.AITUTOR_V9,c=V.curriculum.byId[id],s=V.Store.state;
   s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=id;s.studyTab='detail';s.outline=false;V.Store.save();V.App.render()
  },id);
  await page.waitForSelector('.page-study .detail-view');
  const detailText=(await page.locator('.page-study .detail-view').innerText()).replace(/\s+/g,' ');
  for(const term of terms)assert(detailText.includes(term),id+' detail preserves high-priority distinction after semantic dedupe: '+term);
 }

 const org=await page.evaluate(()=>{
  const V=window.AITUTOR_V9,p=V.contentPacks.get('F01-C01');
  return{numbers:V.StudyEmphasis119.numberRows(p,20),valid119:V.StudyEmphasis119.isNumericCriterion('소방서장 소속 → 119안전센터·구조대·구급대 등')}
 });
 assert(org.valid119===false,'119 emergency-service identifiers are not treated as numeric criteria');
 assert(!org.numbers.some(x=>/119안전센터|119구조대|119구급대/.test(x)),'organization names stay out of 숫자·단위·기준');

 await page.evaluate(()=>{
   const V=window.AITUTOR_V9,c=V.curriculum.byId['F07-C14'],s=V.Store.state;
   s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='detail';s.outline=false;V.Store.save();V.App.render()
 });
 await page.waitForSelector('.page-study .detail-view');
 const waterDetail=await page.locator('.page-study .detail-view').innerText();
 const waterDebug=await page.evaluate(()=>{const V=window.AITUTOR_V9,p=V.contentPacks.get('F07-C14'),root=document.querySelector('.page-study .detail-view');return{numberRows:V.StudyEmphasis119.numberRows(p,20),must:p.must,criteria:[...root.querySelectorAll('.detail-criteria li')].map(x=>x.textContent.trim()),detailText:root.innerText.replace(/\s+/g,' ')}});console.log('V75_F07_C14_DEBUG',JSON.stringify(waterDebug));
 for(const term of ['소화수조','저수조','채수구','흡수관투입구','2m','20㎥','0.6m','65mm','0.5m','1m'])assert(waterDetail.includes(term),'F07-C14 detail preserves distinct fire-water fact: '+term);

 console.log('V75_FULL_STUDY_DEDUPE_STATS',JSON.stringify(stats));
 if(issues.length){console.error('V75_FULL_STUDY_DEDUPE_ISSUES',JSON.stringify(issues.slice(0,80),null,2));throw new Error('V75_FULL_STUDY_DEDUPE_FAILED '+issues.length)}
 assert(stats.coreDup===0&&stats.detailDup===0,'core and detail are independently deduplicated without deleting detail because core summarizes it');
 assert(stats.crossOverlapAllowed>0,'core-to-detail factual overlap is preserved by design');
 console.log('V75_FULL_STUDY_DEDUPE_SUCCESS');
 await ctx.close();
}finally{await browser.close()}
