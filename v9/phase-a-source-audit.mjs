import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targets=[
  {id:'F-SCI-01',title:'원자·분자·원자량·분자량',terms:['원자량','분자량','원자와 분자','원자','분자']},
  {id:'F-SCI-02',title:'화학결합·화학반응식·산화환원',terms:['화학결합','공유결합','산화환원','산화 반응','환원 반응','화학반응식']},
  {id:'F-SCI-03',title:'물질상태·상변화·감열·잠열',priority:['현열','감열'],terms:['현열','감열','상태변화','상변화','융해열','기화열','잠열','증발잠열','융해','기화']},
  {id:'F-SCI-04',title:'기체법칙·이상기체·mol',terms:['보일의 법칙','보일 법칙','샤를의 법칙','샤를 법칙','이상기체','이상 기체','기체 상태방정식','기체상태방정식','몰질량','몰 (mole)','몰(mole)','아보가드로수','아보가드 로수','1 몰이란','1몰이란','물질량을 나타내는 국제단위']},
  {id:'F-SCI-05',title:'열량·비열·열용량 계산',terms:['열용량','비열','열량','현열','잠열']},
  {id:'F-SCI-06',title:'전도·대류·복사·복사열 계산',terms:['열전도','전도','대류','복사열','복사','스테판','Stefan']},
  {id:'F-COMB-04',title:'자연발화·축열·최소점화에너지',terms:['자연발화','자연 발화','축열','최소점화에너지','최소 점화 에너지','점화에너지']},
  {id:'F-COMB-07',title:'연소생성물·CO·CO2·HCN·연기독성',terms:['연소생성물','연소 생성물','일산화탄소','시안화수소','HCN','아크롤레인','연기독성','유독가스']},
  {id:'F-FIRE-04',title:'연료지배·환기지배·Flow Path',terms:['연료지배','연료 지배','환기지배','환기 지배','flow path','Flow Path','유동경로','흐름경로','환기구','배연구']},
  {id:'F-FIRE-05',title:'연기층·플룸·천장제트·가시거리',terms:['연기층','연기 층','플룸','plume','천장제트','천장 제트','ceiling jet','가시거리','연기 하강']},
  {id:'F-FIRE-08',title:'BLEVE·파이어볼·풀파이어·제트파이어',terms:['BLEVE','비등액체팽창증기폭발','비등 액체 팽창 증기 폭발','파이어볼','fireball','Fire Ball','풀파이어','pool fire','Pool Fire','제트파이어','jet fire','Jet Fire']},
  {id:'F-EXP-02',title:'분진폭발·가스폭발·분해폭발',terms:['분진폭발','분진 폭발','가스폭발','가스 폭발','분해폭발','분해 폭발','분진의 폭발','가연성가스 폭발']},
  {id:'F-EXP-03',title:'VCE·폭발방호',terms:['VCE','증기운폭발','증기운 폭발','UVCE','폭발방호','폭발 방호','방폭','폭발압력 방출','폭발압력방출']},
  {id:'F-BLD-04',title:'연돌효과·연기이동·피난계획',terms:['연돌효과','연돌 효과','굴뚝효과','굴뚝 효과','연기이동','연기 이동','피난계획','피난 계획','중성대','압력차']},
  {id:'F-BLD-05',title:'주방·전기·가스·금속화재',terms:['주방화재','주방 화재','식용유화재','식용유 화재','전기화재','전기 화재','가스화재','가스 화재','금속화재','금속 화재','마그네슘 화재','나트륨 화재']},
  {id:'F-SUP-03',title:'포 혼합농도·팽창비·원액량 계산',terms:['포 혼합농도','혼합농도','팽창비','포팽창비','원액량','포원액','포 원액','혼합비','발포배율']}
];
const windows={fire1:[1,80],fire2:[1,9999]};

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf,{timeout:60000});

  const rows=await page.evaluate(async ({targets,windows})=>{
    const V=window.AITUTOR_V9;
    const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
    const out=Object.fromEntries(targets.map(t=>[t.id,{...t,hits:[],matchedTerms:[]}]));
    for(const [doc,[fromBook,toBook]] of Object.entries(windows)){
      const entry=await V.SourcePDF.openPdf(doc,{timeoutMs:120000});
      const pdf=entry.pdf;
      const from=Math.max(1,V.SourcePDF.pdfPage(doc,fromBook));
      const to=Math.min(pdf.numPages,V.SourcePDF.pdfPage(doc,toBook));
      for(let pdfPage=from;pdfPage<=to;pdfPage++){
        const pg=await pdf.getPage(pdfPage);
        const tc=await pg.getTextContent();
        const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
        const compact=norm(text);
        const bookPage=V.SourcePDF.bookPage(doc,pdfPage);
        for(const t of targets){
          const row=out[t.id];
          const matches=t.terms.filter(term=>compact.includes(norm(term)));
          if(!matches.length)continue;
          for(const m of matches)if(!row.matchedTerms.includes(m))row.matchedTerms.push(m);
          if(row.hits.some(h=>h.doc===doc&&h.bookPage===bookPage))continue;
          let pos=-1,needle='';
          for(const m of matches){
            const raw=text.toLowerCase().indexOf(String(m).toLowerCase());
            if(raw>=0&&(pos<0||raw<pos)){pos=raw;needle=m}
          }
          if(pos<0){pos=0;needle=matches[0]}
          row.hits.push({
            doc,origin:entry.origin,bookPage,pdfPage,
            matched:matches,
            snippet:text.slice(Math.max(0,pos-260),Math.min(text.length,pos+1700))
          });
        }
      }
    }
    return targets.map(t=>{
      const row=out[t.id];
      row.hits=row.hits
        .map(h=>({...h,score:(h.matched||[]).reduce((n,term)=>n+norm(term).length,0)+((t.priority||[]).some(term=>(h.matched||[]).includes(term))?1000:0)}))
        .sort((a,b)=>b.score-a.score||a.bookPage-b.bookPage)
        .slice(0,16);
      return row;
    });
  },{targets,windows});

  for(const row of rows)console.log('PHASE_A_SOURCE_AUDIT',JSON.stringify(row));
  const summary={
    topics:rows.length,
    withHits:rows.filter(x=>x.hits.length>0).map(x=>x.id),
    zeroHits:rows.filter(x=>x.hits.length===0).map(x=>x.id),
    coverage:Object.fromEntries(rows.map(x=>[x.id,{pages:x.hits.map(h=>`${h.doc}:${h.bookPage}`),terms:x.matchedTerms}]))
  };
  console.log('PHASE_A_SOURCE_AUDIT_COMPLETE',JSON.stringify(summary));
  await ctx.close();
}finally{
  await browser.close();
}
