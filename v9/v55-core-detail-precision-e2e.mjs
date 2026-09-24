import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1024,height:768},deviceScaleFactor:1});
  const page=await ctx.newPage();page.setDefaultTimeout(45000);
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Store&&!!window.AITUTOR_V9?.ConceptArchitecture119);
  const ids=await page.evaluate(()=>window.AITUTOR_V9.curriculum.concepts.map(x=>x.id));
  assert(ids.length===183,'all 183 concepts are available for V55 core/detail precision audit');
  const issues=[],types=new Set();
  for(const id of ids){
    await page.evaluate(id=>{const V=window.AITUTOR_V9,c=V.curriculum.byId[id],s=V.Store.state;s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=id;s.studyTab='core';s.outline=false;V.Store.save();V.App.render()},id);
    await page.waitForSelector('.page-study .study-body-desktop .core-view');
    const core=await page.locator('.page-study .study-body-desktop .core-view').evaluate(root=>{
      const V=window.AITUTOR_V9,id=V.Store.state.conceptId,p=V.contentPacks.get(id)||{};
      return{
        quick:root.querySelectorAll('.study-quick').length,
        essentials:root.querySelectorAll('.study-core-essentials li').length,
        numbers:root.querySelectorAll('.study-numbers li').length,
        traps:root.querySelectorAll('.study-traps li').length,
        compareRows:root.querySelectorAll('.study-core-compare-row').length,
        expectedCompare:(p.compare||[]).filter(x=>Array.isArray(x)&&x[0]&&x[1]).length
      }
    });
    if(core.quick!==1||core.essentials<1||core.essentials>5||core.numbers>6||core.traps>3||core.compareRows>4||(core.expectedCompare>=2&&core.compareRows<2))issues.push({id,where:'core',core});

    await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='detail';V.Store.save();V.App.render()});
    await page.waitForSelector('.page-study .study-body-desktop .detail-view');
    const detail=await page.locator('.page-study .study-body-desktop .detail-view').evaluate(root=>{
      const V=window.AITUTOR_V9,id=V.Store.state.conceptId,type=V.ConceptArchitecture119.typeOf(id);
      const headings=[...root.querySelectorAll('.detail-section h3,.detail-compare h3,.detail-criteria h3,.detail-exam-points h3')].map(x=>x.textContent.trim()).filter(Boolean);
      const select=root.querySelector('[data-detail-jump-select]');
      return{
        type,
        toc:!!root.querySelector('.detail-toc'),
        sourceButton:!!root.querySelector('[data-source-concept]'),
        options:select?[...select.options].filter(x=>x.value).length:0,
        definition:root.querySelectorAll('[data-detail-section="definition"]').length,
        headings,
        generic:headings.some(x=>/^상세\s*설명$/.test(x)),
        criteria:root.querySelectorAll('.detail-criteria li').length,
        duplicateHeading:new Set(headings.map(x=>x.replace(/\s+/g,''))).size<headings.length
      }
    });
    types.add(detail.type);
    if(!detail.toc||!detail.sourceButton||detail.options<2||detail.definition!==1||detail.headings.length<2||detail.generic||detail.criteria>12)issues.push({id,where:'detail',detail});
  }
  console.log('V55_CORE_DETAIL_PRECISION_TYPES',JSON.stringify([...types].sort()));
  if(issues.length){console.error('V55_CORE_DETAIL_PRECISION_ISSUES',JSON.stringify(issues.slice(0,80),null,2));throw new Error('V55_CORE_DETAIL_PRECISION_FAILED '+issues.length)}
  assert(types.size>=12,'precision audit covers the major fire/EMS concept architecture families');

  const precisionCases=[
    ['F03-C06',['플래시오버','백드래프트','롤오버','산소부족']],
    ['F02-C02',['재난관리책임기관','재난관리주관기관','관계 중앙행정기관','별표 1의3']],
    ['F05-C08',['물질성상','물과의 반응성','보일오버','슬롭오버','프로스오버']],
    ['F07-C14',['소화수조','저수조','채수구','흡수관투입구','2m','20㎥','65mm','4.5m']]
  ];
  for(const [id,terms] of precisionCases){
    await page.evaluate(id=>{const V=window.AITUTOR_V9,c=V.curriculum.byId[id],s=V.Store.state;s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=id;s.studyTab='detail';V.Store.save();V.App.render()},id);
    await page.waitForSelector('.page-study .study-body-desktop .detail-view');
    const text=await page.locator('.page-study .study-body-desktop .detail-view').innerText();
    for(const term of terms)assert(text.includes(term),id+' detail keeps precise verified term: '+term);
  }

  await page.evaluate(()=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['F07-C14'],s=V.Store.state;s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='core';V.Store.save();V.App.render()});
  await page.waitForSelector('.page-study .study-body-desktop .core-view .study-numbers .study-key-emphasis');
  const underline=await page.locator('.page-study .study-body-desktop .core-view .study-numbers .study-key-emphasis').first().evaluate(el=>getComputedStyle(el).textDecorationLine);
  assert(underline.includes('underline'),'core numeric emphasis uses a real underline instead of broad background coloring');
  const waterCore=await page.locator('.page-study .study-body-desktop .core-view').evaluate(root=>({numbers:root.querySelectorAll('.study-numbers li').length,compare:root.querySelectorAll('.study-core-compare-row').length,traps:root.querySelectorAll('.study-traps li').length}));
  assert(waterCore.numbers<=6&&waterCore.compare>=2&&waterCore.traps<=3,'dense water-supply concept stays concise while preserving decisive comparisons');

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='detail';V.Store.save();V.App.render()});
  await page.waitForSelector('.page-study .study-body-desktop .detail-view');
  const waterDetail=await page.locator('.page-study .study-body-desktop .detail-view').evaluate(root=>({toc:[...root.querySelector('[data-detail-jump-select]').options].map(x=>x.textContent.trim()),criteria:root.querySelectorAll('.detail-criteria li').length,compare:root.querySelectorAll('.detail-compare .concept-class-card').length,text:root.innerText}));
  assert(waterDetail.toc.some(x=>x.includes('수치'))&&waterDetail.toc.some(x=>x.includes('비교')),'dense detail exposes direct jumps to comparison and numeric criteria');
  assert(waterDetail.criteria>=4&&waterDetail.compare>=4,'water-supply detail keeps the precise numeric and distinction depth');

  await ctx.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
  const m=await mobile.newPage();await m.goto(base,{waitUntil:'domcontentloaded'});await m.waitForFunction(()=>!!window.AITUTOR_V9?.App);
  await m.evaluate(()=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['F03-C06'],s=V.Store.state;s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='detail';s.outline=false;V.Store.save();V.App.render()});
  await m.waitForSelector('.page-study .study-body-mobile .detail-view .detail-toc');
  const mobileToc=await m.locator('.page-study .study-body-mobile .detail-view .detail-toc').evaluate(el=>{const r=el.getBoundingClientRect();return{w:r.width,vw:innerWidth,position:getComputedStyle(el).position,select:!!el.querySelector('select'),source:!!el.querySelector('[data-source-concept]')}});
  assert(mobileToc.w<=mobileToc.vw&&mobileToc.select&&mobileToc.source,'mobile detail quick navigation and source action fit inside the viewport');
  await mobile.close();

  console.log('V55_CORE_DETAIL_PRECISION_ACCEPTANCE_SUCCESS');
}finally{await browser.close()}
