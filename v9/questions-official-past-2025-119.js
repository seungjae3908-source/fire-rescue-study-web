'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions)||!V.curriculum?.concepts)return;
const OFFICIAL_URL='https://www.nfa.go.kr/nfa/news/job/nfajob/?cntId=426&mode=view';
const SOURCE='소방청 공식 2025년 소방공무원 채용시험 문제지·가답안';
const LICENSE='공공누리 제1유형';
const safeConcept=(preferred,subject,scope)=>{
  const c=V.curriculum.byId?.[preferred]||V.curriculum.concepts.find(x=>x.subject===subject&&x.scopeId===scope)||V.curriculum.concepts.find(x=>x.subject===subject);
  if(!c)throw Error('OFFICIAL_PAST_CONCEPT_MISSING '+preferred);return c;
};
const base=(id,subject,preferred,scope,q,choices,a,{difficulty='mid',type='기출형',currentCompatibility=true}={})=>{
  const c=safeConcept(preferred,subject,scope),right='소방청이 공개한 2025년 채용시험 가답안 기준 정답입니다.',wrong='소방청 공개 가답안 기준 정답이 아닙니다. 현재 학습 상세와 공식 근거를 함께 확인하세요.';
  const choiceExplanations=choices.map((_,i)=>i===a?right:wrong);
  return{id:'119-past25-'+id,grade:'A',subject,scopeId:c.scopeId,conceptId:c.id,difficulty,type,source:SOURCE,sourceUrl:OFFICIAL_URL,license:LICENSE,
    q,choices,a,ex:choiceExplanations[a],choiceExplanations,examStyle:true,questionClass:'official-past-exam',officialPastExam:true,pastExamClaim:true,
    generatedPractice:false,pageVerified:false,reviewStatus:'official-past-exam',examYear:2025,examDate:'2025-03-29',currentCompatibility};
};
const Q=[
base('fire-01','fire','F01-C06','F01','우리나라 소방의 변천 과정에 대한 설명으로 옳지 않은 것은?',[
'고려 시대에는 소방을 소재(消災)라 하였고 금화원 제도를 시행하였다.',
'조선 시대에는 5가 작통제를 시행하고 세종 8년 금화도감을 설치한 뒤 수성금화도감으로 개편하였다.',
'일제 강점기에는 1925년 최초의 소방서인 경성소방서가 설치되었다.',
'미군정 시대에는 1946년 소방부와 소방위원회를 설치하고 1947년 중앙소방위원회의 집행기구로 소방청을 설치하였다.'
],2,{type:'연혁판단형'}),
base('fire-04','fire','F01-C06','F01','민간 소방조직의 변천 순서로 옳은 것은?',[
'경방단 → 소방대 → 방공단 → 청원소방원','방공단 → 청원소방원 → 경방단 → 소방대','소방대 → 방공단 → 청원소방원 → 경방단','청원소방원 → 경방단 → 소방대 → 방공단'
],0,{type:'순서형'}),
base('fire-05','fire','F02-C05','F02','재난 대응 단계에서 지역긴급구조통제단장이 하여야 하는 응급조치로 옳지 않은 것은?',[
'진화에 관한 응급조치','현장지휘통신체계의 확보','재난을 발생시킬 요인의 제거','긴급수송 및 구조 수단의 확보'
],2,{type:'법령판단형',currentCompatibility:false}),
base('fire-06','fire','F06-C03','F06','인화성 액체가 바닥에서 흐르거나 살포된 부위가 집중적으로 소훼되고 탄화경계가 뚜렷한 화재패턴은?',[
'도넛패턴(Doughnut pattern)','스플래시패턴(Splash pattern)','원형패턴(Circular shaped pattern)','틈새연소패턴(Seam burn pattern)'
],1,{type:'현상판단형'}),
base('fire-07','fire','F03-C03','F03','에테인(C₂H₆)이 완전연소한다고 가정했을 때 존스(Jones)식에 따라 산출된 연소하한계(LFL)는? (소수점 둘째 자리에서 반올림)',[
'1.7','2.2','3.1','5.2'
],2,{difficulty:'high',type:'계산형'}),
base('fire-09','fire','F03-C03','F03','고체 가연물인 피크르산(Picric Acid)의 연소 형태로 옳은 것은?',[
'훈소','자기연소','표면연소','증발연소'
],1,{type:'개념형'}),
base('fire-10','fire','F03-C02','F03','푸리에(Fourier)의 열전도법칙에 따라 물질을 통해 전달되는 열량에 대한 설명으로 옳지 않은 것은?',[
'물질의 두께에 비례한다.','물질의 전열면적에 비례한다.','물질 양면의 온도차에 비례한다.','물질의 열전도율에 비례한다.'
],0,{type:'원리형'}),
base('fire-11','fire','F03-C07','F03','연소 시 발생하는 황화수소(H₂S)에 대한 설명으로 옳은 것은?',[
'계란 썩는 냄새가 나는 가연성가스이다.','폴리염화비닐 등이 연소할 때 발생되는 맹독성가스이다.','청산가스라고도 하며 동물의 털이 불완전연소할 때 발생한다.','황을 포함하는 유기화합물이 완전연소할 때 발생한다.'
],0,{type:'연소생성물형'}),
base('fire-12','fire','F03-C03','F03','표준상태에서 메테인(CH₄) 2 mole이 완전연소할 때 필요한 산소의 부피[L]는?',[
'11.2','22.4','44.8','89.6'
],3,{difficulty:'high',type:'계산형'}),
base('fire-15','fire','F05-C01','F05','위험물의 성질 및 품명의 정의로 옳지 않은 것은?',[
'인화성고체는 고형알코올 등 1기압에서 인화점이 섭씨 40도 미만인 고체를 말한다.',
'제1석유류는 아세톤, 휘발유 등 1기압에서 인화점이 섭씨 21도 미만인 것을 말한다.',
'특수인화물은 이황화탄소, 디에틸에테르 등 법령상 발화점·인화점·비점 기준에 해당하는 것을 말한다.',
'자연발화성물질 및 금수성물질은 공기 중에서 발화 위험이 있거나 산과 접촉하여 발화하거나 고압 수증기를 발생하는 위험성이 있는 것을 말한다.'
],3,{difficulty:'high',type:'법령정의형',currentCompatibility:false}),
base('fire-16','fire','F05-C07','F05','제6류 위험물의 취급 시 유의 사항으로 옳지 않은 것은?',[
'유출사고 시에는 건조사 및 중화제를 사용한다.','불연성 물질로 분해 시 산소가 발생하며 대부분 염기성이다.','저장 용기는 파손되거나 액체가 누설되지 않도록 한다.','소량 화재 시에는 다량의 물로 희석하는 소화방법을 사용할 수 있다.'
],1,{type:'위험물판단형'}),
base('fire-18','fire','F06-C02','F06','소방의 화재조사 시 소방관서장이 화재합동조사단의 단원으로 임명 또는 위촉할 수 있는 사람에 해당하지 않는 것은?',[
'화재조사관','화재조사 업무 경력이 4년인 소방공무원','국가기술자격 직무분야 중 안전관리 분야에서 기능사 자격을 취득한 사람','고등교육법상 학교 또는 이에 준하는 교육기관에서 화재 조사·소방·안전관리 관련 분야 조교수로 4년 재직한 사람'
],2,{difficulty:'high',type:'법령자격형',currentCompatibility:false}),
base('fire-21','fire','F04-C08','F04','제3종 분말소화약제의 열분해 결과로 생성되는 물질의 소화 효과로 옳지 않은 것은?',[
'H₂O : 냉각작용','HPO₃ : 방진작용','NH₃ : 부촉매작용','H₃PO₄ : 탈수탄화작용'
],2,{difficulty:'high',type:'약제반응형'}),

base('ems-01','ems','E01-C01','E01','119구조·구급에 관한 법률 시행령상 국제구급대원의 일반 교육훈련에 대한 내용으로 옳은 것은?',[
'기초통신','응급처치','해외 응급의료체계','국제 항공이송 관련 교육'
],0,{type:'법령형',currentCompatibility:false}),
base('ems-02','ems','E01-C03','E01','응급의료에 관한 법률 시행규칙상 1급 응급구조사의 업무 범위에 대한 설명으로 옳지 않은 것은?',[
'일정량의 수액 투여 시 정맥혈 채혈','심전도 측정 및 전송(의료기관 안에서는 응급실 내에 한함)','부목·척추고정기·공기 등을 이용한 사지 및 척추 등의 고정','응급 분만 시 탯줄 결찰 및 절단(현장 및 이송 중에 한하며 지도의사의 실시간 영상의료지도 하에서만 수행)'
],0,{difficulty:'high',type:'법령업무범위형',currentCompatibility:false}),
base('ems-06','ems','E08-C01','E08','다수사상자가 발생한 현장에서 SALT 분류법을 시행할 때의 인명구조중재술(LSI)로 옳지 않은 것은?',[
'쇼크 시 수액 투여','다량의 출혈 시 지혈 처치','외상으로 인한 긴장성 공기가슴증 시 바늘감압술 시행','화학 물질 노출 시 자동주사기형 해독제 투여'
],0,{difficulty:'high',type:'상황판단형'}),
base('ems-07','ems','E02-C01','E02','구급대원이 장기간의 스트레스 노출로 몸과 마음이 지쳐 신체적으로 여러 질병이 나타났다. 셀리에 이론에 근거한 스트레스 반응 단계는?',[
'경고 단계','소진 단계','저항 단계','포기 단계'
],1,{type:'개념형'}),
base('ems-08','ems','E08-C01','E08','다수사상자 현장에서 START 분류법을 적용할 때 비응급(녹색) 환자에 해당하지 않는 것은?',[
'가슴을 부여잡고 힘겹게 보행 중인 자','다량의 출혈 부위를 스스로 압박하며 보행 중인 자','스스로 걷지 못해 동료의 부축을 받아 이동 중인 자','쓰러진 가족 주변에서 서성이는 단순 찰과상 환자'
],2,{difficulty:'high',type:'상황판단형'}),
base('ems-09','ems','E24-C04','E24','수기 가슴압박이 어려울 때 기계식 심폐소생술 장치를 적용해 볼 수 있는 상황으로 옳지 않은 것은? (2020 한국심폐소생술 가이드라인 기준)',[
'임신부의 심장이 정지된 경우','감염병 노출 가능성이 있는 경우','공간이 좁은 승강기로 환자를 옮기는 경우','흔들리는 구급차 안에서 심폐소생술을 하는 경우'
],0,{type:'소생술상황형',currentCompatibility:false}),
base('ems-10','ems','E24-C04','E24','구급대원이 심폐소생술을 중단할 수 있는 상황으로 옳지 않은 것은?',[
'사망으로 추정한 경우','의사가 사망을 선고한 경우','소생 시도 금지가 확인된 경우','구급대원이 지쳐 더 이상 시행할 수 없는 경우'
],0,{type:'소생술원칙형'}),
base('ems-12','ems','E11-C04','E11','전문심장소생술 시 투여하는 약물의 용량에 대한 설명으로 옳지 않은 것은?',[
'비틀림 심실빈맥이 관찰되는 경우 마그네슘 투여량은 1-2 g이다.','심폐소생술을 시행하는 동안 에피네프린의 최대 투여량은 1 mg이다.','제세동에 반응하지 않는 경우 아미오다론의 최초 투여량은 300 mg이다.','제세동에 반응하지 않는 경우 리도케인의 추가 투여량은 0.5-0.75 mg/kg이다.'
],1,{difficulty:'high',type:'약물수치형',currentCompatibility:false}),
base('ems-14','ems','E03-C02','E03','홍역이 의심되는 성인에게 심폐소생술 중 기관내삽관을 시행할 때 감염 전파를 줄일 수 있는 방법으로 옳은 것은?',[
'전문소생술에는 최대 인원이 참여한다.','기관내삽관 시 비디오 후두경을 사용한다.','처치 편의를 위해 보호장비는 최소화한다.','기관내삽관보다 성문외 기도기를 우선적으로 사용한다.'
],1,{type:'감염예방형'}),
base('ems-17','ems','E18-C02','E18','벌에 쏘인 8세 소아가 저혈압과 얼굴 부종, 호흡곤란을 보인다. 에피펜이 없을 때 1:1000 에피네프린을 근육주사하는 초기 용량으로 옳은 것은?',[
'0.1 mg','0.3 mg','0.6 mg','1.0 mg'
],1,{difficulty:'high',type:'약물수치형',currentCompatibility:false}),
base('ems-18','ems','E19-C02','E19','중증 저체온(<30℃) 환자 이송 중 재가온 쇼크가 발생했을 때 의심할 수 있는 처치 내용은?',[
'담요를 덮어 주었다.','전신에 핫팩을 적용하였다.','따뜻한 수액을 공급하였다.','고온 다습한 산소를 공급하였다.'
],1,{type:'환경응급형'}),
base('ems-22','ems','E14-C03','E14','체중 80 kg 성인이 체표면적 25%에 3도 전기화상을 입었다. 파크랜드 요법을 적용해 사고 후 병원 도착까지 2시간 동안 주입해야 하는 수액량은?',[
'500 mL','1,000 mL','4,000 mL','8,000 mL'
],1,{difficulty:'high',type:'계산형',currentCompatibility:false}),
base('ems-24','ems','E14-C03','E14','페놀로 인해 다리에 화학화상을 입은 환자에게 가장 적절한 처치는?',[
'초기에 중화제를 사용한다.','화상 부위에 얼음을 댄다.','알코올로 닦은 후 찬물로 세척한다.','솔질하여 털어낸 후 찬물로 세척한다.'
],2,{type:'화상처치형'}),
base('ems-25','ems','E15-C02','E15','콘크리트에 깔린 압좌증후군 환자에 대한 설명으로 옳지 않은 것은?',[
'염화칼륨을 투여한다.','만니톨 투여를 고려한다.','구조 후 급성신부전 발생 가능성이 있다.','손상 부위에서 인산염, 젖산 등이 유출된다.'
],0,{difficulty:'high',type:'외상처치형',currentCompatibility:false}),
base('ems-29','ems','E13-C05','E13','감염에 따른 고열 및 저혈압으로 패혈증이 의심되는 고령 환자에게 초기 수액소생술을 시도할 때 적절한 수액은?',[
'알부민액','5% 생리식염수','5% 포도당액(DW5)','하트만용액(락테이트링거액)'
],3,{type:'쇼크처치형',currentCompatibility:false}),
base('ems-34','ems','E20-C05','E20','유산의 종류에 대한 설명으로 옳지 않은 것은?',[
'자연유산은 수정 후 2주 이내 발생하는 경우가 많다.','습관성유산은 자연유산이 연속적으로 3회 이상 발생한 것이다.','절박유산은 임신 35주 이후 자궁경부가 확장되어 태아가 사망할 수 있다.','계류유산은 태아가 사망한 이후에도 임신부 몸에서 배출되지 않은 것이다.'
],2,{difficulty:'high',type:'산과판단형',currentCompatibility:false}),
base('ems-35','ems','E12-C05','E12','전신성(Pre-renal) 급성콩팥손상의 원인으로 옳은 것은?',[
'콩팥 결석','패혈성 쇼크','항암제 복용','양성 전립샘 비대'
],1,{type:'질환판단형'}),
base('ems-38','ems','E10-C03','E10','호흡곤란 환자의 평가 및 처치에 사용되는 장비에 대한 설명으로 옳은 것은?',[
'맥박산소측정기는 동맥 내 O₂의 정확한 분압을 측정한다.','호기말이산화탄소분압측정기는 동맥 내 CO₂량의 상대적 백분율을 측정한다.','비재호흡마스크는 정확한 FiO₂가 필요한 환자에게 우선 사용하는 장치이다.','코삽입관은 자발호흡이 가능한 환자에게 6 L/min 이하 산소공급이 필요할 때 주로 사용한다.'
],3,{type:'장비판단형'})
];
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase(),ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>norm(q.q))),added=[];
for(const q of Q){
  if(ids.has(q.id)||texts.has(norm(q.q)))continue;
  V.questions.push(q);ids.add(q.id);texts.add(norm(q.q));added.push(q);
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
function buildPractice(){
  const fire=added.filter(q=>q.subject==='fire'),ems=added.filter(q=>q.subject==='ems');
  return [...fire,...ems].sort((a,b)=>a.id.localeCompare(b.id));
}
V.OfficialPastExam119={version:'119-official-past-2025-v1',year:2025,date:'2025-03-29',sourceUrl:OFFICIAL_URL,license:LICENSE,questions:added,fire:added.filter(q=>q.subject==='fire').length,ems:added.filter(q=>q.subject==='ems').length,buildPractice,ready:added.length>=30,policy:{verbatimPastExam:false,transcribedWithTypographyNormalization:true,officialSource:true,noImageDependentQuestions:true,currentLawCompatibilitySeparated:true}};
})();