'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!V.curriculum)return;
const EXTRA=[
  {id:'F05',title:'위험물화재',subject:'fire',source:'소방학개론 공식 출제범위 · 2026 예방실무/소방법령',concepts:[
    '위험물의 정의·류별 분류',
    '제1류 산화성고체',
    '제2류 가연성고체',
    '제3류 자연발화성·금수성물질',
    '제4류 인화성액체',
    '제5류 자기반응성물질',
    '제6류 산화성액체',
    '위험물화재 특수현상·소화원칙'
  ]},
  {id:'F06',title:'화재조사',subject:'fire',source:'소방학개론 공식 출제범위 · 2026 소방전술/소방법령',concepts:[
    '화재조사의 목적·기본원칙',
    '현장보존·조사절차',
    '발화부·발화원인 조사',
    '화재피해 조사·기록'
  ]},
  {id:'F07',title:'소방시설',subject:'fire',source:'소방학개론 공식 출제범위 · 2026 예방실무1·2',concepts:[
    '소방시설의 5개 분류',
    '소화기구',
    '옥내소화전설비',
    '옥외소화전설비',
    '스프링클러설비',
    '간이스프링클러·화재조기진압용 스프링클러',
    '물분무·미분무소화설비',
    '포소화설비',
    '이산화탄소·가스계소화설비',
    '분말소화설비',
    '자동화재탐지설비',
    '비상경보·비상방송·자동화재속보·가스/누전경보',
    '피난구조설비',
    '소화용수설비',
    '소화활동설비·제연·연결송수'
  ]}
];

const existing=new Set(V.curriculum.fire.map(x=>x.id));
for(const sc of EXTRA)if(!existing.has(sc.id))V.curriculum.fire.push(sc);
V.curriculum.scopes=[...V.curriculum.fire,...V.curriculum.ems];
V.curriculum.scopeById=Object.fromEntries(V.curriculum.scopes.map(x=>[x.id,x]));
V.curriculum.concepts=V.curriculum.scopes.flatMap(scope=>scope.concepts.map((title,index)=>{
  const id=`${scope.id}-C${String(index+1).padStart(2,'0')}`;
  return{id,scopeId:scope.id,scopeTitle:scope.title,subject:scope.subject,title,index,sourceRanges:V.curriculum.ranges[id]||[]}
}));
V.curriculum.byId=Object.fromEntries(V.curriculum.concepts.map(x=>[x.id,x]));
V.curriculum.totalConcepts=V.curriculum.concepts.length;
V.curriculum.version='2026-official-complete-v10';

Object.assign(V.curriculum.docs,{
  prevention1:{label:'2026 예방실무1',kind:'official',scope:'F07'},
  prevention2:{label:'2026 예방실무2',kind:'official',scope:'F05/F07'},
  law1:{label:'2026 소방법령1',kind:'official',scope:'F06/F07'},
  law3:{label:'2026 소방법령3',kind:'official',scope:'F07'},
  law4:{label:'2026 소방법령4',kind:'official',scope:'F05'},
});
const R=V.curriculum.ranges;
const note=(id,doc,text)=>{R[id]=[{doc,label:V.curriculum.docs[doc]?.label||doc,note:text}]};
const anchor=(id,doc,from,to=from)=>{R[id]=[{doc,from,to,label:V.curriculum.docs[doc]?.label||doc}]};
for(let i=1;i<=8;i++)note(`F05-C${String(i).padStart(2,'0')}`,'prevention2','위험물 류별 특성·소화원칙 / 공식 범위 대조');
R['F05-C01']=[
  {doc:'prevention2',from:345,to:345,label:V.curriculum.docs.prevention2.label},
  {doc:'prevention2',from:385,to:385,label:V.curriculum.docs.prevention2.label}
];
anchor('F05-C02','prevention2',385);
anchor('F05-C03','prevention2',407);
anchor('F05-C04','prevention2',428);
anchor('F05-C05','prevention2',449);
anchor('F05-C06','prevention2',496);
anchor('F05-C07','prevention2',523);
R['F05-C08']=[
  {doc:'fire1',from:319,to:319,label:V.curriculum.docs.fire1.label},
  {doc:'prevention2',from:536,to:536,label:V.curriculum.docs.prevention2.label}
];
for(let i=1;i<=4;i++)note(`F06-C${String(i).padStart(2,'0')}`,'law1','화재조사 목적·절차·원인·피해조사');
for(let i=1;i<=15;i++)note(`F07-C${String(i).padStart(2,'0')}`,'prevention1','소방시설 종류·작동원리·사용법 중심(구체 설치기준 제외)');
anchor('F07-C05','prevention1',284);
for(const c of V.curriculum.concepts)c.sourceRanges=R[c.id]||[];

const old=V.sourceLabel;
V.sourceLabel=id=>{
  const rows=R[id]||[];
  if(!rows.length)return old?old(id):'';
  return rows.map(r=>{
    if(Number.isFinite(Number(r.from))&&Number.isFinite(Number(r.to)))return `${r.label} ${r.from===r.to?r.from:`${r.from}~${r.to}`}쪽`;
    return r.note?`${r.label} · ${r.note}`:r.label;
  }).join(' · ');
};
V.curriculumExpansion2026={addedScopes:EXTRA.map(x=>x.id),addedConcepts:EXTRA.reduce((n,x)=>n+x.concepts.length,0),totalConcepts:V.curriculum.totalConcepts,scopePolicy:'소방시설은 종류·작동원리·사용법 중심이며 구체 설치기준은 제외'};
})();