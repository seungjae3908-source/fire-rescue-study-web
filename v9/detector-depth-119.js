'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},p=V.contentPacks?.authored?.['F07-C11'];if(!p)return;
const LAW_URL='https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000243864';
const uniq=xs=>[...new Set((xs||[]).filter(Boolean))];
const sec=(title,body,bullets=[])=>({title,body,bullets});
const additions=[
  sec('열감지기 세부 작동원리','현행 「감지기의 형식승인 및 제품검사의 기술기준」 제3조는 열감지기를 온도의 “상승률”을 보는 차동식과 일정 “온도값” 도달을 보는 정온식으로 나누고, 감열 범위와 외형에 따라 스포트형·분포형·감지선형을 구분한다.',[
    '차동식스포트형: 주위온도가 일정 상승률 이상이 될 때 일국소의 열 효과로 작동',
    '차동식분포형: 주위온도가 일정 상승률 이상이 될 때 넓은 범위의 열 효과 누적으로 작동',
    '정온식감지선형: 일국소 온도가 일정 온도 이상이 될 때 작동하며 외관이 전선과 같은 선형',
    '정온식스포트형: 일국소 온도가 일정 온도 이상이 될 때 작동하며 외관이 선형이 아님',
    '보상식스포트형: 차동식스포트형과 정온식스포트형 성능을 겸하고 둘 중 어느 한 기능이 작동하면 신호 발신'
  ]),
  sec('연기감지기 세부 작동원리','연기감지기는 단순히 “연기를 본다”로 끝내지 않고 어떤 물리량 변화를 검출하는지 구분한다. 현행 기술기준 제3조의 정의를 시험용 구분축으로 사용한다.',[
    '이온화식스포트형: 일국소 연기에 의해 이온전류가 변하는 것을 검출',
    '광전식스포트형: 일국소 연기에 의해 광전소자에 접하는 광량이 변하는 것을 검출',
    '광전식분리형: 발광부와 수광부 사이 공간에 연기가 포함될 때 작동',
    '공기흡입형: 감지하려는 위치의 공기를 흡입해 그 공기에 일정 농도의 연기가 포함되면 작동'
  ]),
  sec('불꽃·복합형 감지기','현행 기술기준 제2조는 불꽃감지기를 화재의 불꽃에 포함되는 적외선·자외선 등을 검출해 화재신호를 발신하는 감지기로 정의한다. 복합형은 열·연기·불꽃 감지 성능 중 둘 이상을 조합한다.',[
    '불꽃감지기: 불꽃의 복사에너지 영역(적외선·자외선 포함)을 검출',
    '복합형: 열·연기·불꽃 중 둘 이상의 감지 성능을 조합',
    '감지기와 스프링클러 폐쇄형 헤드는 별도 장치이며 “감지기 신호가 곧 헤드 개방”으로 일반화하지 않음'
  ]),
  sec('시험에서 쓰는 구분축','감지기 문제는 ① 무엇을 감지하는가 ② 상승률인가 고정값인가 ③ 한 지점인가 넓은 범위인가 ④ 전류·광량·광로·흡입 중 무엇이 변하는가를 순서대로 보면 혼동을 줄일 수 있다.',[
    '차동 ↔ 정온: 온도 상승률 ↔ 일정 온도 도달',
    '스포트 ↔ 분포/분리: 일국소 ↔ 넓은 범위 또는 송·수광부 사이 공간',
    '이온화 ↔ 광전: 이온전류 변화 ↔ 광량 변화',
    '연기 ↔ 불꽃: 연소생성물 ↔ 적외선·자외선을 포함한 불꽃'
  ])
];
const titles=new Set((p.deepSections||[]).map(x=>String(x?.title||'')));
p.deepSections=[...(p.deepSections||[]),...additions.filter(x=>!titles.has(x.title))];
p.must=uniq([...(p.must||[]),'차동식=온도 상승률','정온식=일정 온도 도달','이온화식=이온전류 변화','광전식=광량 변화','광전식분리형=발광부·수광부 사이 연기','공기흡입형=공기 흡입 후 연기농도 검출','불꽃감지기=적외선·자외선 포함 불꽃 검출']);
p.traps=uniq([...(p.traps||[]),'차동식과 정온식을 모두 단순 고온감지로 보지 않는다.','광전식분리형을 광전식스포트형과 같은 구조로 보지 않는다.','불꽃감지기를 열감지기로 분류하지 않는다.']);
p.compare=[...(p.compare||[]),['차동식','온도 상승률 기준'],['정온식','일정 온도 도달 기준'],['이온화식스포트형','연기에 따른 이온전류 변화'],['광전식스포트형','연기에 따른 광전소자 광량 변화'],['광전식분리형','발광부·수광부 사이 공간의 연기'],['공기흡입형','대상 위치 공기를 흡입해 연기농도 검출']];
p.officialLinks=[...(p.officialLinks||[]).filter(x=>String(x?.url||'')!==LAW_URL),{label:'국가법령정보센터 · 감지기의 형식승인 및 제품검사의 기술기준 제2조·제3조',url:LAW_URL}];
p.detectorSubtypeDepth119=true;
const contractText=[...(p.deepSections||[])].flatMap(x=>[x.title,x.body,...(x.bullets||[])]).join(' ');
const required=['차동식스포트형','차동식분포형','정온식감지선형','정온식스포트형','보상식스포트형','이온화식스포트형','광전식스포트형','광전식분리형','공기흡입형','적외선','자외선'];
for(const term of required)if(!contractText.includes(term))throw new Error('DETECTOR_SUBTYPE_DEPTH_MISSING '+term);
if(!(p.officialLinks||[]).some(x=>String(x?.url||'')===LAW_URL))throw new Error('DETECTOR_SUBTYPE_OFFICIAL_SOURCE_MISSING');
V.DetectorDepth119={version:'119-detector-subtype-v1',conceptId:'F07-C11',source:'감지기의 형식승인 및 제품검사의 기술기준 제2조·제3조',sourceUrl:LAW_URL,required};
})();
