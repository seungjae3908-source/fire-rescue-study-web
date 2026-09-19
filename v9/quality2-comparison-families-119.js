'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},P=V.contentPacks?.authored,C=V.curriculum;
if(!P||!C?.byId)return;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const key=s=>norm(s).toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const clip=(s,n=150)=>{const t=norm(s);return t.length>n?t.slice(0,n-1)+'…':t};
const uniq=rows=>{const out=[],seen=new Set();for(const x of rows||[]){const t=norm(x),k=key(t);if(!t||seen.has(k))continue;seen.add(k);out.push(t)}return out};

const families=[
  {key:'fire-org',title:'소방조직 역할 비교',ids:['F01-C01','F01-C02','F01-C03','F01-C04','F01-C05']},
  {key:'disaster-cycle',title:'재난관리 기능 비교',ids:['F02-C01','F02-C02','F02-C03','F02-C04','F02-C05','F02-C06','F02-C07']},
  {key:'heat-combustion',title:'열·연소 기초 구분',ids:['F03-C02','F03-C03','F03-C04','F03-C05']},
  {key:'fire-transition',title:'구획화재 특수현상 비교',ids:['F03-C06','F03-C09','F03-C10','F03-C11']},
  {key:'tank-overflow',title:'유류탱크 특수현상 비교',ids:['F03-C12','F03-C13','F03-C14']},
  {key:'special-fire',title:'특수화재·폭발현상 비교',ids:['F03-C08','F03-C15','F03-C16']},
  {key:'extinguishing-agent',title:'소화약제 비교',ids:['F04-C03','F04-C04','F04-C05','F04-C06','F04-C07','F04-C08']},
  {key:'hazmat-class',title:'위험물 제1~6류 비교',ids:['F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07']},
  {key:'fire-investigation',title:'화재조사 단계·목적 비교',ids:['F06-C01','F06-C02','F06-C03','F06-C04']},
  {key:'hydrant',title:'소화전·소화기구 비교',ids:['F07-C02','F07-C03','F07-C04']},
  {key:'sprinkler-types',title:'스프링클러 방식 비교',ids:['F07-C05','F07-C06','F07-C17','F07-C18','F07-C19','F07-C20']},
  {key:'sprinkler-components',title:'스프링클러 구성·헤드 비교',ids:['F07-C16','F07-C21']},
  {key:'fixed-extinguishing',title:'고정식 소화설비 비교',ids:['F07-C07','F07-C08','F07-C09','F07-C10']},
  {key:'detection-alarm',title:'감지·경보설비 비교',ids:['F07-C11','F07-C12']},
  {key:'support-facilities',title:'피난·용수·소방활동 지원설비 비교',ids:['F07-C13','F07-C14','F07-C15']},

  {key:'ems-system',title:'응급의료체계·법적역할 비교',ids:['E01-C01','E01-C02','E01-C03']},
  {key:'rescuer-wellbeing',title:'대원 스트레스·안전 비교',ids:['E02-C01','E02-C02']},
  {key:'infection-control',title:'감염예방·소독·관리 비교',ids:['E03-C01','E03-C02','E03-C03','E03-C04']},
  {key:'communication-record',title:'의사소통·통신·기록 비교',ids:['E05-C01','E05-C02','E05-C03','E05-C04']},
  {key:'patient-movement',title:'환자 이동 원칙 비교',ids:['E06-C01','E06-C02','E06-C03','E06-C04','E06-C05']},
  {key:'ems-equipment',title:'응급의료 장비 목적 비교',ids:['E07-C01','E07-C02','E07-C03','E07-C04','E07-C05']},
  {key:'patient-assessment',title:'환자평가 단계 비교',ids:['E08-C01','E08-C02','E08-C03','E08-C04','E08-C05','E08-C06']},
  {key:'airway-care',title:'기도·호흡 처치 비교',ids:['E09-C01','E09-C02','E09-C03','E09-C04','E09-C05','E09-C06','E09-C07','E09-C08']},
  {key:'respiratory-emergency',title:'호흡 이상·특수상황 비교',ids:['E10-C01','E10-C02','E10-C03','E10-C04','E10-C05']},
  {key:'cardiac-emergency',title:'심장응급·제세동 체계 비교',ids:['E11-C01','E11-C02','E11-C03','E11-C04','E11-C05','E11-C06']},
  {key:'abdominal-emergency',title:'급성복통 평가·처치 비교',ids:['E12-C01','E12-C02','E12-C03','E12-C04','E12-C05']},
  {key:'bleeding-shock',title:'출혈·쇼크 비교',ids:['E13-C01','E13-C02','E13-C03','E13-C04','E13-C05']},
  {key:'soft-tissue-burn',title:'연부조직·화상 비교',ids:['E14-C01','E14-C02','E14-C03']},
  {key:'musculoskeletal',title:'근골격계 손상 비교',ids:['E15-C01','E15-C02','E15-C03']},
  {key:'head-spine',title:'머리·척추손상 비교',ids:['E16-C01','E16-C02','E16-C03','E16-C04']},
  {key:'altered-mental',title:'의식장애 원인 비교',ids:['E17-C01','E17-C02','E17-C03','E17-C04']},
  {key:'poison-allergy',title:'중독·알레르기 비교',ids:['E18-C01','E18-C02']},
  {key:'environmental',title:'환경응급 비교',ids:['E19-C01','E19-C02','E19-C03','E19-C04','E19-C05']},
  {key:'obstetric',title:'산과·분만 상황 비교',ids:['E20-C01','E20-C02','E20-C03','E20-C04','E20-C05','E20-C06']},
  {key:'pediatric',title:'소아 평가·처치 비교',ids:['E21-C01','E21-C02','E21-C03','E21-C04','E21-C05','E21-C06','E21-C07','E21-C08']},
  {key:'geriatric',title:'노인환자 접근 비교',ids:['E22-C01','E22-C02','E22-C03']},
  {key:'behavioral',title:'행동응급 상황 비교',ids:['E23-C01','E23-C02','E23-C03']},
  {key:'bls',title:'기본소생술 단계 비교',ids:['E24-C01','E24-C02','E24-C03','E24-C04','E24-C05']}
];

function rowFor(id){
  const c=C.byId[id],p=P[id];if(!c||!p)return null;
  const feature=uniq([...(p.features||[]),...(p.must||[]),...(p.detail||[])])[0]||p.summary||'';
  const second=uniq([...(p.must||[]),...(p.features||[]),...(p.detail||[])]).find(x=>key(x)!==key(feature));
  const desc=clip([feature,second].filter(Boolean).join(' · '),175);
  return desc?[c.title,desc]:null
}
const memberIds=new Set(),applied=[];
for(const fam of families){
  const ids=fam.ids.filter(id=>C.byId[id]&&P[id]?.status==='verified');
  if(ids.length<2)continue;
  const rows=ids.map(rowFor).filter(Boolean);
  if(rows.length<2)continue;
  for(const id of ids){
    memberIds.add(id);
    const p=P[id];
    const authored=(p.compare||[]).length>=2&&!p.compareDerived;
    if(!authored){
      p.compare=rows.map(r=>[...r]);
      p.compareDerived='semantic-family';
    }
    p.compareFamily={key:fam.key,title:fam.title,members:ids.slice()};
    applied.push(id)
  }
}
V.Quality2ComparisonFamilies119={
  version:'119-quality2-semantic-comparison-v1',
  families:families.map(f=>({key:f.key,title:f.title,ids:f.ids.slice()})),
  memberIds:[...memberIds],
  applied:[...new Set(applied)],
  policy:'comparison tables are grouped by curated semantic family; authored comparisons are preserved and arbitrary adjacent-concept fallback is forbidden'
};
})();