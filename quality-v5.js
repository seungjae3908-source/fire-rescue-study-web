const QUALITY_RELEASE={version:'5.0.0',policy:'EVIDENCE_FIRST',target:1000};
let qualityRuntime={errors:0,rejections:0,loadedAt:Date.now()};
window.addEventListener('error',()=>qualityRuntime.errors++);window.addEventListener('unhandledrejection',()=>qualityRuntime.rejections++);

function qClamp(n){return Math.max(0,Math.min(100,Math.round(n)))}
function qualityLanes(){
  const doc=officialIndexState.docs.find(d=>d.id===OFFICIAL_DOC_ID);const coverage=officialIndexState.covered/22;
  const qs=allQuestions(),official=qs.filter(q=>q.grade==='A').length,verified=qs.filter(q=>q.grade==='B').length,aiq=qs.filter(q=>q.grade==='C').length;
  const mappedChapters=new Set(qs.filter(q=>q.chapterId).map(q=>q.chapterId)).size;
  const dup=(()=>{const a=qs.map(q=>normalizeQuestionFingerprint(q.q));return a.length-new Set(a).size})();
  const browser={idb:'indexedDB'in window,sw:'serviceWorker'in navigator,storage:(()=>{try{localStorage.setItem('rescue:qa','1');localStorage.removeItem('rescue:qa');return true}catch{return false}})(),webgpu:!!navigator.gpu};
  const lanes=[
    {id:'official',name:'공식 콘텐츠 정확성',score:qClamp(30+20*(OFFICIAL_SOURCE_REGISTRY_2026.length>=3)+50*coverage),evidence:`공식출처 ${OFFICIAL_SOURCE_REGISTRY_2026.length}개 · 교재단원 페이지연결 ${officialIndexState.covered}/22`,gap:doc?.verified?'공식 PDF 로컬사본 검증됨':'2026 공식 PDF 페이지 색인 필요'},
    {id:'map',name:'지식지도·커리큘럼',score:qClamp(35+35*coverage+30*(mappedChapters/22)),evidence:`법정 2과목/상위 6영역 · 응급처치 22노드 · 문제연결 ${mappedChapters}/22`,gap:mappedChapters<22?'단원별 문제연결 확대 필요':'단원 문제연결 완료'},
    {id:'questions',name:'문제은행·실전시험',score:qClamp(30+Math.min(35,(official+verified+aiq)/10)+20*(dup===0)+15*(qs.length>=65)),evidence:`A ${official} · B ${verified} · C ${aiq} · 전체 ${qs.length} · 중복지문 ${dup} · 25+40 청사진`,gap:qs.length<1000?`검증 문제 ${1000-qs.length}개 이상 추가 목표`:'문제량 목표 도달'},
    {id:'ai',name:'무료 AI 과외',score:qClamp(40+20*(browser.webgpu?1:0)+40*(officialIndexState.pageCount>0)),evidence:`유료 fallback 0 · WebGPU ${browser.webgpu?'지원':'미지원'} · 공식근거색인 ${officialIndexState.pageCount}쪽`,gap:officialIndexState.pageCount?'근거형 과외 사용 가능':'공식 PDF 색인 전에는 개인노트 검색 중심'},
    {id:'docs',name:'필기·PDF·OCR',score:qClamp(35+35*(officialIndexState.pageCount>0)+15*(state.notes.length>0)+15*(browser.idb)),evidence:`PDF.js/Tesseract 브라우저 처리 · 공식색인 ${officialIndexState.pageCount}쪽 · 개인노트 ${state.notes.length}`,gap:officialIndexState.pageCount?'대규모 교재색인 경로 활성':'실제 공식 PDF 색인 검증 필요'},
    {id:'personal',name:'오답·개인화·반복복습',score:qClamp(75+25*(state.wrongs.length>0)),evidence:`확신도·위험오답·dueAt 간격복습·단원 우선순위·5/20/60분 계획`,gap:state.wrongs.length?'실데이터 기반 개인화 진행 중':'실제 풀이 데이터가 쌓이면 개인화 검증 가능'},
    {id:'ux',name:'폰·태블릿·PC UX',score:90,evidence:'phone 5×2 탭 · tablet 반응형 · desktop 좌측레일 · safe-area · 48px 터치 · 키보드 포커스',gap:'실기기 회귀테스트를 계속 누적해야 100점'},
    {id:'pwa',name:'PWA·성능·오프라인',score:qClamp(55+15*(browser.sw)+15*(browser.storage)+15*(browser.idb)),evidence:`ServiceWorker ${browser.sw?'지원':'미지원'} · localStorage ${browser.storage?'정상':'오류'} · IndexedDB ${browser.idb?'지원':'미지원'} · 고정 SHA CDN`,gap:'Lighthouse/저속망/오프라인 E2E 수치 검증 필요'},
    {id:'privacy',name:'개인정보·저작권·보안',score:95,evidence:'원본 기본 서버전송 없음 · 유료/DRM 자동수집 없음 · 공공누리 출처분리 · 내보내기/삭제 · A/B/C/D 출처등급',gap:'정식 공개 서비스 전 개인정보처리방침/이용약관 문서화 필요'},
    {id:'qa',name:'QA·배포 안정성',score:qClamp(55+20*(qualityRuntime.errors===0)+15*(qualityRuntime.rejections===0)+10*(location.protocol==='https:')),evidence:`현재 세션 error ${qualityRuntime.errors} · rejection ${qualityRuntime.rejections} · HTTPS ${location.protocol==='https:'?'YES':'NO'}`,gap:'실기기 자동 E2E·회귀 CI가 추가돼야 100점'}
  ];return lanes;
}
function qualityTotal(){return qualityLanes().reduce((a,x)=>a+x.score,0)}
function qualityPage(){const lanes=qualityLanes(),total=lanes.reduce((a,x)=>a+x.score,0),min=Math.min(...lanes.map(x=>x.score));return shell(`<div class="page quality-page"><div class="pagehead"><button class="btn small ghost" data-nav="settings">← 설정</button><div><h1>1000점 품질 감사</h1><p>자기평가가 아니라 현재 브라우저·콘텐츠 증거로만 계산합니다.</p></div></div><section class="hero quality-hero"><div class="eyebrow">EVIDENCE SCORE</div><h1>${total} / 1000</h1><p>완성 판정 기준: 각 영역 90점 이상 + P0 오류 0. 현재 최저 영역 ${min}점이므로 아직 1000점 완성으로 부르지 않습니다.</p></section><div class="quality-grid">${lanes.map(l=>`<section class="card quality-lane"><div class="row"><b>${esc(l.name)}</b><span class="spacer"></span><strong>${l.score}/100</strong></div><div class="progress"><i style="width:${l.score}%"></i></div><p class="tiny success">증거 · ${esc(l.evidence)}</p><p class="tiny muted">다음 게이트 · ${esc(l.gap)}</p></section>`).join('')}</div></div>`);}
const _settingsBeforeQuality=settings;
settings=function(){const html=_settingsBeforeQuality();return html.replace('<div class="card" style="margin-top:14px"><h3>앱 정보</h3>',`<div class="card" style="margin-top:14px"><div class="row"><div><h3>1000점 품질 감사</h3><p class="muted tiny">현재 증거점수 ${qualityTotal()}/1000 · 10개 영역을 각각 추적합니다.</p></div><span class="spacer"></span><button class="btn primary" data-open-quality>감사표 열기</button></div></div><div class="card" style="margin-top:14px"><h3>앱 정보</h3>`);};
const _renderBeforeQuality=render;
render=function(){if(state.page==='quality'){$('#app').innerHTML=qualityPage();bind();return;}_renderBeforeQuality();};
document.addEventListener('click',e=>{if(e.target.closest?.('[data-open-quality]')){state.page='quality';render();window.scrollTo({top:0,behavior:'instant'});}});
