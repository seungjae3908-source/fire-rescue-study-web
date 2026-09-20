import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{},AITUTOR_V9_CONFIG:{}};
for(const file of ['curriculum.js','curriculum-complete-2026.js','source-catalog-119.js','exam-version-119.js']){
  vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});
}
const V=window.AITUTOR_V9;
const audit=V.ExamVersion119?.audit?.();
const store=fs.readFileSync(new URL('./store.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');

const checks={
  moduleReady:!!audit?.ready,
  target2027:audit?.targetExamYear===2027,
  baseline2026:audit?.contentBaselineYear===2026,
  profileTargetMatches:store.includes("examYear:'2027'"),
  appShowsTruthCard:app.includes('exam-version-card')&&app.includes('contentBaselineYear'),
  runtimeLoadsAfterCatalog:index.indexOf('source-catalog-119.js')>=0&&index.indexOf('exam-version-119.js')>index.indexOf('source-catalog-119.js'),
  offlineCachesContract:sw.includes("'./exam-version-119.js'"),
  noSilent2027Claim:audit?.targetYearOfficialScopeConfirmed===false,
  noChangeNoNotify:audit?.meaningfulChangeCount===0&&V.ExamVersion119.policy.noChangeNoNotify===true
};
const blockers=[
  ...(audit?.blockers||[]),
  ...Object.entries(checks).filter(([,v])=>!v).map(([k])=>'contract:'+k)
];
const result={
  version:'119-exam-version-audit-v1',
  targetExamYear:audit?.targetExamYear,
  contentBaselineYear:audit?.contentBaselineYear,
  officialSourceYears:audit?.officialSourceYears,
  meaningfulChangeCount:audit?.meaningfulChangeCount,
  checks,
  blockers,
  ready:blockers.length===0
};
console.log('EXAM_VERSION_119',JSON.stringify(result,null,2));
if(blockers.length)throw new Error('EXAM_VERSION_TRUTH_FAILED '+JSON.stringify(blockers));
console.log('EXAM_VERSION_TRUTH_COMPLETE');