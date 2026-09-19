import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');

const requiredDetailSignals=[
  {id:'F-ORG-HISTORY',subject:'fire',title:'소방 발전과정',refs:['F01-C01'],terms:['발전과정','발전 과정','소방행정체제']},
  {id:'F-ORG-MGMT',subject:'fire',title:'조직관리 기초이론',refs:['F01-C01'],terms:['조직관리','조직 관리']},
  {id:'F-ORG-RES',subject:'fire',title:'인적·물적·재정적 자원관리',refs:['F01-C02','F01-C03'],terms:['인적','물적','재정']},
  {id:'F-ORG-PRIVATE',subject:'fire',title:'민간 소방조직·안전관리·설계시공감리점검',refs:['F01-C05'],terms:['소방안전관리','위험물안전관리','감리','점검']},
  {id:'F-FAC-PROP',subject:'fire',title:'포 혼합장치 4종',refs:['F07-C08'],terms:['라인프로포셔너','펌프프로포셔너','프레셔프로포셔너','프레셔사이드프로포셔너']},
  {id:'F-FIRE-FOUR',subject:'fire',title:'플레임오버·롤오버·플래시오버·백드래프트 비교',refs:['F03-C09'],terms:['플레임오버','롤오버','플래시오버','백드래프트']},
  {id:'E-GEN-QUALITY',subject:'ems',title:'교육·질관리',refs:['E01-C01'],terms:['교육','질관리']},
  {id:'E-GEN-PRO',subject:'ems',title:'역할·책임·전문성 유지',refs:['E01-C03'],terms:['역할','책임','전문']},
  {id:'E-TRN-AMB',subject:'ems',title:'구급차 운용·관리',refs:['E06-C01','E06-C04'],terms:['구급차','운용']},
  {id:'E-TRN-AIR',subject:'ems',title:'항공이송',refs:['E01-C03'],terms:['항공','이송']},
  {id:'E-MCI-DETAIL',subject:'ems',title:'대량재난·START·분산이송',refs:['E05-C04'],terms:['START','중증도분류','이송']},
  {id:'E-CBRN-DETAIL',subject:'ems',title:'CBRN·제독·2차오염',refs:['E03-C05'],terms:['제독','오염']},
  {id:'E-ROSC',subject:'ems',title:'소생 후 치료',refs:['E11-C03'],terms:['자발순환','소생후']},
  {id:'E-ACS',subject:'ems',title:'급성관상동맥증후군',refs:['E11-C02'],terms:['급성관상동맥','심근경색']},
  {id:'E-PULM',subject:'ems',title:'급성폐부종·심인성쇼크',refs:['E11-C02'],terms:['폐부종','심인성']},
  {id:'E-SPECIAL-ARREST',subject:'ems',title:'특수상황 심정지',refs:['E11-C03'],terms:['심정지']},
  {id:'E-STROKE',subject:'ems',title:'허혈성 뇌졸중',refs:['E17-C04'],terms:['뇌졸중']},
  {id:'E-PALS',subject:'ems',title:'소아 전문소생술',refs:['E21-C04','E21-C05'],terms:['소아','서맥','빈맥']},
  {id:'E-NRP',subject:'ems',title:'신생아소생술',refs:['E20-C03'],terms:['신생아','소생']},
  {id:'E-CHEST',subject:'ems',title:'흉부손상',refs:['E14-C02'],terms:['기흉','흉']},
  {id:'E-ABD-PELVIS',subject:'ems',title:'복부·골반손상',refs:['E14-C02'],terms:['복부','골반']},
  {id:'E-MULTITRAUMA',subject:'ems',title:'다발성·중증외상',refs:['E14-C02'],terms:['중증외상']},
  {id:'E-GU',subject:'ems',title:'비뇨생식기계 응급',refs:['E12-C05'],terms:['비뇨','콩팥','신장','요로']},
  {id:'E-HEMA',subject:'ems',title:'조혈계 응급',refs:['E12-C05'],terms:['빈혈','혈소판','조혈','백혈']},
  {id:'E-INF',subject:'ems',title:'감염질환 응급',refs:['E03-C04'],terms:['감염']},
  {id:'E-ENT',subject:'ems',title:'눈·귀·코·목 응급',refs:['E12-C05'],terms:['눈','귀','코','목']},
  {id:'E-MSK-MED',subject:'ems',title:'비외상성 근골격계 응급',refs:['E15-C01'],terms:['비외상','퇴행','관절염','통풍']}
];

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.CoverageMap119&&!!window.AITUTOR_V9?.QuestionQuality119);

  const result=await page.evaluate(({requiredDetailSignals})=>{
    const V=window.AITUTOR_V9,norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
    const conceptRows=V.curriculum.concepts.map(c=>{
      const p=V.contentPacks.get(c.id),qs=V.QuestionQuality119.forConcept(c.id)||[],sourceRanges=c.sourceRanges||[];
      const deep=p.deepSections||[],text=[p.summary,...(p.detail||[]),...deep.flatMap(x=>[x.title,x.body,...(x.bullets||[])]),...(p.must||[]),...(p.traps||[])].filter(Boolean).join(' ');
      const important=/플래시오버|백드래프트|위험물|스프링클러|포소화|심정지|소생술|쇼크|환자 평가|기도|호흡|뇌졸중|화상|출혈/.test(c.title);
      const questionTarget=important?20:12;
      const gates={
        verified:p.status==='verified',
        source:sourceRanges.length>0||/쪽|법|공식|가이드라인/.test(String(p.source||'')),
        summary:String(p.summary||'').length>=35,
        depth:text.length>=650,
        must:(p.must||[]).length>=3,
        trap:(p.traps||[]).length>=1,
        deep:deep.length>=3,
        questions:qs.length>=questionTarget,
        fourChoice:qs.every(q=>q.choices?.length===4&&q.choiceExplanations?.length===4)
      };
      const failures=Object.entries(gates).filter(([,v])=>!v).map(([k])=>k);
      return{id:c.id,subject:c.subject,scope:c.scopeTitle,title:c.title,questionTarget,questions:qs.length,textLength:text.length,gates,failures,ready:failures.length===0};
    });
    const detailRows=requiredDetailSignals.map(t=>{
      const packs=t.refs.map(id=>({id,c:V.curriculum.byId[id],p:V.contentPacks.get(id)})).filter(x=>x.c&&x.p);
      const text=norm(packs.flatMap(x=>[x.c.title,x.p.summary,...(x.p.detail||[]),...(x.p.must||[]),...(x.p.traps||[]),...(x.p.deepSections||[]).flatMap(s=>[s.title,s.body,...(s.bullets||[])])]).join(' '));
      const matched=t.terms.filter(term=>text.includes(norm(term)));
      const source=packs.some(x=>(x.c.sourceRanges||[]).length||/쪽|법|공식/.test(String(x.p.source||'')));
      return{...t,matched,required:t.terms.length,source,status:source&&matched.length===t.terms.length?'covered':matched.length?'partial':'missing'};
    });
    return{
      concepts:{total:conceptRows.length,ready:conceptRows.filter(x=>x.ready).length,partial:conceptRows.filter(x=>!x.ready).length,rows:conceptRows},
      details:{total:detailRows.length,covered:detailRows.filter(x=>x.status==='covered').length,partial:detailRows.filter(x=>x.status==='partial').length,missing:detailRows.filter(x=>x.status==='missing').length,rows:detailRows}
    };
  },{requiredDetailSignals});

  const summary={
    concepts:{total:result.concepts.total,ready:result.concepts.ready,partial:result.concepts.partial},
    details:{total:result.details.total,covered:result.details.covered,partial:result.details.partial,missing:result.details.missing}
  };
  console.log('COVERAGE2_SUMMARY',JSON.stringify(summary));
  console.log('COVERAGE2_CONCEPT_BACKLOG',JSON.stringify(result.concepts.rows.filter(x=>!x.ready).map(x=>({id:x.id,title:x.title,questions:x.questions,target:x.questionTarget,failures:x.failures}))));
  console.log('COVERAGE2_DETAIL_BACKLOG',JSON.stringify(result.details.rows.filter(x=>x.status!=='covered').map(x=>({id:x.id,title:x.title,status:x.status,matched:x.matched,required:x.terms,source:x.source}))));
  if(result.concepts.partial||result.details.partial||result.details.missing){
    throw new Error('CONTENT_COVERAGE2_INCOMPLETE '+JSON.stringify(summary));
  }
  console.log('CONTENT_COVERAGE2_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
