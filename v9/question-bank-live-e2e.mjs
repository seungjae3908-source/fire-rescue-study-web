import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
const conceptId=process.env.STUDY_119_QUESTION_CONCEPT||'E04-C02';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const page=await ctx.newPage();page.setDefaultTimeout(90000);
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});

  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.QuestionFactory119,{timeout:60000});
  const head=await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'');
  if(expected)assert(head===expected,'preview exactHead '+expected);

  const truth=await page.evaluate(id=>{
    const V=window.AITUTOR_V9,qs=V.QuestionQuality119.forConcept(id),d={low:0,mid:0,high:0};
    for(const q of qs)d[q.difficulty]=(d[q.difficulty]||0)+1;
    return{
      id,
      total:qs.length,
      difficulty:d,
      allExam:qs.every(q=>V.QuestionQuality119.isExamStyle(q)),
      allP:qs.every(q=>q.grade==='P'),
      allGenerated:qs.every(q=>q.generatedPractice===true&&q.generatedBy==='119-grounded-question-factory-v1'),
      allFourChoices:qs.every(q=>q.choices?.length===4&&new Set(q.choices).size===4),
      allFourExplanations:qs.every(q=>q.choiceExplanations?.length===4&&q.choiceExplanations.every(x=>String(x).trim().length>=8)),
      pastExamClaim:qs.some(q=>q.pastExam===true||q.actualPastQuestion===true||/기출|실제\s*시험문제/.test(String(q.q))),
      factoryGenerated:V.QuestionFactory119.generated,
      readiness:V.examReadiness()
    };
  },conceptId);
  assert(truth.total===6,conceptId+' exposes exactly 6 exam-style questions');
  assert(truth.difficulty.low>=1&&truth.difficulty.mid>=2&&truth.difficulty.high>=1,conceptId+' difficulty mix low/mid/high contract '+JSON.stringify(truth.difficulty));
  assert(truth.allExam&&truth.allP&&truth.allGenerated,conceptId+' questions are exam-style but remain generated P-grade practice');
  assert(truth.allFourChoices&&truth.allFourExplanations,conceptId+' every question has 4 unique choices + 4 meaningful explanations');
  assert(!truth.pastExamClaim,conceptId+' generated practice makes no past-exam claim');
  assert(truth.factoryGenerated===962,'factory generated only the audited 962-question shortfall');
  assert(truth.readiness.ready===false,'real mock remains fail-closed despite practice bank expansion');

  await page.evaluate(()=>window.AITUTOR_V9.App.go('study'));
  await page.waitForSelector('.workspace');
  await page.evaluate(id=>window.AITUTOR_V9.App.chooseConcept(id),conceptId);
  await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.conceptId===id,conceptId);
  await page.waitForSelector('.book-mobile');
  const count=await page.locator('#book-quiz .question-card').count();
  assert(count===6,'mobile electronic textbook renders six confirmation question cards');

  const cards=page.locator('#book-quiz .question-card');
  for(let i=0;i<6;i++){
    const card=cards.nth(i);
    assert(await card.locator('.choices .choice').count()===4,'question '+(i+1)+' renders four choices');
    const toolbar=await card.locator('.toolbar').textContent();
    assert(toolbar.includes('근거 P'),'question '+(i+1)+' visibly stays P-grade practice');
    assert(/난이도\s*(하|중|상)/.test(toolbar),'question '+(i+1)+' displays difficulty');
  }

  const first=await page.evaluate(id=>{
    const V=window.AITUTOR_V9,q=V.QuestionQuality119.forConcept(id)[0];
    return{id:q.id,a:q.a,q:q.q};
  },conceptId);
  await page.locator(`#book-quiz [data-answer="${first.id}:${first.a}"]`).click();
  const firstCard=page.locator('#book-quiz .question-card').first();
  await firstCard.locator('.choice-explanations').waitFor();
  assert(await firstCard.locator('.choice-explanations .choice-explain').count()===4,'answered question shows all four option explanations');
  assert((await firstCard.locator('.answer-source').textContent()).includes('출처:'),'answered question shows its source');
  const cardText=await firstCard.textContent();
  assert(!/기출문제|실제\s*기출|실제\s*시험문제/.test(cardText),'question UI does not present generated practice as past exam');

  const size=await page.evaluate(()=>({doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth]}));
  assert(size.doc[0]<=size.doc[1]+1&&size.body[0]<=size.body[1]+1,'390px question textbook has no horizontal overflow');
  assert(errors.length===0,'question-bank mobile runtime errors = 0 '+errors.join(' | '));

  console.log('QUESTION_BANK_LIVE_ACCEPTANCE_SUCCESS',JSON.stringify({truth,first,size}));
  await ctx.close();
}finally{await browser.close()}
