'use strict';
(()=>{const V=window.AITUTOR_V9=window.AITUTOR_V9||{},X=V.Visual119;if(!X)return;Object.assign(X.data,{
'ems-scene':['현장 안전','환자 수','손상·질병기전','추가지원','환자 접근'],
'ems-primary':['전반적 인상','의식','기도','호흡','순환','즉시처치·이송결정'],
'ems-reassessment':['주호소','ABC','활력징후','처치반응','변화 비교'],
'ems-airway-open':['폐쇄원인 확인','자세·기도개방','흡인/이물제거','보조기도기','호흡 재평가'],
'ems-airway-adjunct':['의식·구역반사 확인','OPA/NPA 선택','크기 측정','삽입','위치·환기 재평가'],
'ems-breathing':['호흡수·깊이','호흡노력','흉곽·호흡음','피부·의식','산소/환기보조 판단'],
'ems-aed':['심정지 인식','AED 부착','리듬분석','필요 시 충격','즉시 CPR 재개'],
'ems-shock':['원인·체액손실','보상반응','조직관류 저하','의식·피부·맥박 변화','재평가'],
'ems-cpr':['압박 위치','100~120회/분','약 5cm','완전 이완','중단 최소화'],
'ems-newborn-initial':['보온 유지','입→코 기도정리','호흡 평가','필요 시 부드러운 자극','Apgar 1분·5분 재평가'],
'ems-hazmat-zones':['현장 위험평가','오염구역','오염통제구역·제독','안전구역','중증도분류·이송'],
'ems-pediatric-resuscitation':['기도·호흡 평가','산소화·환기','느린맥·저산소 경계','순환·쇼크 평가','심정지 시 CPR·제세동'],
'ems-ecg-arrest-rhythms':['VF','무맥성 VT','PEA','무수축'],
'ems-electrical-therapy':['제세동','동기화 심율동전환','경피조율']
});
const baseRender=X.render.bind(X);
const waves=[
  {key:'vf',title:'VF · 심실세동',tag:'shockable',note:'무질서 · 조직된 QRS 식별 어려움',path:'M0 43 L8 28 L15 55 L22 19 L31 48 L40 25 L49 61 L58 31 L67 52 L75 17 L84 46 L92 35 L101 57 L110 22 L118 49 L128 29 L138 59 L147 20 L157 50 L167 34 L176 55 L186 24 L196 47 L207 18 L217 54 L228 32 L238 58 L249 26 L260 49 L270 36 L280 55 L290 23 L300 44'},
  {key:'pvt',title:'pVT · 무맥성 심실빈맥',tag:'shockable',note:'빠른 넓은 복합파 · 맥박 확인 필수',path:'M0 45 L15 45 L21 18 L32 62 L43 30 L52 45 L72 45 L78 18 L89 62 L100 30 L109 45 L129 45 L135 18 L146 62 L157 30 L166 45 L186 45 L192 18 L203 62 L214 30 L223 45 L243 45 L249 18 L260 62 L271 30 L280 45 L300 45'},
  {key:'pea',title:'PEA · 무맥성 전기활동',tag:'non-shockable',note:'조직된 전기활동 가능 · 하지만 맥박 없음',path:'M0 45 L20 45 L25 40 L30 45 L38 45 L42 16 L47 68 L54 36 L60 45 L82 45 L87 41 L92 45 L100 45 L104 18 L109 66 L116 36 L122 45 L144 45 L149 40 L154 45 L162 45 L166 17 L171 67 L178 35 L184 45 L206 45 L211 41 L216 45 L224 45 L228 18 L233 66 L240 36 L246 45 L268 45 L273 40 L278 45 L286 45 L290 19 L295 64 L300 42'},
  {key:'asystole',title:'Asystole · 무수축',tag:'non-shockable',note:'거의 평탄 · 전극/리드 확인 · 미세 VF 감별',path:'M0 45 L35 45 L50 44 L65 45 L90 45 L108 46 L125 45 L155 45 L174 44 L192 45 L220 45 L236 46 L252 45 L275 45 L286 44 L300 45'}
];
function ecgCard(w){
  return `<div class="ecg-rhythm-card"><div class="ecg-rhythm-head"><b>${w.title}</b><span>${w.tag}</span></div><div class="ecg-strip" role="img" aria-label="${w.title} 학습용 파형 도식"><svg viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true"><path d="${w.path}"/></svg></div><p>${w.note}</p></div>`;
}
const therapyCards=[
  {title:'제세동',tag:'심정지',main:'VF · 무맥성 VT',sub:'비동기 충격 · 빠른 충격 후 즉시 CPR'},
  {title:'동기화 심율동전환',tag:'맥박 있음',main:'혈역학적으로 불안정한 빈맥',sub:'R파 동기화 · 소아 0.5~1 J/kg → 2 J/kg'},
  {title:'경피조율',tag:'서맥',main:'완전 AV block/동기능부전 등',sub:'환기·산소·압박·약물 불응 시 고려'}
];
function therapyCard(x){
  return `<div class="therapy-card"><div class="therapy-head"><b>${x.title}</b><span>${x.tag}</span></div><strong>${x.main}</strong><p>${x.sub}</p></div>`;
}
X.render=id=>{
  if(id==='ems-ecg-arrest-rhythms')return `<div class="concept-visual ecg-learning-visual"><div class="visual-title">심정지 4리듬 · 시험 판독용 학습 도식</div><div class="ecg-rhythm-grid">${waves.map(ecgCard).join('')}</div><div class="ecg-visual-note">실제 환자 ECG 원본이 아닌 개념 비교용 도식 · pVT/PEA는 반드시 맥박 확인과 함께 판단</div></div>`;
  if(id==='ems-electrical-therapy')return `<div class="concept-visual electrical-therapy-visual"><div class="visual-title">전기치료 3가지 · 적용상황 비교</div><div class="therapy-grid">${therapyCards.map(therapyCard).join('')}</div><div class="ecg-visual-note">시험 기준 2020 KACPR · 제세동/동기화 전환/경피조율은 서로 다른 치료</div></div>`;
  return baseRender(id);
};
})();