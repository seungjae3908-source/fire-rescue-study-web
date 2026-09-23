'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},P=V.contentPacks?.authored;if(!P)return;
const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const uniqText=rows=>{const out=[];for(const x of rows||[]){const t=String(x||'').trim(),k=norm(t);if(!t||!k||out.some(y=>norm(y)===k))continue;out.push(t)}return out};
const uniqCompare=rows=>{const map=new Map(),order=[];for(const row of rows||[]){if(!Array.isArray(row)||!row[0]||!row[1])continue;const key=norm(row[0]),next=[String(row[0]).trim(),String(row[1]).trim()];if(!map.has(key)){map.set(key,next);order.push(key)}else if(next[1].length>(map.get(key)?.[1]||'').length)map.set(key,next)}return order.map(k=>map.get(k))};
const uniqSections=rows=>{const out=[],seen=new Set();for(const x of rows||[]){if(!x)continue;const key=norm((x.title||'')+' '+(x.body||''));if(!key||seen.has(key))continue;seen.add(key);out.push(x)}return out};
const link=(label,url)=>({label,url,kind:'official'});
const add=(id,{must=[],traps=[],compare=[],deepSections=[],officialLinks=[]})=>{const p=P[id];if(!p)return;p.must=uniqText([...(p.must||[]),...must]);p.traps=uniqText([...(p.traps||[]),...traps]);p.compare=uniqCompare([...(p.compare||[]),...compare]);p.deepSections=uniqSections([...(p.deepSections||[]),...deepSections]);p.officialLinks=[...(p.officialLinks||[]),...officialLinks].filter((x,i,a)=>x?.url&&a.findIndex(y=>y?.url===x.url)===i);p.visibleDetailCoverageV50=true};
const sec=(title,body,bullets=[])=>({title,body,bullets});

add('F07-C03',{
must:[
'수원은 옥내소화전 설치개수가 가장 많은 층의 설치개수에 2.6㎥를 곱해 산정하며, 2개 이상 설치된 경우 계산상 2개를 적용한다.',
'옥상수조는 원칙적으로 산정 유효수량 외에 그 유효수량의 3분의 1 이상을 확보한다.',
'수원을 수조로 설치하는 경우 소화설비 전용수조를 원칙으로 한다.'
],
compare:[
['옥내소화전','건물 내부에서 사람이 호스·관창으로 직접 방수'],
['옥외소화전','건물 외부에서 사람이 호스를 연결해 직접 방수'],
['스프링클러','헤드가 화재열 등에 의해 작동해 자동으로 방수']
],
deepSections:[
sec('수원과 옥상수조','옥내소화전설비의 수원은 가장 많은 층의 설치개수에 2.6㎥를 곱해 산정하고, 설치개수가 2개 이상이면 계산상 2개를 적용한다. 옥상수조는 예외에 해당하지 않는 경우 산정 유효수량 외에 그 3분의 1 이상을 확보하는 구조를 이해한다.'),
sec('수조의 기본 원칙','수원을 수조로 설치하는 경우 소화설비 전용수조가 원칙이다. 다른 설비와 겸용하는 경우에는 유효수량 산정 위치와 흡수구 높이 관계까지 함께 확인한다.')
],
officialLinks:[link('옥내소화전설비 화재안전성능기준 NFPC 102','https://www.law.go.kr/admRulLsInfoP.do?admRulId=31179&efYd=0')]
});

add('F07-C04',{
must:[
'수원은 옥외소화전 설치개수에 7㎥를 곱해 산정하며, 2개 이상 설치된 경우 계산상 2개를 적용한다.',
'수원을 수조로 설치하는 경우 소방소화설비 전용수조를 원칙으로 한다.',
'수조에는 수위계·고정식 사다리·청소용 배수설비·표지·실내조명 등 유지관리 설비를 둔다.'
],
compare:[
['옥내소화전','건물 내부'],
['옥외소화전','건물 외부'],
['소화용수설비','소방대가 사용할 물을 확보·공급']
],
deepSections:[
sec('수원 기준','옥외소화전설비의 수원은 설치개수에 7㎥를 곱해 산정하고, 옥외소화전이 2개 이상이면 계산상 2개를 적용한다.'),
sec('수조 유지관리','옥외소화전설비용 수조는 점검하기 편하고 동결 우려를 줄일 수 있는 위치에 설치하며, 수위계·고정식 사다리·청소용 배수설비·표지·실내조명 등 유지관리에 필요한 설비를 갖춘다.')
],
officialLinks:[link('옥외소화전설비 화재안전성능기준 NFPC 109','https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000269712')]
});

add('F07-C14',{
must:[
'소화수조는 소화용수 전용 수조이고, 저수조는 소화용수와 일반 생활용수를 함께 쓰는 겸용 수조다.',
'채수구는 소방차의 소방호스와 접결되는 흡입구이고, 흡수관투입구는 소방차 흡수관을 수조에 넣기 위한 투입구다.',
'채수구 또는 흡수관투입구는 소방차가 2m 이내까지 접근할 수 있는 위치에 둔다.',
'저수량은 기준면적으로 나눈 수를 올림해 20㎥를 곱해 산정한다.',
'지하 흡수관투입구는 한 변 또는 직경 0.6m 이상이며 소요수량 80㎥ 미만은 1개 이상, 80㎥ 이상은 2개 이상 설치한다.',
'채수구는 원칙적으로 2개이며 소요수량 40㎥ 미만은 1개, 100㎥ 이상은 3개를 설치한다.',
'채수구는 구경 65mm 이상의 나사식 결합금속구를 사용하고 지면에서 0.5m 이상 1m 이하에 설치한다.',
'수조 내부바닥 기준 지표면으로부터 깊이가 4.5m 이상인 지하 수조는 가압송수장치를 설치한다.'
],
compare:[
['소화수조','소화용수 전용 수조'],
['저수조','소화용수 + 일반 생활용수 겸용 수조'],
['채수구','소방호스·흡수관을 접결하는 흡입구'],
['흡수관투입구','소방차 흡수관을 수조 안으로 직접 넣는 투입구'],
['옥내·옥외소화전','사람이 호스로 직접 방수하는 소화설비']
],
deepSections:[
sec('정의','소화수조와 저수조는 화재진압에 필요한 물을 항상 확보하는 소화용수설비다. 소화수조는 소화용수 전용, 저수조는 생활용수와 겸용이라는 차이를 먼저 잡는다.'),
sec('소방차 접근','채수구 또는 흡수관투입구는 소방차가 2m 이내의 지점까지 접근할 수 있는 위치에 설치한다.'),
sec('저수량 산정','소화수조·저수조 저수량은 특정소방대상물의 연면적을 기준면적으로 나눈 수에 20㎥를 곱한다. 일반 기준면적은 12,500㎡이고, 1층과 2층 바닥면적의 합계가 15,000㎡ 이상인 특정소방대상물은 7,500㎡를 적용하며 소수점 이하는 1로 본다.'),
sec('흡수관투입구','지하 소화용수설비의 흡수관투입구는 한 변 또는 직경 0.6m 이상으로 하고, 소요수량 80㎥ 미만은 1개 이상, 80㎥ 이상은 2개 이상 설치한다.'),
sec('채수구','채수구는 원칙적으로 2개를 설치하되 소요수량 40㎥ 미만은 1개, 100㎥ 이상은 3개를 설치한다. 구경 65mm 이상의 나사식 결합금속구를 사용하고 지면에서 0.5m 이상 1m 이하에 설치한다.'),
sec('가압송수장치','소화수조 또는 저수조가 수조 내부바닥 기준 지표면으로부터 4.5m 이상 깊은 지하에 있으면 소요수량을 고려한 가압송수장치를 설치한다.')
],
officialLinks:[link('소화수조 및 저수조 화재안전성능기준 NFPC 402','https://law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000278592&chrClsCd=010202&lsId=33671')]
});

for(const p of Object.values(P)){if(!p)continue;p.must=uniqText(p.must||[]);p.traps=uniqText(p.traps||[]);p.compare=uniqCompare(p.compare||[]);p.deepSections=uniqSections(p.deepSections||[]);p.visibleDetailCoverageV50=true}
V.VisibleDetailCoverage119={version:'119-visible-detail-coverage-v50',normalizedConcepts:Object.keys(P).length,officialFacilityConcepts:['F07-C03','F07-C04','F07-C14']};
})();