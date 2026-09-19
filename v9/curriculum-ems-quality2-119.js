'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!V.curriculum)return;
const scope={
  id:'E25',title:'기타 내과 응급',subject:'ems',
  concepts:['간·담도·췌장 응급','비뇨생식기계 응급','조혈계 응급','눈·귀·코·목 응급','비외상성 근골격계 응급']
};
if(!V.curriculum.ems.some(x=>x.id===scope.id))V.curriculum.ems.push(scope);
const R=V.curriculum.ranges;
const range=(id,rows)=>{R[id]=rows.map(x=>({doc:'ems',label:'2026 소방전술3(구급)',...x}))};
range('E25-C01',[{from:217,to:224}]);
range('E25-C02',[{from:217,to:224},{from:435,to:437}]);
range('E25-C03',[{from:66,to:66},{from:227,to:227}]);
range('E25-C04',[{from:105,to:105},{from:435,to:435}]);
range('E25-C05',[{from:390,to:394}]);
V.curriculum.scopes=[...V.curriculum.fire,...V.curriculum.ems];
V.curriculum.scopeById=Object.fromEntries(V.curriculum.scopes.map(x=>[x.id,x]));
V.curriculum.concepts=V.curriculum.scopes.flatMap(s=>s.concepts.map((title,index)=>{
  const id=`${s.id}-C${String(index+1).padStart(2,'0')}`;
  return{id,scopeId:s.id,scopeTitle:s.title,subject:s.subject,title,index,sourceRanges:R[id]||[]}
}));
V.curriculum.byId=Object.fromEntries(V.curriculum.concepts.map(x=>[x.id,x]));
V.curriculum.totalConcepts=V.curriculum.concepts.length;
V.curriculum.version='2026-quality2-expanded-ems-v2';
V.curriculumQuality2EMS={scope:'E25',addedConcepts:scope.concepts.length,totalConcepts:V.curriculum.totalConcepts,officialScope:'2026 응급처치학개론 내과응급 세부범위'};
})();