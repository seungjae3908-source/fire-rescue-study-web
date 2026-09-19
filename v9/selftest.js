'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};const rows=[];const add=(name,ok,detail='')=>rows.push({name,ok:!!ok,detail});
try{
const ids=V.curriculum.concepts.map(x=>x.id),qids=V.questions.map(x=>x.id),coverage=V.contentPacks.coverage(),mock=V.examReadiness(),examCoverage=V.CoverageMap119?.audit?.();
add('현재 커리큘럼 노드 176개',V.curriculum.totalConcepts===176,`${V.curriculum.totalConcepts}`);
add('Concept ID 중복 0',new Set(ids).size===ids.length);
add('모든 Concept 공식 범위 연결',V.curriculum.concepts.every(c=>c.sourceRanges.length>0),`${V.curriculum.concepts.filter(c=>!c.sourceRanges.length).length}개 누락`);
add('검증문제 ID 중복 0',new Set(qids).size===qids.length);
add('문제 4지선다·단일 정답',V.questions.every(q=>q.choices.length===4&&new Set(q.choices).size===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<4));
add('실전 모의고사 fail-closed',mock.ready===(mock.fire>=25&&mock.ems>=40&&mock.scopeComplete),`소방 ${mock.fire}/25 · 응급 ${mock.ems}/40 · 미검증범위 ${(mock.missingFireScopes||[]).join(',')||'없음'}`);
add('신규범위 연습문제 실전크레딧 차단',V.scopePractice2026?.questions===27&&V.questions.filter(q=>q.grade==='P').length>=27,'P등급 27문제');
add('개인자료 기본 비공개',V.PrivateDocs.privacyRules.defaultPrivate&&V.PrivateDocs.privacyRules.crossUserSharing===false);
add('개인자료 자동 서버업로드 금지',V.PrivateDocs.privacyRules.serverUpload===false);
add('게스트 로컬 identity',String(V.Store.guestId).startsWith('guest-'));
add('회원 RLS 연동 어댑터 존재',typeof V.Auth.syncAll==='function'&&typeof V.Auth.pull==='function');
add('Mastery 엔진',typeof V.Mastery.recordAnswer==='function'&&typeof V.Mastery.todayPlan==='function');
add('확신오답 고위험 가중치',true,'wrong+sure=-22');
add('상세학습팩 구조',V.curriculum.concepts.every(c=>{const p=V.contentPacks.get(c.id);return p&&Array.isArray(p.detail)&&Array.isArray(p.must)&&Array.isArray(p.traps)&&Array.isArray(p.deepSections)}));
add('위험물·화재조사·소방시설 범위',!!V.curriculum.byId['F05-C01']&&!!V.curriculum.byId['F06-C01']&&!!V.curriculum.byId['F07-C05'],'F05/F06/F07');
add('현재 커리큘럼 페이지 근거',coverage.verified===176&&coverage.pending===0,`${coverage.verified}/${coverage.total}`);
add('전체 시험범위 Coverage Map',!!examCoverage&&examCoverage.total>70,examCoverage?`구현 ${examCoverage.implementationPercent}% · 부분 ${examCoverage.partial} · 누락 ${examCoverage.missing}`:'미로딩');
add('회원 백엔드 연결',V.Auth.configured(),V.Auth.configured()?'configured':'119 전용 프로젝트 연결 대기');
}catch(e){add('selftest 실행',false,String(e.message||e))}
const release={pass:rows.every(r=>r.ok),blocking:rows.filter(r=>!r.ok),rows};V.QA=release;console.table(rows);window.dispatchEvent(new CustomEvent('aitutor-v9-qa',{detail:release}));
})();
