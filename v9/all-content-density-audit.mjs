import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','curriculum-ems-quality2-119.js','master-syllabus-119.js',
  'content-packs.js','fire-admin-split-119.js','questions.js','questions-fire-admin-split-119.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-ems-restored-verified-119.js','questions-hazmat-depth-119.js',
  'questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-facilities-depth-119.js','questions-restored-fire-verified-119.js','questions-quality2-119.js','questions-verified-ems-batch1-119.js','questions-verified-fire-batch1-119.js',
  'question-difficulty.js','question-quality-119.js','content-contract-119.js','depth-enrichment.js','depth-enrichment-2.js',
  'content-rich-2026.js','fire-depth-119.js','fire-visuals-119.js','governance-depth-119.js','governance-visuals-119.js',
  'investigation-depth-119.js','investigation-visuals-119.js','facilities-depth-119.js','quality2-content-119.js','facilities-visuals-119.js',
  'hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js','suppression-depth-119.js','suppression-visuals-119.js',
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','quality2-official-gap-content-119.js','quality2-ems-medical-content-119.js','quality2-fire-admin-content-119.js','quality2-global-content-119.js','quality2-comparison-families-119.js','quality4-highyield-119.js','study-emphasis-119.js',
  'quality2-study-schema-119.js','questions-calculation-119.js','questions-calculation-quality2-119.js','calculation-training-v3-119.js','questions-law-119.js','questions-special-combustible-119.js','questions-ems-gap-practice-119.js','questions-final-gap-119.js','questions-pals-advanced-119.js','questions-fire-terminology-119.js','question-bank-119.js','question-bank-quality2-119.js','questions-quality2-gap-119.js','questions-verified-ems-batch2-119.js','questions-verified-ems-batch3-119.js','questions-verified-fire-batch2-119.js','questions-verified-ems-breadth1-119.js','questions-verified-ems-breadth2-119.js','questions-verified-fire-breadth2-119.js','questions-verified-highyield4-119.js','questions-verified-fire-target1-119.js','questions-verified-fire-target2-119.js','questions-verified-ems-target1-119.js','questions-verified-ems-target2-119.js',
  'textbook-grounded-119.js','visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js','v29-reviewed-promotions-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});

const V=window.AITUTOR_V9;
const P=V.contentPacks?.authored||{};
const calcRequired=new Set(V.CalculationContract119?.requiredIds||[]);
const chars=x=>String(x||'').replace(/\s+/g,'').length;
const hasOfficialWeb=p=>(p?.officialLinks||[]).some(x=>/^https:\/\/([a-z0-9-]+\.)*(go\.kr|or\.kr)\//i.test(String(x?.url||'')));

const processExpected=/단계|절차|처치|평가|소생술|분만|이동|조사|작동|사용|확보|흡인|산소 치료|제세동|심장충격|가슴압박|제거|대응|복구|예방|대비|긴급구조|화재 진행|현장 확인|재평가|제독|부목|헬멧|경보|소화전|제연|연결송수/;
const principleExpected=/연소|화재|폭발|소화|스프링클러|감지|경보|기도|호흡|심장|쇼크|출혈|화상|중독|알레르기|질환|복통|경련|뇌졸중|당뇨|익수|열 손상|한랭|감염|패혈증|제독|Flow Path|BLEVE|가스계|분말|포소화/;
const numberExpected=/위험물|스프링클러|소화전|포소화|열량|비열|산소 치료|수액|화상|심폐소생술|가슴압박|제세동|AED|분만|소아|중증도|START|소화용수|감지기|심장충격|지정수량|계산/;
const compareExpected=/정상·비정상|분류|종류|정의·류별|화재현상|스프링클러|소화약제|출혈|쇼크|중독|알레르기|화재의 개념·유형|심장질환|호흡곤란|소아|노인|장비|해부·생리|해부와 생리/;
const visualExpected=/해부|스프링클러|플래시오버|백드래프트|롤오버|보일오버|기도|심장|쇼크|화상|분만|소아|제세동|AED|감지기|제연|Flow Path|폭발|방화구획/;

const rows=(V.curriculum?.concepts||[]).map(c=>{
  const p=P[c.id],s=V.Quality2StudySchema119?.get?.(c.id)||{},qs=V.QuestionQuality119?.forConcept?.(c.id)||[];
  const verified=(V.questions||[]).filter(q=>q.conceptId===c.id&&(q.grade==='A'||q.grade==='B')).length;
  const text=[p?.summary,...(p?.detail||[]),...(p?.deepSections||[]).flatMap(x=>[x.title,x.body,...(x.bullets||[])])].join(' ');
  const evidence=!!(c.sourceRanges||[]).length||hasOfficialWeb(p);
  const process=!!((s.timingStages?.length||0)+(s.beforeAfter?.length||0))||(s.mechanisms?.length||0)>=2;
  const principle=(s.mechanisms?.length||0)>=1;
  const numbers=(s.numbers?.length||0)>=1;
  const comparison=(s.comparison?.length||0)>=2;
  const visual=(s.visuals?.length||0)>=1;
  const calculations=(s.calculations?.length||0)>=1;
  const hard=[];
  if(!p)hard.push('pack');
  if(Math.max(chars(s.definition),chars(p?.summary))<20)hard.push('definition');
  if(chars(text)<900)hard.push('depth');
  if((p?.traps||[]).length<2)hard.push('traps');
  if((p?.must||[]).length<3)hard.push('memory');
  if(qs.length<6)hard.push('questions');
  if(!evidence)hard.push('evidence');
  if(verified<1)hard.push('verifiedQuestion');

  const semantic=[];
  if(processExpected.test(c.title)&&!process)semantic.push('process');
  if(principleExpected.test(c.title)&&!principle)semantic.push('principle');
  if((numberExpected.test(c.title)||calcRequired.has(c.id))&&!numbers)semantic.push('numbers');
  if(compareExpected.test(c.title)&&!comparison)semantic.push('comparison');
  if(calcRequired.has(c.id)&&!calculations)semantic.push('calculation');
  if(visualExpected.test(c.title)&&!visual)semantic.push('visual');

  const density=[];
  if(chars(text)<1000)density.push('depth<1000');
  if(verified<2)density.push('verified<2');
  if((p?.deepSections||[]).length<5)density.push('sections<5');

  return{
    id:c.id,title:c.title,subject:c.subject,scopeId:c.scopeId,
    chars:chars(text),sections:(p?.deepSections||[]).length,traps:(p?.traps||[]).length,must:(p?.must||[]).length,
    examStyle:qs.length,verified,
    principle:Number(principle),process:Number(process),numbers:s.numbers?.length||0,comparison:s.comparison?.length||0,
    visual:s.visuals?.length||0,calculation:s.calculations?.length||0,evidence:Number(evidence),
    hard,semantic,density
  };
});
const hard=rows.filter(x=>x.hard.length);
const semantic=rows.filter(x=>x.semantic.length).sort((a,b)=>b.semantic.length-a.semantic.length||a.verified-b.verified||a.chars-b.chars);
const density=rows.filter(x=>x.density.length).sort((a,b)=>a.verified-b.verified||a.chars-b.chars||a.id.localeCompare(b.id));
const oneVerified=rows.filter(x=>x.verified===1);
const depthUnder1000=rows.filter(x=>x.chars<1000);
const structuralOnlyDensity=rows.filter(x=>x.sections<5&&x.chars>=1000&&x.verified>=2);
const summary={
  version:'119-all-content-density-v1',
  total:rows.length,
  fire:rows.filter(x=>x.subject==='fire').length,
  ems:rows.filter(x=>x.subject==='ems').length,
  hardMissing:hard.length,
  semanticReview:semantic.length,
  densityReview:density.length,
  oneVerified:oneVerified.length,
  depthUnder1000:depthUnder1000.length,
  structuralOnlyDensity:structuralOnlyDensity.length,
  subjects:{
    fire:{semantic:semantic.filter(x=>x.subject==='fire').length,density:density.filter(x=>x.subject==='fire').length,oneVerified:oneVerified.filter(x=>x.subject==='fire').length},
    ems:{semantic:semantic.filter(x=>x.subject==='ems').length,density:density.filter(x=>x.subject==='ems').length,oneVerified:oneVerified.filter(x=>x.subject==='ems').length}
  }
};
console.log('ALL_CONTENT_DENSITY_SUMMARY',JSON.stringify(summary,null,2));
console.log('ALL_CONTENT_DENSITY_HARD_MISSING');console.table(hard);
console.log('ALL_CONTENT_DENSITY_SEMANTIC_REVIEW');console.table(semantic);
console.log('ALL_CONTENT_DENSITY_FIRE_SEMANTIC_REVIEW');console.table(semantic.filter(x=>x.subject==='fire'));
console.log('ALL_CONTENT_DENSITY_EMS_SEMANTIC_REVIEW');console.table(semantic.filter(x=>x.subject==='ems'));
console.log('ALL_CONTENT_DENSITY_FIRE_DENSITY_TOP40');console.table(density.filter(x=>x.subject==='fire').slice(0,40));
console.log('ALL_CONTENT_DENSITY_EMS_DENSITY_TOP40');console.table(density.filter(x=>x.subject==='ems').slice(0,40));
console.log('ALL_CONTENT_DENSITY_DENSITY_REVIEW_TOP80');console.table(density.slice(0,80));
console.log('ALL_CONTENT_DENSITY_ONE_VERIFIED');console.table(oneVerified);
console.log('ALL_CONTENT_DENSITY_DEPTH_UNDER_1000');console.table(depthUnder1000);
console.log('ALL_CONTENT_DENSITY_STRUCTURAL_ONLY');console.table(structuralOnlyDensity);
if(rows.length!==183)throw new Error('ALL_CONTENT_DENSITY_CURRICULUM_COUNT '+rows.length+' expected 183');
if(hard.length)throw new Error('ALL_CONTENT_DENSITY_HARD_MISSING '+JSON.stringify(hard.map(x=>({id:x.id,hard:x.hard}))));
if(semantic.length)throw new Error('ALL_CONTENT_DENSITY_SEMANTIC_GAPS '+JSON.stringify(semantic.map(x=>({id:x.id,semantic:x.semantic}))));
if(V.DensityUpgradeV13119?.targets?.length!==50||V.DensityUpgradeV13119?.applied?.length!==50)throw new Error('V13_DENSITY_UPGRADE_TARGET_COUNT '+JSON.stringify(V.DensityUpgradeV13119||null));
if(depthUnder1000.length)throw new Error('ALL_CONTENT_DENSITY_UNDER_1000_REMAINS '+JSON.stringify(depthUnder1000.map(x=>({id:x.id,chars:x.chars}))));
if(oneVerified.length)throw new Error('ALL_CONTENT_DENSITY_ONE_VERIFIED_REMAINS '+JSON.stringify(oneVerified.map(x=>({id:x.id,verified:x.verified}))));

console.log('ALL_CONTENT_DENSITY_AUDIT_COMPLETE');
