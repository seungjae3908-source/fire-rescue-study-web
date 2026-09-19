import { chromium } from 'playwright';

const base='http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('.app');await page.waitForFunction(()=>!!window.AITUTOR_V9?.Suggestions);
  const setup=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,rows=[];
    let admin=false;
    class Q{
      constructor(table){this.table=table;this.filters=[];this.op='select'}
      select(){this.op='select';return this}
      eq(k,v){this.filters.push([k,v]);return this}
      delete(){this.op='delete';return this}
      maybeSingle(){this.single=true;return this.exec()}
      upsert(incoming){for(const row of incoming){const i=rows.findIndex(x=>x.id===row.id);if(i>=0)rows[i]={...rows[i],...row};else rows.push({...row})}return Promise.resolve({data:null,error:null})}
      then(a,b){return this.exec().then(a,b)}
      async exec(){
        if(this.table==='study_admins')return{data:admin?{user_id:'qa-user'}:null,error:null};
        if(this.table==='study_suggestions'){
          let data=rows.slice();for(const [k,v] of this.filters)data=data.filter(x=>x[k]===v);
          if(this.op==='delete'){for(const row of data){const i=rows.findIndex(x=>x.id===row.id);if(i>=0)rows.splice(i,1)}return{data:null,error:null}}
          return{data:this.single?(data[0]||null):data,error:null}
        }
        return{data:null,error:null}
      }
    }
    const client={from:t=>new Q(t)};
    V.Auth={init:async()=>({client,user:{id:'qa-user',email:'qa@example.test'}}),get client(){return client},get user(){return{id:'qa-user',email:'qa@example.test'}},get isGuest(){return false},label(){return'qa@example.test'}};
    window.__suggestQa={rows,setAdmin:v=>admin=!!v};
    V.App.runtime.suggestionsOwner='';V.App.go('suggestions');
    return true;
  });
  assert(setup,'suggestion QA fake member backend installed');
  await page.waitForSelector('.suggestions-page');
  assert(await page.locator('[data-suggest-submit]').count()===1,'member sees private suggestion form');
  await page.locator('#suggestTitle').fill('모바일 글자 정렬 개선');
  await page.locator('#suggestBody').fill('시험 화면의 긴 문장과 버튼 정렬을 더 확인해주세요.');
  await page.locator('[data-suggest-submit]').click();
  await page.waitForFunction(()=>window.__suggestQa.rows.length===1);
  assert((await page.locator('.suggestion-list').innerText()).includes('모바일 글자 정렬 개선'),'member sees own submitted suggestion');
  assert((await page.locator('.suggestion-list').innerText()).includes('접수'),'new suggestion starts in 접수 state');

  await page.evaluate(async()=>{window.__suggestQa.setAdmin(true);window.AITUTOR_V9.App.runtime.suggestionsOwner='';await window.AITUTOR_V9.Suggestions.list();window.AITUTOR_V9.App.go('suggestions')});
  await page.waitForTimeout(50);await page.evaluate(()=>{window.AITUTOR_V9.App.runtime.suggestionsOwner='';window.AITUTOR_V9.App.render()});
  await page.waitForSelector('.suggestions-page');
  await page.waitForTimeout(100);
  assert(await page.locator('[data-suggest-admin-save]').count()>=1,'admin sees reply/status controls');
  const id=await page.locator('[data-suggest-admin-save]').first().getAttribute('data-suggest-admin-save');
  await page.locator(`[data-suggest-admin-status="${id}"]`).selectOption({label:'개선완료'});
  await page.locator(`[data-suggest-admin-reply="${id}"]`).fill('개선 반영을 완료했습니다.');
  await page.locator(`[data-suggest-admin-save="${id}"]`).click();
  await page.waitForFunction(()=>window.__suggestQa.rows[0]?.status==='개선완료');
  assert(true,'admin reply flow completed');
  const row=await page.evaluate(()=>window.__suggestQa.rows[0]);
  assert(row.status==='개선완료'&&/완료/.test(row.admin_reply),'admin can set 개선완료 and store a reply');
  assert(errors.length===0,'suggestion board runtime errors = 0 ('+errors.join(' | ')+')');
  console.log('V10_SUGGESTION_QA_SUCCESS');
  await ctx.close();
}finally{await browser.close()}
