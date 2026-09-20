'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},P=V.contentPacks?.authored;
if(!P)return;
const uniqPush=(arr,rows)=>{arr=Array.isArray(arr)?arr:[];for(const row of rows||[])if(row&&!arr.includes(row))arr.push(row);return arr};
const addText=(id,rows)=>{const p=P[id];if(!p||p.status!=='verified')return false;p.detail=uniqPush(p.detail,rows);return true};
const addVisuals=(id,ids)=>{const p=P[id];if(!p||p.status!=='verified')return false;p.visuals=uniqPush(p.visuals,ids);return true};

addText('F03-C11',[
  '공기 유입 이전에는 환기가 제한된 공간에서 산소 부족과 고온 미연소가스 축적 상태가 형성될 수 있다.',
  '개구부가 형성된 직후에는 외부 공기가 유입되면서 가스 혼합 상태가 급격히 변하고 폭발적 연소로 이어질 수 있다.',
  '시험에서는 발생 전의 환기 제한·가스 축적 상태와 공기 유입 이후의 급격한 연소를 하나의 순서로 연결해 구분한다.'
]);
addText('F07-C05',[
  '스프링클러는 방식에 따라 작동 이전의 2차측 배관 상태와 밸브 개방 조건이 다르다.',
  '헤드 또는 감지설비 작동 이후에는 방식별로 밸브 개방·충수·방수 순서가 달라지므로 습식·건식·준비작동식·일제살수식을 구분해 본다.'
]);

addVisuals('F07-C05',['sprinkler-system']);

addVisuals('E09-C02',['ems-breathing']);
addVisuals('E09-C05',['ems-breathing']);
addVisuals('E10-C02',['ems-breathing']);
addVisuals('E12-C03',['ems-primary','ems-reassessment']);
addVisuals('E24-C01',['ems-cpr']);
addVisuals('E24-C04',['ems-cpr']);

const REQUIREMENTS=[
  {id:'F03-C11',timing:2,beforeAfter:2,visuals:['backdraft-flow']},
  {id:'F07-C05',timing:2,beforeAfter:2,visuals:['sprinkler-system']},
  {id:'E09-C02',visuals:['ems-breathing']},
  {id:'E09-C05',visuals:['ems-breathing']},
  {id:'E10-C02',visuals:['ems-breathing']},
  {id:'E12-C03',visuals:['ems-primary','ems-reassessment']},
  {id:'E24-C01',visuals:['ems-cpr']},
  {id:'E24-C04',visuals:['ems-cpr']}
];
function audit(){
  const rows=REQUIREMENTS.map(r=>{
    const pack=P[r.id],schema=V.Quality2StudySchema119?.get?.(r.id),missing=[];
    if(pack?.status!=='verified')missing.push('verified-pack');
    if(!String(pack?.source||'').trim())missing.push('official-source');
    if(r.timing&&(schema?.timingStages?.length||0)<r.timing)missing.push('timing');
    if(r.beforeAfter&&(schema?.beforeAfter?.length||0)<r.beforeAfter)missing.push('before-after');
    for(const visual of r.visuals||[]){
      if(!(schema?.visuals||[]).includes(visual))missing.push('visual:'+visual);
      if(!(V.Visual119?.data?.[visual]||[]).length)missing.push('visual-data:'+visual);
    }
    return{id:r.id,title:V.curriculum?.byId?.[r.id]?.title||r.id,missing,ready:missing.length===0};
  });
  const backlog=rows.filter(x=>!x.ready);
  return{version:'119-quality4-highyield-v1',total:rows.length,ready:rows.length-backlog.length,missing:backlog.length,rows,backlog};
}
V.Quality4HighYield119={version:'119-quality4-highyield-v1',requirements:REQUIREMENTS,audit,policy:{sourceBackedOnly:true,noForcedNonApplicableFields:true,reuseVerifiedVisuals:true}};
})();