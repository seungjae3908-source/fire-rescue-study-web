const LATEST_REGISTERED_OFFICIAL_YEAR=2026;
function examYearTruth(){
  const target=Number(state.profile?.examYear)||LATEST_REGISTERED_OFFICIAL_YEAR;
  if(target===LATEST_REGISTERED_OFFICIAL_YEAR)return {target,official:true,label:`${target} 공식기준`,note:'앱에 2026 변경공고·법정 시험범위가 등록돼 있습니다.'};
  if(target>LATEST_REGISTERED_OFFICIAL_YEAR)return {target,official:false,label:`${target} 목표 · 공식공고 미등록`,note:`현재 앱의 확정 근거는 ${LATEST_REGISTERED_OFFICIAL_YEAR} 변경공고입니다. ${target} 공고가 발표되면 반드시 변경사항을 비교해야 합니다.`};
  return {target,official:false,label:`${target} 과거 목표`,note:`현재 앱의 기준자료는 ${LATEST_REGISTERED_OFFICIAL_YEAR} 버전입니다. 과거연도 문제·규정과 섞이지 않게 주의하세요.`};
}
function yearTruthBanner(){const y=examYearTruth();return `<div class="year-truth ${y.official?'official':'pending'}"><div><b>${esc(y.label)}</b><p>${esc(y.note)}</p></div><button class="btn small" data-nav="resources">공식자료 확인</button></div>`;}
const _homeBeforeYearTruth=home;
home=function(){const html=_homeBeforeYearTruth();return html.replace('<section class="hero">',yearTruthBanner()+'<section class="hero">');};
const _studyBeforeYearTruth=study;
study=function(){const html=_studyBeforeYearTruth();return html.replace('<div class="page">','<div class="page">'+yearTruthBanner());};
const _settingsBeforeYearTruth=settings;
settings=function(){const html=_settingsBeforeYearTruth();return html.replace('<div class="pagehead">',yearTruthBanner()+'<div class="pagehead">');};
