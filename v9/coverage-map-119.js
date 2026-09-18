'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const T=(id,subject,group,title,status,refs=[],meta={})=>({id,subject,group,title,status,refs,...meta});
const topics=[
  // FIRE — organization / disaster
  T('F-ORG-01','fire','소방행정','소방조직·기관·변천','covered',['F01-C01']),
  T('F-ORG-02','fire','소방행정','소방력·인력·장비·용수','covered',['F01-C02','F01-C03']),
  T('F-ORG-03','fire','소방행정','소방활동·현장권한·의용소방대','covered',['F01-C04','F01-C05']),
  T('F-DIS-01','fire','재난관리','재난 정의·유형·관리체계','covered',['F02-C01','F02-C02','F02-C03']),
  T('F-DIS-02','fire','재난관리','예방·대비·대응·복구','covered',['F02-C04','F02-C05']),
  T('F-DIS-03','fire','재난관리','긴급구조·현장지휘·상황실·보고','covered',['F02-C06','F02-C07'],{recent:'high'}),

  // FIRE — science / combustion / fire dynamics
  T('F-SCI-01','fire','소방과학','원자·분자·원자량·분자량','partial',['F03-C03'],{calc:true}),
  T('F-SCI-02','fire','소방과학','화학결합·화학반응식·산화환원','covered',['F03-C03'],{calc:true,evidence:'2026-fire1-12-16+fire2-191-299'}),
  T('F-SCI-03','fire','소방과학','물질상태·상변화·감열·잠열','covered',['F03-C02'],{calc:true,evidence:'2026-fire1-9+fire2-190+309+345'}),
  T('F-SCI-04','fire','소방과학','기체법칙·이상기체·mol','partial',['F03-C03'],{calc:true,recent:'2026'}),
  T('F-SCI-05','fire','소방과학','열량·비열·열용량 계산','partial',['F03-C02'],{calc:true}),
  T('F-SCI-06','fire','소방과학','전도·대류·복사와 복사열 계산','partial',['F03-C02'],{calc:true,recent:'2026'}),
  T('F-COMB-01','fire','연소이론','연소 4요소·연소형태·완전/불완전연소','covered',['F03-C03']),
  T('F-COMB-02','fire','연소이론','이론산소량·이론공기량·연소반응식 계산','covered',['F03-C03'],{calc:true,evidence:'2026-fire2-299-302'}),
  T('F-COMB-03','fire','연소이론','인화점·연소점·발화점','covered',['F03-C03'],{evidence:'2026-fire2-303-306'}),
  T('F-COMB-04','fire','연소이론','자연발화·축열·최소점화에너지','covered',['F03-C03'],{evidence:'2026-fire2-295-316'}),
  T('F-COMB-05','fire','연소이론','연소하한·상한·폭발범위·온도/압력 영향','covered',['F03-C03'],{calc:true,evidence:'2026-fire2-306-307'}),
  T('F-COMB-06','fire','연소이론','최소산소농도(MOC)','covered',['F04-C06'],{calc:true,recent:'2026',evidence:'2026-fire2-226'}),
  T('F-COMB-07','fire','연소이론','연소생성물·CO·CO2·HCN·연기독성','covered',['F03-C03','F03-C07'],{evidence:'2026-fire2-299+330-334'}),
  T('F-FIRE-01','fire','화재이론','화재의 정의·유형·성장단계','covered',['F03-C01','F03-C04']),
  T('F-FIRE-02','fire','화재이론','화재 진행 영향요인·구획화재','covered',['F03-C05']),
  T('F-FIRE-03','fire','화재이론','중성대·압력차·개구부 영향','covered',['F03-C07'],{recent:'2026',evidence:'2026-fire1-middle-plane'}),
  T('F-FIRE-04','fire','화재이론','연료지배·환기지배·Flow Path','covered',['F03-C05','F03-C07'],{evidence:'2026-fire1-18+22+33-34'}),
  T('F-FIRE-05','fire','화재이론','연기층·플룸·천장제트·가시거리','covered',['F03-C07'],{evidence:'2026-fire1-18+fire2-325+338'}),
  T('F-FIRE-06','fire','화재이론','플래시오버·롤오버·백드래프트 비교','covered',['F03-C09','F03-C10','F03-C11'],{recent:'high'}),
  T('F-FIRE-07','fire','특수화재','보일오버·슬롭오버·프로스오버','covered',['F03-C12','F03-C13','F03-C14']),
  T('F-FIRE-08','fire','특수화재','BLEVE·파이어볼·풀파이어·제트파이어','partial',['F03-C15','F03-C16']),
  T('F-EXP-01','fire','폭발','폭연·폭굉','covered',['F03-C08'],{evidence:'2026-fire2-explosion'}),
  T('F-EXP-02','fire','폭발','분진폭발·가스폭발·분해폭발','covered',['F03-C08'],{evidence:'2026-fire2-340+342-348'}),
  T('F-EXP-03','fire','폭발','증기운폭발(VCE)·폭발방호','partial',['F03-C08']),
  T('F-BLD-01','fire','건축화재·방재','목조건축물 vs 내화건축물 화재','covered',['F03-C05'],{recent:'2024',evidence:'2026-fire1-30-90'}),
  T('F-BLD-02','fire','건축화재·방재','방화구획·방화벽·방화문','covered',['F07-C01'],{recent:'2026',evidence:'building-act-46-57'}),
  T('F-BLD-03','fire','건축화재·방재','불연·준불연·난연재료·내화구조','covered',['F07-C01'],{recent:'2026',evidence:'building-act-2'}),
  T('F-BLD-04','fire','건축화재·방재','연돌효과·연기이동·피난계획','covered',['F03-C07'],{recent:'2024',evidence:'2026-fire2-335-338+fire1-77'}),
  T('F-BLD-05','fire','특수화재','주방·전기·가스·금속화재','covered',['F03-C01'],{recent:'2026',evidence:'2026-fire1-4+37-38+fire2-188+197'}),

  // FIRE — suppression / hazardous materials / facilities / investigation
  T('F-SUP-01','fire','소화이론','냉각·질식·제거·억제 소화','covered',['F04-C01']),
  T('F-SUP-02','fire','소화약제','물·포·CO2·할론·청정·분말 비교','covered',['F04-C02','F04-C03','F04-C04','F04-C05','F04-C06','F04-C07','F04-C08']),
  T('F-SUP-03','fire','소화약제','포 혼합농도·팽창비·원액량 계산','covered',['F04-C04'],{calc:true,evidence:'2026-fire1-36+fire2-199-204+206+210'}),
  T('F-HAZ-01','fire','위험물','위험물 정의·류별 성상·품명·지정수량','covered',['F05-C01','F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07']),
  T('F-HAZ-02','fire','위험물','지정수량 배수·혼재위험물 계산','covered',['F05-C01','F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07'],{calc:true}),
  T('F-HAZ-03','fire','위험물','류별 저장·취급금기·소화·예외','covered',['F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07'],{evidence:'NFA-hazmat-common-storage-extinguishing-exceptions'}),
  T('F-HAZ-04','fire','위험물','특수가연물','covered',['F05-C01'],{recent:'2026'}),
  T('F-FAC-01','fire','소방시설','소방시설 5분류·소화기구·소화전','covered',['F07-C01','F07-C02','F07-C03','F07-C04']),
  T('F-FAC-02','fire','소방시설','스프링클러 구성·습식·건식·준비작동·일제살수','covered',['F07-C05','F07-C16','F07-C17','F07-C18','F07-C19','F07-C20','F07-C21']),
  T('F-FAC-03','fire','소방시설','간이·ESFR·물분무·미분무·포·가스·분말','covered',['F07-C06','F07-C07','F07-C08','F07-C09','F07-C10']),
  T('F-FAC-04','fire','소방시설','감지기·자동화재탐지·경보설비 작동논리','covered',['F07-C11','F07-C12'],{evidence:'2026-prevention1-detection-alarm-flow'}),
  T('F-FAC-05','fire','소방시설','피난구조·소화용수·제연·연결송수·무선통신보조','covered',['F07-C13','F07-C14','F07-C15'],{evidence:'2026-prevention1-evac-water-smoke-standpipe-radio'}),
  T('F-INV-01','fire','화재조사','목적·현장보존·발화부·원인·피해조사','covered',['F06-C01','F06-C02','F06-C03','F06-C04'],{recent:'2025'}),

  // EMS — general / law / disaster
  T('E-GEN-01','ems','총론','응급의료체계·응급구조사 법적책임','covered',['E01-C01','E01-C02','E01-C03']),
  T('E-LAW-01','ems','법령','119구조·구급법·시행령','covered',['E01-C03'],{recent:'2026',evidence:'current-119-act+decree+rule-2026'}),
  T('E-LAW-02','ems','법령','응급의료법·시행규칙·1급 업무범위','covered',['E01-C03'],{recent:'2026',evidence:'Emergency-Medical-Service-Act-36-41+Rule-Annex14-current'}),
  T('E-LAW-03','ems','법령','의료지도·동의·기록·비밀유지·윤리','covered',['E01-C03','E05-C04'],{evidence:'EMS-Act-9-40-49-52+119-Rule-12-18-current'}),
  T('E-TRN-01','ems','이송','구급차 운용·장비·병원선정','covered',['E06-C01','E06-C04','E07-C04'],{evidence:'2026-NFA-EMS-89-102+103-126+current-119-act-10-3+decree-12'}),
  T('E-TRN-02','ems','이송','항공이송·국제구급','covered',['E01-C03'],{recent:'2026',evidence:'current-119-act-10-4+12+decree-13-3'}),
  T('E-MCI-01','ems','재난의료','대량재난·START 분류','covered',['E05-C04'],{recent:'2024',evidence:'2026-NFA-EMS-85-87-START-RPM'}),
  T('E-MCI-02','ems','재난의료','재난통신·지휘체계·특수재난·CBRN·제독','covered',['E03-C05'],{recent:'2024',evidence:'2026-NFA-EMS-44-50+72-84+NFSA-CBRNE+SafeKorea-CBRN'}),
  T('E-SAFE-01','ems','총론','대원안전·스트레스·감염·PPE','covered',['E02-C01','E02-C02','E03-C01','E03-C02','E03-C03','E03-C04','E03-C05']),
  T('E-ASS-01','ems','환자평가','현장확인·1차·2차·SAMPLE·재평가','covered',['E08-C01','E08-C02','E08-C03','E08-C04','E08-C05','E08-C06']),
  T('E-AIR-01','ems','기도·호흡','기도개방·보조기구·흡인·산소·환기','covered',['E09-C01','E09-C02','E09-C03','E09-C04','E09-C05','E09-C06','E09-C07','E09-C08']),
  T('E-RESP-01','ems','기도·호흡','호흡곤란·천식·COPD·흡입손상','covered',['E10-C01','E10-C02','E10-C03','E10-C04','E10-C05'],{evidence:'2026-NFA-EMS-192-198'}),
  T('E-BLS-01','ems','소생술','성인·소아·영아 BLS·기도이물','covered',['E24-C01','E24-C02','E24-C03','E24-C04','E24-C05']),

  // EMS — ACLS / ECG
  T('E-ACLS-01','ems','전문심장소생술','심정지 알고리즘·shockable/non-shockable','covered',['E11-C03','E11-C04','E11-C05'],{recent:'very-high',evidence:'2020-KACPR-140-145-2026-exam-standard'}),
  T('E-ECG-01','ems','전문심장소생술','VF·무맥성 VT·PEA·asystole 판독','covered',['E11-C04','E11-C05'],{visual:true,recent:'very-high',evidence:'2020-KACPR-140-145+2026-NFA-EMS-208-209+study-waveform-schematic'}),
  T('E-ECG-02','ems','전문심장소생술','SVT·AF·VT·서맥·AV block 판독','partial',['E11-C02','E11-C05'],{visual:true,recent:'very-high'}),
  T('E-ACLS-02','ems','전문심장소생술','안정/불안정 빈맥·서맥 알고리즘','partial',['E11-C02'],{recent:'very-high'}),
  T('E-ACLS-03','ems','전문심장소생술','제세동·동기화 심율동전환·경피조율','covered',['E11-C04','E11-C05','E11-C06'],{visual:true,recent:'very-high',evidence:'2020-KACPR-adult-ALS-140-145+pediatric-table8-table9+2026-NFA-EMS-210-215'}),
  T('E-ACLS-04','ems','전문심장소생술','에피네프린·아미오다론·아데노신·아트로핀 등 약물','covered',['E11-C03','E11-C05'],{recent:'very-high'}),
  T('E-ACLS-05','ems','전문심장소생술','Hs & Ts·ROSC 후 처치','covered',['E11-C03'],{evidence:'2020-KACPR-144-145+235-257-2026-exam-standard'}),
  T('E-CARD-01','ems','내과응급','ACS·STEMI/NSTEMI·급성폐부종·심인성쇼크','covered',['E11-C01','E11-C02'],{visual:true,evidence:'2026-NFA-EMS-200-205+487-505+KDCA-AMI+KDCA-pulmonary-edema+KDCA-cardiogenic-shock'}),

  // EMS — trauma / medical / special
  T('E-SHOCK-01','ems','쇼크','저혈량·심인성·폐쇄성·분포성 쇼크 비교','partial',['E13-C01','E13-C02','E13-C03','E13-C04','E13-C05']),
  T('E-TRM-01','ems','외상','손상기전·연부조직·근골격·머리·척추','covered',['E14-C01','E14-C02','E15-C01','E15-C02','E15-C03','E16-C01','E16-C02','E16-C03','E16-C04']),
  T('E-TRM-02','ems','외상','흉부외상: 긴장기흉·혈흉·심장압전·연가양흉','partial',['E14-C02'],{recent:'high'}),
  T('E-TRM-03','ems','외상','복부·골반외상·대량출혈·중증외상 이송','covered',['E13-C04','E13-C05','E14-C02'],{recent:'2026',evidence:'2026-NFA-EMS-250-251+471-473+485'}),
  T('E-BURN-01','ems','외상','화상 깊이·TBSA·특수화상','covered',['E14-C03'],{evidence:'2026-NFA-EMS-255-265'}),
  T('E-BURN-02','ems','계산','Parkland 수액량 계산','covered',['E14-C03'],{calc:true,recent:'2025'}),
  T('E-CALC-01','ems','계산','산소통 사용시간 계산','partial',['E09-C07'],{calc:true,recent:'2024-reconstructed',evidence:'reconstructed-practice'}),
  T('E-CALC-02','ems','계산','수액 적하속도·시간당 주입량','partial',['E07-C03'],{calc:true,recent:'prep-standard',evidence:'standard-education-practice'}),
  T('E-NEURO-01','ems','내과응급','의식장애·경련·뇌졸중','covered',['E17-C01','E17-C02','E17-C03','E17-C04']),
  T('E-ENDO-01','ems','내과응급','저혈당·DKA·HHS','covered',['E17-C02'],{recent:'2025',evidence:'KDCA-hypoglycemia+diabetes-acute-complications+hyperglycemia-current'}),
  T('E-GI-01','ems','내과응급','급성복통·위장관 출혈·복부 응급','covered',['E12-C01','E12-C02','E12-C03','E12-C04','E12-C05'],{evidence:'2026-NFA-EMS-216-224'}),
  T('E-INF-01','ems','내과응급','패혈증·감염성 응급','partial',['E03-C04']),
  T('E-TOX-01','ems','중독·알레르기','중독유형·toxidrome·해독제·아나필락시스','partial',['E18-C01','E18-C02']),
  T('E-ENV-01','ems','특수응급','한랭·열·익수·물림·쏘임','covered',['E19-C01','E19-C02','E19-C03','E19-C04','E19-C05']),
  T('E-OB-01','ems','산과','임신·정상분만·합병증·산과응급','covered',['E20-C01','E20-C02','E20-C03','E20-C04','E20-C05','E20-C06']),
  T('E-PED-01','ems','소아','소아 평가·기도·호흡·내과·외상','covered',['E21-C01','E21-C02','E21-C03','E21-C04','E21-C05','E21-C06','E21-C07','E21-C08']),
  T('E-PALS-01','ems','소아소생','전문소아소생술·소아 서맥/빈맥/쇼크','covered',['E21-C04','E21-C05'],{visual:true}),
  T('E-NRP-01','ems','신생아','신생아소생술 초기평가·환기·압박','covered',['E20-C03'],{visual:true,evidence:'2026-NFA-EMS-350-352-364-newborn-resuscitation'}),
  T('E-GER-01','ems','노인','노인 생리·접근·평가·다약제','covered',['E22-C01','E22-C02','E22-C03']),
  T('E-BEH-01','ems','행동응급','행동응급·자살위험·폭력·기록','covered',['E23-C01','E23-C02','E23-C03'])
];
const statusRank={missing:0,partial:1,covered:2};
function audit(){
  const rows=topics.map(t=>{
    const present=(t.refs||[]).filter(id=>!!V.curriculum?.byId?.[id]);
    const packs=present.filter(id=>!!V.contentPacks?.authored?.[id]);
    const verified=packs.filter(id=>V.contentPacks.authored[id]?.status==='verified');
    const questions=present.reduce((n,id)=>n+(V.QuestionQuality119?.forConcept?.(id)||[]).length,0);
    return{...t,present:present.length,packs:packs.length,verified:verified.length,questions};
  });
  const count=s=>rows.filter(x=>x.status===s).length;
  const weighted=rows.reduce((n,x)=>n+statusRank[x.status],0);
  return{
    version:'119-coverage-map-2026-2027-v1',
    total:rows.length,
    covered:count('covered'),
    partial:count('partial'),
    missing:count('missing'),
    implementationPercent:Math.round(weighted/(rows.length*2)*100),
    calcTotal:rows.filter(x=>x.calc).length,
    calcMissing:rows.filter(x=>x.calc&&x.status==='missing').map(x=>x.id),
    visualMissing:rows.filter(x=>x.visual&&x.status==='missing').map(x=>x.id),
    rows
  };
}
V.CoverageMap119={
  version:'119-coverage-map-2026-2027-v1',
  basis:{
    official:['2026 소방공무원 채용시험 시행계획','2026 중앙소방학교 공개 교재'],
    trend:['2024 소방학개론 복원/총평','2025 소방학개론 총평','2026 소방학개론 총평','2024 응급처치학개론 복원','2025 응급처치학개론 복원/최근 3개년 분석'],
    policy:'공식범위와 공식교재가 우선이며, 최근기출/총평은 우선순위 태그에만 사용. 확인되지 않은 출제확률은 생성하지 않음.'
  },
  topics,audit
};
})();