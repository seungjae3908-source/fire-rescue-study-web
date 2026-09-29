import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const app=read('./app.js');
const boot8=read('./boot-v69-8.js');
const sourcePdf=read('./source-pdf.js');
const boot7b=read('./boot-v69-7b.js');
const css=read('./v54-responsive.css');
const sw=read('./sw.js');
const questions=read('./questions-governance-depth-119.js');

const checks=[
  ['login grid reset',css.includes('.login-gate-shell{')&&css.includes('grid-template-columns:minmax(0,1fr)!important')&&css.includes('grid-template-rows:minmax(0,1fr)!important')],
  ['home content rows are intrinsic',css.includes('grid-auto-rows:max-content!important')&&css.includes('.page-home .dashboard-topline')],
  ['quiz removes concept pager',app.includes("${tab==='quiz'?'':`<footer class=\"actionbar concept-nav concept-nav-single mobile-study-nav\">")],
  ['answered question can retry',app.includes('data-question-retry="${esc(q.id)}"')&&app.includes('if(b.dataset.questionRetry)')],
  ['question identity reaches source viewer',app.includes('data-source-question="${esc(q.id)}"')&&app.includes('data-question-id="${esc(questionId)}"')&&app.includes('questionSourceEvidence(question)')],
  ['question source page parser',app.includes('function questionSourceBookPage')&&app.includes('questionBookPage=questionSourceBookPage(question,key,c)')&&app.includes('questionBookFrom=questionSourceBookPage(question,key,c)')&&app.includes('targetBookFrom=questionBookFrom||bookFrom')],
  ['question evidence does not accept broad hit counts',app.includes("(!questionEvidenceMode&&result.hits>=2)")&&app.includes("(!question&&anchorResult.hits>=2)")],
  ['exact PDF underline only',sourcePdf.includes('exactEvidence=evidence.filter(x=>x.markExact)')&&sourcePdf.includes('for(const line of exactEvidence)')&&sourcePdf.includes("mark.dataset.exact='true'")],
  ['underline tokens prefer anchors',sourcePdf.includes('anchorTokens.length?anchorTokens:tokens')],
  ['split PDF spans retain exact underline geometry',sourcePdf.includes("const joined=parts.map(x=>x.item.n).join('')")&&sourcePdf.includes('const a=Math.max(start,part.start),b=Math.min(end,part.end)')],
  ['mobile PDF tools collapsed',app.includes('<details class="pdf-mobile-tools">')&&css.includes('.pdf-mobile-tools:not([open])>.pdf-mobile-tools-body{display:none!important}')],
  ['tablet desktop PDF tools auto-expand',app.includes("function syncPdfToolsDisclosure(root=document)")&&app.includes("matchMedia('(min-width:721px)').matches")&&app.includes("syncPdfToolsDisclosure(document.querySelector('#resourcePdf'))")&&app.includes("syncPdfToolsDisclosure(document.querySelector('#pdfEvidence'))")],
  ['mobile scroll safe area',css.includes('padding-bottom:calc(var(--mobile-nav) + 16px + env(safe-area-inset-bottom))!important')],
  ['correct answer explanation not duplicated',app.includes('q.choiceExplanations&&')===false&&app.includes('ans!==q.a&&q.choiceExplanations[ans]')],
  ['known exact-page fixture',questions.includes("['119-gov-f01-01b'")&&questions.includes("source:id==='119-gov-f01-01b'?'소방법령2 · 소방기본법 46쪽'")],
  ['app bundle synced',boot8.includes('data-question-retry="${esc(q.id)}"')&&boot8.includes('questionSourceEvidence(question)')&&boot8.includes('<details class="pdf-mobile-tools">')],
  ['source bundle synced',boot7b.includes('exactEvidence=evidence.filter(x=>x.markExact)')&&boot7b.includes('anchorTokens.length?anchorTokens:tokens')],
  ['service-worker cache bumped',sw.includes('v73-ux-regression-consolidation-v74-mobile-answer-source')]
];

const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks)console.log((ok?'PASS':'FAIL')+' '+name);
if(failed.length){
  console.error('\nV74 mobile answer/source audit failed: '+failed.map(([name])=>name).join(', '));
  process.exit(1);
}
console.log('\nV74 mobile answer/source audit passed ('+checks.length+'/'+checks.length+').');
