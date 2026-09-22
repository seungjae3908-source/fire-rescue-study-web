'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const SRC='감지기의 형식승인 및 제품검사의 기술기준 제2조·제3조';
const rows=[
{id:'119-fac-det-01',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'차동식스포트형 감지기의 작동원리를 가장 정확히 설명한 것은?',choices:['일국소의 주위온도가 일정 상승률 이상이 될 때 열 효과로 작동한다','일국소가 일정 온도값에 도달할 때만 작동한다','발광부와 수광부 사이 연기가 광로를 가릴 때 작동한다','불꽃의 적외선만 검출하고 자외선은 검출하지 않는다'],a:0,difficulty:'mid',type:'원리형',choiceExplanations:['정답. 차동식은 온도 상승률, 스포트형은 일국소 열 효과가 핵심이다.','정온식스포트형 설명이다.','광전식분리형 설명이다.','불꽃감지기는 적외선·자외선을 포함한 불꽃을 검출한다.']},
{id:'119-fac-det-02',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'보상식스포트형 감지기에 대한 설명으로 옳은 것은?',choices:['차동식스포트형과 정온식스포트형 성능을 겸하고 어느 한 기능이 작동하면 신호를 낸다','차동식분포형과 광전식분리형을 반드시 동시에 작동시킨다','연기농도와 불꽃을 동시에 검출해야만 작동한다','항상 전선 모양의 감열부만 사용한다'],a:0,difficulty:'high',type:'개념형',choiceExplanations:['정답. 현행 기술기준 제3조의 보상식스포트형 정의다.','서로 다른 감지기 구조를 잘못 결합한 설명이다.','복합형 일반 개념과도 일치하지 않는다.','정온식감지선형의 외형 특징과 혼동한 설명이다.']},
{id:'119-fac-det-03',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'이온화식스포트형과 광전식스포트형의 구분으로 가장 적절한 것은?',choices:['이온화식은 연기에 따른 이온전류 변화, 광전식은 연기에 따른 광전소자 광량 변화를 이용한다','이온화식은 일정 온도, 광전식은 온도 상승률만 이용한다','둘 다 발광부와 수광부 사이의 장거리 광로만 이용한다','둘 다 불꽃의 적외선·자외선만 검출한다'],a:0,difficulty:'mid',type:'비교형',choiceExplanations:['정답. 두 연기감지기의 대표 검출 물리량 차이다.','열감지기 구분을 섞은 오답이다.','광전식분리형의 구조와 혼동했다.','불꽃감지기 설명이다.']},
{id:'119-fac-det-04',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'광전식분리형 감지기의 구조·작동 설명으로 옳은 것은?',choices:['발광부와 수광부 사이 공간에 연기가 포함될 때 작동한다','일국소 온도가 일정 온도 이상일 때 작동하는 선형 감열 방식만 뜻한다','공기를 흡입하지 않으면 어떤 연기도 감지할 수 없다','화재신호를 받으면 스프링클러 폐쇄형 헤드를 전기적으로 전부 개방한다'],a:0,difficulty:'mid',type:'구조형',choiceExplanations:['정답. 발광부·수광부 사이 공간의 연기를 감시하는 분리형 구조다.','정온식감지선형과 혼동한 설명이다.','공기흡입형의 특징을 잘못 일반화했다.','폐쇄형 헤드의 감열작동과 감지기를 혼동했다.']},
{id:'119-fac-det-05',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'공기흡입형 연기감지기의 핵심 작동방식은?',choices:['감지하려는 위치의 공기를 흡입해 그 공기에 일정 농도의 연기가 포함됐는지 검출한다','넓은 범위의 열 효과가 누적되면 압력만으로 작동한다','일정 온도 이상에서만 선형 감열부가 작동한다','불꽃의 자외선을 차단해 화재를 소화한다'],a:0,difficulty:'mid',type:'원리형',choiceExplanations:['정답. 대상 위치 공기를 흡입해 연기 포함 여부를 검출한다.','차동식분포형과도 정확히 일치하지 않는 설명이다.','정온식감지선형 설명이다.','감지기는 소화장치가 아니다.']},
{id:'119-fac-det-06',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'현행 감지기 기술기준에서 불꽃감지기가 검출하는 대상으로 옳은 것은?',choices:['화재의 불꽃이며 적외선과 자외선을 포함한다','오직 주위온도의 일정 상승률만 검출한다','연기의 이온전류 변화만 검출한다','수신기에서 발생한 전압만 검출한다'],a:0,difficulty:'low',type:'정의형',choiceExplanations:['정답. 불꽃에는 적외선·자외선이 포함된다.','차동식 열감지기 설명이다.','이온화식 연기감지기 설명이다.','감지대상의 정의가 아니다.']}
].map(q=>({...q,source:SRC,ex:q.choiceExplanations[q.a]}));
const existing=new Set(V.questions.map(q=>q.id));
for(const q of rows){if(existing.has(q.id))continue;if(q.choices.length!==4||!Number.isInteger(q.a)||q.a<0||q.a>3)throw new Error('DETECTOR_QUESTION_CONTRACT '+q.id);V.questions.push(q);existing.add(q.id)}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
for(const id of rows.map(q=>q.id))if(!V.questionById[id])throw new Error('DETECTOR_QUESTION_MISSING '+id);
V.DetectorQuestions119={version:'119-detector-questions-v1',added:rows.length,conceptId:'F07-C11',source:SRC,ids:rows.map(q=>q.id)};
})();
