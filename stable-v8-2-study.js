'use strict';
(()=>{
const A=window.AITUTOR||{};
const FIRE=[
 {id:'F01',title:'소방조직',source:'소방법령2 · 소방기본법',concepts:['소방기관·조직체계','소방력','소방장비·소방용수시설','소방활동','의용소방대']},
 {id:'F02',title:'재난관리',source:'소방법령5 · 재난 및 안전관리 기본법',concepts:['재난의 정의·유형·용어','재난관리주관·책임기관','안전관리기구','재난 예방','재난 대비·대응·복구','긴급구조','재난안전상황실·보고체계']},
 {id:'F03',title:'연소·화재이론',source:'소방전술1 화재1·화재2',concepts:['화재의 개념·유형','열 발생과 전달','연소이론','화재 진행단계','화재 진행 영향요인','플래시오버·백드래프트·롤오버','연기·Flow Path','폭발']},
 {id:'F04',title:'소화이론',source:'소방전술1 화재1·화재2',concepts:['소화원리','소화약제 조건·분류','물 소화약제','포 소화약제','이산화탄소 소화약제','할로겐화합물 소화약제','할로겐화합물·불활성기체','분말 소화약제']}
];
const EMS=[
 {id:'E01',title:'응급의료 개론',concepts:['응급의료서비스 체계','선진국 응급의료서비스 체계','응급구조사의 법적 책임']},
 {id:'E02',title:'소방대원의 안녕',concepts:['응급처치 시 정신적 스트레스','개인 안전']},
 {id:'E03',title:'감염방지 및 개인 보호 장비',concepts:['감염예방의 정의','감염예방 처치','소독과 멸균','감염 관리','위험물사고현장 구급 활동']},
 {id:'E04',title:'해부생리학',concepts:['인체 기본 해부학','인체 해부생리학']},
 {id:'E05',title:'무선통신 및 기록',concepts:['의사소통','통신 체계','무선통신','기록지']},
 {id:'E06',title:'환자 들어올리기와 이동',concepts:['이동 전 계획','신체 역학','환자 안전','환자 이동 장비','환자 자세']},
 {id:'E07',title:'응급의료 장비 사용법',concepts:['기도확보유지 장비','호흡유지 장비','순환유지 장비','환자이송 장비','외상처치 장비']},
 {id:'E08',title:'환자 평가',concepts:['현장 확인','1차 평가','2차 평가','비외상 주요 병력·신체검진','외상 주요 병력·신체검진','재평가']},
 {id:'E09',title:'기도유지',concepts:['기도유지의 중요성','호흡','기도확보','기도유지 보조기구','인공호흡방법','흡인과 흡인기','산소 치료','특수한 상황']},
 {id:'E10',title:'호흡곤란',concepts:['호흡기계 해부·생리','정상·비정상호흡','호흡곤란','신생아와 소아','연기 흡입']},
 {id:'E11',title:'응급 심장질환',concepts:['심혈관계 해부·생리','심질환','심장마비','제세동','심장충격기','자동 체외 심장충격기']},
 {id:'E12',title:'급성 복통',concepts:['배의 해부·생리','복통','환자 평가','환자 처치','복통유발 질병']},
 {id:'E13',title:'출혈과 쇼크',concepts:['순환계','출혈','외부 출혈','내부 출혈','저혈량 쇼크']},
 {id:'E14',title:'연부조직 손상',concepts:['피부의 기능과 구조','연부조직 손상','화상']},
 {id:'E15',title:'근골격계 손상',concepts:['근골격계 해부·생리','외상과 근골격계','부목']},
 {id:'E16',title:'머리와 척추 손상',concepts:['머리·척추·중추신경계 해부','척추 손상','머리 손상','헬멧 제거']},
 {id:'E17',title:'의식 장애',concepts:['의식 장애','당뇨와 의식장애','경련','뇌졸중']},
 {id:'E18',title:'중독 및 알레르기 반응',concepts:['중독','알레르기 반응']},
 {id:'E19',title:'환경 응급',concepts:['체온조절과 신체','한랭손상','열 손상','익수 사고','물림과 쏘임']},
 {id:'E20',title:'산부인과',concepts:['임신 해부·생리','분만','정상 분만','분만 합병증','임신 중 응급상황·처치','부인과 응급']},
 {id:'E21',title:'소아',concepts:['소아 응급처치의 정의','해부와 생리','발달 과정','기도와 호흡 유지','평가','일반 내과 문제','외상','아동 학대와 방임']},
 {id:'E22',title:'노인',concepts:['노인의 해부와 생리','노인환자 접근','평가']},
 {id:'E23',title:'행동 응급',concepts:['행동 응급','특수한 상황','기록']},
 {id:'E24',title:'기본소생술',concepts:['기본소생술 개요','기도유지·인공호흡','가슴압박','심폐소생술','기도 내 이물질 제거']}
];
const VERIFIED=[
 {id:'v82-f02-1',subject:'소방학개론',scopeId:'F02',chapter:'재난관리',grade:'B',q:'「재난 및 안전관리 기본법」의 목적에 포함되는 재난관리 단계 조합으로 맞는 것은?',choices:['예방·대비·대응·복구','조사·기소·재판·집행','계획·채용·보직·승진','진압·구조·교육·홍보'],a:0,ex:'공식 교재는 재난의 예방·대비·대응·복구와 안전관리에 필요한 사항을 법의 목적으로 제시합니다.',source:'소방법령5 · 재난 및 안전관리 기본법 p.509'},
 {id:'v82-f03-1',subject:'소방학개론',scopeId:'F03',chapter:'연소·화재이론',grade:'B',q:'플래시오버에 대한 설명으로 가장 적절한 것은?',choices:['구획실의 노출된 가연성 물체 표면이 거의 동시에 발화하는 급격한 전이 현상','산소가 완전히 없는 곳에서만 발생하는 냉각 현상','소화약제가 기화하면서 생기는 현상','가연물이 모두 소진된 뒤 시작되는 현상'],a:0,ex:'소방전술1은 플래시오버를 성장기에서 최성기로 넘어가는 과정에서 구획실 내 노출 가연물 표면이 동시 발화하는 상태로 설명합니다.',source:'소방전술1(화재1) · 화재 진행단계 p.21'},
 {id:'v82-f03-2',subject:'소방학개론',scopeId:'F03',chapter:'연소·화재이론',grade:'B',q:'소방전술1에서 플래시오버의 전조로 제시하는 현상은?',choices:['롤오버','응축','동결','침전'],a:0,ex:'공식 교재는 롤오버를 플래시오버의 대표적인 전조현상 중 하나로 설명합니다.',source:'소방전술1(화재1) · 화재성상 p.32~34'},
 {id:'v82-f04-1',subject:'소방학개론',scopeId:'F04',chapter:'소화이론',grade:'B',q:'제3종 분말 소화약제의 주성분과 적응 화재 조합으로 맞는 것은?',choices:['제1인산암모늄 · A/B/C급','탄산수소나트륨 · A급만','탄산수소칼륨 · A급만','이산화탄소 · D급만'],a:0,ex:'소방전술1 화재2의 분말 소화약제 표에서 제3종 분말은 제1인산암모늄을 주성분으로 하고 A·B·C급 화재에 적응한다고 제시합니다.',source:'소방전술1(화재2) · 분말 소화약제 표 2-16'},
 {id:'v82-e06-1',subject:'응급처치학개론',scopeId:'E06',chapter:'환자 들어올리기와 이동',grade:'B',q:'공식 구급 교재에서 쇼크 환자 이송 자세로 제시하는 것은?',choices:['다리를 20~30cm 올린 바로누운 자세','항상 엎드린 자세','무조건 좌위','머리를 가장 높인 자세'],a:0,ex:'소방전술3은 쇼크 환자 이송 시 다리를 20~30cm 올린 바로누운 자세를 제시하며 머리·목뼈·척추손상 환자에게는 시행하지 않도록 설명합니다.',source:'소방전술3(구급) · 환자 자세 p.102'},
 {id:'v82-e13-1',subject:'응급처치학개론',scopeId:'E13',chapter:'출혈과 쇼크',grade:'B',q:'동맥 출혈의 특징으로 가장 적절한 것은?',choices:['선홍색 혈액이 심박동에 맞춰 뿜어져 나올 수 있다','항상 검붉고 천천히 스며 나온다','지혈이 항상 매우 쉽다','찰과상에서만 발생한다'],a:0,ex:'공식 구급 교재는 동맥 출혈을 산소가 풍부한 선홍색 혈액이 심박동에 맞춰 뿜어져 나오며 지혈이 어려울 수 있는 형태로 설명합니다.',source:'소방전술3(구급) · 출혈과 쇼크 p.228'},
 {id:'v82-e17-1',subject:'응급처치학개론',scopeId:'E17',chapter:'의식 장애',grade:'B',q:'경련 환자 응급처치로 적절한 것은?',choices:['입에 물건을 강제로 넣지 않고 신체를 억지로 구속하지 않는다','혀를 보호하기 위해 단단한 물건을 입에 넣는다','경련 중 사지를 강하게 고정한다','호흡과 기도 확인은 하지 않는다'],a:0,ex:'공식 교재의 경련 환자 요약은 입에 무언가를 강제로 넣거나 환자를 신체적으로 구속하지 않도록 제시합니다.',source:'소방전술3(구급) · 의식 장애 p.314'},
 {id:'v82-e11-1',subject:'응급처치학개론',scopeId:'E11',chapter:'응급 심장질환',grade:'B',q:'공식 구급 교재가 설명하는 심장마비 환자의 대표 상태 조합은?',choices:['맥박 없음·호흡 없음·무의식','맥박 정상·호흡 정상·완전 의식','맥박만 증가하고 항상 의식 명료','호흡만 빨라지고 맥박은 반드시 정상'],a:0,ex:'소방전술3은 심장마비 환자에서 맥박과 호흡이 없고 무의식 상태가 나타난다고 설명합니다.',source:'소방전술3(구급) · 응급 심장질환 p.205~206'},
 {id:'v82-e12-1',subject:'응급처치학개론',scopeId:'E12',chapter:'급성 복통',grade:'B',q:'급성 복통 환자의 정보 수집에 공식 교재가 학습목표로 제시하는 문진 방식은?',choices:['OPQRST와 SAMPLE','ABCDE와 RACE만','PASS와 PULL만','START만'],a:0,ex:'급성 복통 장의 학습목표에는 OPQRST와 SAMPLE을 이용한 환자 정보 및 병력 수집이 포함됩니다.',source:'소방전술3(구급) · 급성 복통 p.216'}
];
A.taxonomy={fire:FIRE,ems:EMS};A.verifiedStarter=VERIFIED;
const baseAllQ=allQ;allQ=function(){const old=baseAllQ();const ids=new Set(old.map(q=>q.id));return [...VERIFIED.filter(q=>!ids.has(q.id)),...old]};
let selected=S.get('v82Selected','F03');
function subjectData(){return v8StudySubject==='fire'?FIRE:EMS}
function findTopic(){const list=subjectData();let t=list.find(x=>x.id===selected);if(!t){t=list[0];selected=t.id}return t}
function conceptPrompt(topic,c){return `${v8StudySubject==='fire'?'소방학개론':'응급처치학개론'} > ${topic.title} > ${c}를 시험범위 안에서 공식 근거 중심으로 설명해줘. 정의/핵심기준/헷갈리는 포인트/확인문제 순서로 해줘.`}
const oldStudy=study;
study=function(){const list=subjectData(),topic=findTopic(),badge=v8StudySubject==='fire'?'25문항':'40문항';return shell(`<div class="screen-head"><div><h1>${v8StudySubject==='fire'?'소방학개론':'응급처치학개론'}</h1><p>시험범위 Source Map · 공식근거 우선</p></div><span class="chip good">${badge}</span></div>${v8SubjectSwitch()}<div class="v82-study-shell"><div class="v82-topic-list screen-scroll">${list.map(t=>`<button class="v82-topic ${t.id===topic.id?'active':''}" data-v82-topic="${t.id}"><span>${t.id}</span><div><b>${esc(t.title)}</b><small>${t.concepts.length}개 세부개념</small></div><i>›</i></button>`).join('')}</div><section class="v82-detail"><div class="v82-detail-head"><span>${topic.id}</span><div><h2>${esc(topic.title)}</h2><p>${esc(topic.source||'소방전술3(구급) 공식교재')}</p></div></div><div class="v82-concepts screen-scroll">${topic.concepts.map((c,i)=>`<button data-v82-concept="${i}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(c)}</b><i>AI과외 ›</i></button>`).join('')}</div><div class="v82-actions"><button class="btn primary" data-v82-topic-ai>이 단원 AI과외</button><button class="btn" data-v82-topic-q>관련 문제</button><button class="btn ghost" data-nav="resources">공식근거</button></div></section></div>`)};
const baseBind=bind;bind=function(){baseBind();$$('[data-v82-topic]').forEach(b=>b.onclick=()=>{selected=b.dataset.v82Topic;S.set('v82Selected',selected);render()});$$('[data-v82-concept]').forEach(b=>b.onclick=()=>{const topic=findTopic(),c=topic.concepts[Number(b.dataset.v82Concept)];state.page='tutor';state.chat.push({role:'user',text:conceptPrompt(topic,c)});save();render()});$('[data-v82-topic-ai]')?.addEventListener('click',()=>{const t=findTopic();state.page='tutor';state.chat.push({role:'user',text:`${v8StudySubject==='fire'?'소방학개론':'응급처치학개론'}의 ${t.title} 단원을 시험범위 안에서 공식 근거 중심으로 과외해줘. 세부개념을 빠뜨리지 말고 마지막에 3문제 확인퀴즈를 내줘.`});save();render()});$('[data-v82-topic-q]')?.addEventListener('click',()=>{const t=findTopic(),qs=allQ().filter(q=>q.scopeId===t.id||q.chapter===t.title);if(!qs.length)return toast('이 단원의 검증문제를 아직 누적 중입니다.');const first=allQ().findIndex(q=>q.id===qs[0].id);bankIndex=Math.max(0,first);state.page='bank';save();render()})};
})();
