'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const TARGET_EXAM_YEAR=2027;
const CONTENT_BASELINE_YEAR=2026;
const OFFICIAL_HOSTS=new Set(['www.nfa.go.kr','nfa.go.kr','www.nfsa.go.kr','nfsa.go.kr']);
const MEANINGFUL_CHANGE_KINDS=new Set([
  'recruitment_notice',
  'exam_subjects',
  'question_count',
  'exam_duration',
  'ems_scope',
  'fire_scope',
  'official_textbook',
  'official_clinical_standard'
]);

// Target-year evidence must be added only after an official source is confirmed.
// Empty means "do not claim a 2027 official change yet".
const targetYearEvidence=[];
const recordedChanges=[];

function officialUrl(url){
  try{return OFFICIAL_HOSTS.has(new URL(String(url||'')).hostname.toLowerCase())}catch{return false}
}
function sourceYear(row){
  const m=String(row?.label||'').match(/20\d{2}/);
  return m?Number(m[0]):null;
}
function meaningfulChanges(){
  return recordedChanges.filter(x=>
    x?.status==='confirmed'&&
    x?.meaningful===true&&
    MEANINGFUL_CHANGE_KINDS.has(x?.kind)&&
    Array.isArray(x?.officialSources)&&
    x.officialSources.length>0&&
    x.officialSources.every(officialUrl)
  );
}
function summary(){
  const docs=Object.values(V.SourceCatalog119?.catalog||{});
  const years=[...new Set(docs.map(sourceYear).filter(Number.isFinite))];
  const changes=meaningfulChanges();
  return{
    version:'119-exam-version-truth-v1',
    targetExamYear:TARGET_EXAM_YEAR,
    contentBaselineYear:CONTENT_BASELINE_YEAR,
    curriculumVersion:String(V.curriculum?.version||''),
    officialSourceYears:years,
    targetYearOfficialEvidenceCount:targetYearEvidence.filter(x=>officialUrl(x?.url)).length,
    targetYearOfficialScopeConfirmed:false,
    meaningfulChangeCount:changes.length,
    meaningfulChanges:changes,
    status:'BASELINE_OFFICIAL_TARGET_PENDING'
  };
}
function audit(){
  const docs=Object.values(V.SourceCatalog119?.catalog||{});
  const s=summary();
  const checks={
    targetSeparatedFromBaseline:TARGET_EXAM_YEAR>CONTENT_BASELINE_YEAR,
    curriculumBaselineExplicit:String(V.curriculum?.version||'').includes(String(CONTENT_BASELINE_YEAR)),
    officialCatalogPresent:docs.length>0,
    officialCatalogBaselineOnly:docs.every(x=>sourceYear(x)===CONTENT_BASELINE_YEAR),
    officialCatalogUrlsOnly:docs.every(x=>officialUrl(x?.officialPage)),
    noUnverifiedTargetEvidence:targetYearEvidence.every(x=>officialUrl(x?.url)),
    noUnverifiedMeaningfulChange:recordedChanges.every(x=>x?.status!=='confirmed'||(
      MEANINGFUL_CHANGE_KINDS.has(x?.kind)&&
      Array.isArray(x?.officialSources)&&
      x.officialSources.length>0&&
      x.officialSources.every(officialUrl)
    )),
    noSilentBaselinePromotion:s.targetYearOfficialScopeConfirmed===false&&s.contentBaselineYear===CONTENT_BASELINE_YEAR,
    noChangeNoNotify:meaningfulChanges().length===0
  };
  const blockers=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
  return{...s,checks,blockers,ready:blockers.length===0};
}
V.ExamVersion119={
  TARGET_EXAM_YEAR,
  CONTENT_BASELINE_YEAR,
  targetYearEvidence,
  recordedChanges,
  meaningfulChanges,
  summary,
  audit,
  policy:{
    officialSourcesOnly:true,
    noChangeNoNotify:true,
    targetYearNoAssumption:true,
    baselineMustStayExplicit:true,
    meaningfulChangeKinds:[...MEANINGFUL_CHANGE_KINDS]
  }
};
})();