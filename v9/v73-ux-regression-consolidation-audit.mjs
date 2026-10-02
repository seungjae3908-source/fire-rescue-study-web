import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const app=read('./app.js');
const css=read('./v54-responsive.css');
const sourcePdf=read('./source-pdf.js');
const passNote=read('./pass-note.js');
const sw=read('./sw.js');
const boot8=read('./boot-v69-8.js');
const boot7b=read('./boot-v69-7b.js');

const checks=[
  ['home shortcut removed',!app.includes('<b>바로가기</b>')],
  ['compact single-column home',app.includes('dashboard-home-compact')&&css.includes('.page-home .dashboard-home-compact')],
  ['member-only gate',app.includes('function loginGate()')&&app.includes('function memberGateRequired()')&&app.includes('if(memberGateRequired())return loginGate()')&&app.includes('MEMBER ONLY')],
  ['guest boot skips question bank',app.includes("await V.Auth?.init?.();")&&app.includes("if(!memberGateRequired()){if(V.Lazy119")],
  ['single study body',(app.match(/study-body-unified/g)||[]).length===1&&(app.match(/class="actionbar concept-nav/g)||[]).length===1],
  ['one concept nav',(app.match(/class="actionbar concept-nav/g)||[]).length===1],
  ['distinct question pager',app.includes('← 이전 문제')&&app.includes('다음 문제 →')],
  ['core textbook page scrub',app.includes('studentStudyText')&&app.includes('(?:p|페이지|쪽)\\s*(?:에서는?|에서도|에선|에서|에는|의|기준으로|기준에서|에\\s*따르면)?')],
  ['exam hub split',app.includes('data-exam-hub="mock"')&&app.includes('data-exam-hub="training"')],
  ['exam current PDF export',app.includes('data-exam-print=')&&app.includes('printExamRound')],
  ['exam editable round export',app.includes('data-exam-doc=')&&app.includes('downloadExamRoundDoc')],
  ['exam ZIP all/round folders',app.includes('전체본/')&&app.includes('회차본/')&&app.includes('application/zip')],
  ['wrong training disabled when empty',app.includes('const disabled=wrongN===0?')],
  ['pass-note PDF upload restored',app.includes('id="passNotePdf"')&&app.includes('V.PrivateDocs.ingest')&&app.includes('createFromPrivateDoc')],
  ['uploaded PDF filter visible',app.includes("['doc','PDF자료']")],
  ['uploaded PDF subject persisted',passNote.includes("createFromPrivateDoc(docId,title,subject='')")&&passNote.includes("subject:subject==='ems'")],
  ['print headers suppressed by page margin',passNote.includes('@page{size:A4;margin:0}')&&passNote.includes('@media print{body{padding:9mm')],
  ['precise evidence geometry',sourcePdf.includes('markLeft')&&sourcePdf.includes('markRight')&&sourcePdf.includes('markExact')],
  ['precise evidence runtime marker',sourcePdf.includes('pdfjs-v16-range-remote-cache-epoch-precise-evidence-ranges')],
  ['V73 responsive contract',css.includes('.concept-nav-single')&&css.includes('.exam-hub-tabs')&&css.includes('.note-upload-card')&&css.includes('.dashboard-home-compact')],
  ['service worker epoch bumped',sw.includes('v82-auth-ux')],
  ['boot8 synced',boot8.includes('dashboard-home-compact')&&boot8.includes('id="passNotePdf"')&&boot8.includes('data-exam-bundle')],
  ['boot7b synced',boot7b.includes('pdfjs-v16-range-remote-cache-epoch-precise-evidence-ranges')&&boot7b.includes("createFromPrivateDoc(docId,title,subject='')")]
];

const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks)console.log((ok?'PASS':'FAIL')+' '+name);
if(failed.length){
  console.error('\\nV73 UX audit failed: '+failed.map(([name])=>name).join(', '));
  process.exit(1);
}
console.log('\\nV73 UX regression consolidation audit passed ('+checks.length+'/'+checks.length+').');
