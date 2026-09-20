'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions)||!V.QuestionQuality119)return;

const STAGES=[
  ['understand','1 이해'],
  ['basic','2 기본'],
  ['unit','3 단위변환'],
  ['reverse','4 역산'],
  ['trap','5 함정'],
  ['exam','6 실전']
];
const FAMILY_LABELS={hazmat:'위험물',combustion:'연소·기체',heat:'열량',foam:'포',oxygen:'산소통',iv:'수액·점적',burn:'화상·Parkland'};
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const made=[];

function put({id,family,stage,subject,scopeId,conceptId,source,q,correct,wrong,difficulty='mid',explain}){
  const choices=[String(correct),...(wrong||[]).map(String)];
  if(choices.length!==4||new Set(choices).size!==4)throw new Error('CALC_V3_CHOICES '+id);
  const pos=hash(id)%4,answer=choices.shift();choices.splice(pos,0,answer);
  const ex=choices.map((x,i)=>i===pos?'정답. '+explain:'오답. 공식의 의미, 단위와 연산 방향을 다시 확인한다.');
  const row={id,grade:'P',subject,scopeId,conceptId,difficulty,type:'계산형',source,q,choices,a:pos,choiceExplanations:ex,ex:ex[pos],examStyle:true,questionClass:'exam-style',generatedPractice:true,generatedBy:'119-calculation-training-v3',calcFamily:family,calcStage:stage,pastExamClaim:false};
  if(!V.QuestionQuality119.isExamStyle(row))throw new Error('CALC_V3_CONTRACT '+id);
  made.push(row);
}

// 위험물 지정수량
put({id:'119-calc3-haz-understand',family:'hazmat',stage:'understand',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'low',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'서로 다른 위험물을 함께 저장할 때 지정수량 배수를 구하는 식으로 옳은 것은?',correct:'각 품목의 (저장량 ÷ 지정수량)을 모두 합한다',wrong:['전체 저장량을 가장 작은 지정수량 하나로만 나눈다','각 지정수량을 저장량으로 나눈 뒤 곱한다','품목 수만 세어 배수로 사용한다'],explain:'품목별 저장량을 해당 지정수량으로 나눈 값을 합산한다.'});
put({id:'119-calc3-haz-basic',family:'hazmat',stage:'basic',subject:'fire',scopeId:'F05',conceptId:'F05-C01',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'유황 60kg(지정수량 100kg)과 철분 200kg(지정수량 500kg)의 합산 배수는?',correct:'1.0배',wrong:['0.4배','0.6배','1.4배'],explain:'60÷100 + 200÷500 = 0.6 + 0.4 = 1.0배이다.'});
put({id:'119-calc3-haz-unit',family:'hazmat',stage:'unit',subject:'fire',scopeId:'F05',conceptId:'F05-C01',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'마그네슘 0.25t(지정수량 500kg)과 적린 50kg(지정수량 100kg)의 합산 배수는?',correct:'1.0배',wrong:['0.55배','0.75배','1.5배'],explain:'0.25t=250kg이므로 250÷500 + 50÷100 = 0.5 + 0.5 = 1.0배이다.'});
put({id:'119-calc3-haz-reverse',family:'hazmat',stage:'reverse',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'high',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'적린 40kg(지정수량 100kg)과 마그네슘을 함께 저장해 합계가 1.1배가 되려면, 지정수량 500kg인 마그네슘은 몇 kg인가?',correct:'350kg',wrong:['150kg','250kg','550kg'],explain:'적린이 0.4배이므로 마그네슘은 0.7배가 필요하고 500×0.7=350kg이다.'});
put({id:'119-calc3-haz-trap',family:'hazmat',stage:'trap',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'high',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'칼륨 5kg(지정수량 10kg)과 황린 10kg(지정수량 20kg)을 함께 저장한다. 단순 저장량 합계가 아니라 지정수량 배수로 계산한 값은?',correct:'1.0배',wrong:['0.5배','1.5배','15배'],explain:'5÷10과 10÷20을 각각 계산해 합하면 0.5+0.5=1.0배이다.'});
put({id:'119-calc3-haz-exam',family:'hazmat',stage:'exam',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'high',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'유황 30kg(100kg), 철분 150kg(500kg), 마그네슘 100kg(500kg)을 함께 저장할 때 합산 배수는?',correct:'0.8배',wrong:['0.6배','1.0배','1.6배'],explain:'0.3 + 0.3 + 0.2 = 0.8배이다.'});

// 연소·기체
put({id:'119-calc3-comb-understand',family:'combustion',stage:'understand',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'low',source:'2026 소방전술1(화재2) 299~302쪽',q:'공기 중 산소 체적비를 21%로 볼 때 이론산소량 O에서 이론공기량 A를 구하는 관계식은?',correct:'A = O ÷ 0.21',wrong:['A = O × 0.21','A = O - 0.21','A = 0.21 ÷ O'],explain:'공기량의 약 21%가 산소이므로 산소량을 0.21로 나눈다.'});
put({id:'119-calc3-comb-basic',family:'combustion',stage:'basic',subject:'fire',scopeId:'F03',conceptId:'F03-C03',source:'2026 소방전술1(화재2) 299~302쪽',q:'이론공기량이 40 N㎥라면 이론산소량은?',correct:'8.4 N㎥',wrong:['4.0 N㎥','19.0 N㎥','190.5 N㎥'],explain:'40×0.21=8.4 N㎥이다.'});
put({id:'119-calc3-comb-unit',family:'combustion',stage:'unit',subject:'fire',scopeId:'F03',conceptId:'F03-C03',source:'2026 소방전술1(화재2) 299~302쪽 · 표준 체적 단위변환',q:'이론산소량 2.1 N㎥를 L로 바꾸면 얼마인가? (1 N㎥=1,000L)',correct:'2,100L',wrong:['210L','21,000L','0.0021L'],explain:'2.1×1,000=2,100L이다.'});
put({id:'119-calc3-comb-reverse',family:'combustion',stage:'reverse',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'high',source:'2026 소방전술1(화재2) 300쪽',q:'공기비 m이 1.25이고 이론공기량이 12 N㎥이면 실제공기량은?',correct:'15 N㎥',wrong:['9.6 N㎥','12.25 N㎥','25 N㎥'],explain:'실제공기량 = 공기비×이론공기량 = 1.25×12=15 N㎥이다.'});
put({id:'119-calc3-comb-trap',family:'combustion',stage:'trap',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'high',source:'2026 소방전술1(화재2) 299~300쪽',q:'실제공기량 18 N㎥, 이론공기량 15 N㎥일 때 과잉공기량과 공기비의 조합은?',correct:'3 N㎥ · 1.2',wrong:['3 N㎥ · 0.83','33 N㎥ · 1.2','1.2 N㎥ · 3'],explain:'과잉공기량은 18-15=3 N㎥, 공기비는 18÷15=1.2이다.'});
put({id:'119-calc3-comb-exam',family:'combustion',stage:'exam',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'high',source:'2026 소방전술1(화재2) 299~302쪽',q:'이론산소량 4.2 N㎥이고 공기비가 1.2라면 실제공기량은?',correct:'24 N㎥',wrong:['5.04 N㎥','16.8 N㎥','20 N㎥'],explain:'이론공기량은 4.2÷0.21=20 N㎥, 실제공기량은 20×1.2=24 N㎥이다.'});

// 감열량
put({id:'119-calc3-heat-understand',family:'heat',stage:'understand',subject:'fire',scopeId:'F03',conceptId:'F03-C02',difficulty:'low',source:'2026 소방전술1(화재2) 190·345쪽',q:'감열량 계산식으로 옳은 것은? (m=질량, c=비열, ΔT=온도변화)',correct:'Q = m × c × ΔT',wrong:['Q = m ÷ c ÷ ΔT','Q = m + c + ΔT','Q = ΔT ÷ (m × c)'],explain:'감열량은 질량·비열·온도변화의 곱이다.'});
put({id:'119-calc3-heat-basic',family:'heat',stage:'basic',subject:'fire',scopeId:'F03',conceptId:'F03-C02',source:'2026 소방전술1(화재2) 190·345쪽',q:'질량 4g, 비열 0.5cal/g·℃인 물질을 30℃ 올리는 데 필요한 감열량은?',correct:'60cal',wrong:['15cal','30cal','120cal'],explain:'4×0.5×30=60cal이다.'});
put({id:'119-calc3-heat-unit',family:'heat',stage:'unit',subject:'fire',scopeId:'F03',conceptId:'F03-C02',source:'2026 소방전술1(화재2) 190·345쪽',q:'질량 0.002kg, 비열 1cal/g·℃인 물질을 50℃ 올린다. 필요한 감열량은?',correct:'100cal',wrong:['0.1cal','10cal','1,000cal'],explain:'0.002kg=2g이므로 2×1×50=100cal이다.'});
put({id:'119-calc3-heat-reverse',family:'heat',stage:'reverse',subject:'fire',scopeId:'F03',conceptId:'F03-C02',difficulty:'high',source:'2026 소방전술1(화재2) 190·345쪽',q:'질량 5g, 비열 1cal/g·℃인 물질에 150cal을 가했다. 온도변화 ΔT는?',correct:'30℃',wrong:['15℃','75℃','150℃'],explain:'ΔT=Q÷(m×c)=150÷5=30℃이다.'});
put({id:'119-calc3-heat-trap',family:'heat',stage:'trap',subject:'fire',scopeId:'F03',conceptId:'F03-C02',difficulty:'high',source:'2026 소방전술1(화재2) 190·345쪽',q:'질량 3g, 비열 0.5cal/g·℃인 물질의 온도가 20℃에서 70℃가 되었다. 감열량은?',correct:'75cal',wrong:['30cal','105cal','135cal'],explain:'ΔT는 최종온도 70이 아니라 70-20=50℃이므로 3×0.5×50=75cal이다.'});
put({id:'119-calc3-heat-exam',family:'heat',stage:'exam',subject:'fire',scopeId:'F03',conceptId:'F03-C02',difficulty:'high',source:'2026 소방전술1(화재2) 190·345쪽',q:'질량 0.01kg, 비열 0.2cal/g·℃인 물질을 30℃에서 80℃까지 가열할 때 감열량은?',correct:'100cal',wrong:['10cal','50cal','200cal'],explain:'0.01kg=10g, ΔT=50℃이므로 10×0.2×50=100cal이다.'});

// 포
put({id:'119-calc3-foam-understand',family:'foam',stage:'understand',subject:'fire',scopeId:'F04',conceptId:'F04-C04',difficulty:'low',source:'2026 소방전술1(화재2) · 포 농도·팽창비 정의',q:'포수용액 S(L)를 C(%) 농도로 만들 때 필요한 포원액량을 구하는 식은?',correct:'S × C ÷ 100',wrong:['S ÷ C × 100','S - C','C ÷ S × 100'],explain:'농도 백분율을 포수용액량에 곱해 원액량을 구한다.'});
put({id:'119-calc3-foam-basic',family:'foam',stage:'basic',subject:'fire',scopeId:'F04',conceptId:'F04-C04',source:'2026 소방전술1(화재2) · 포 농도 정의',q:'포수용액 600L를 3%로 만들 때 필요한 포원액은?',correct:'18L',wrong:['6L','20L','180L'],explain:'600×3÷100=18L이다.'});
put({id:'119-calc3-foam-unit',family:'foam',stage:'unit',subject:'fire',scopeId:'F04',conceptId:'F04-C04',source:'2026 소방전술1(화재2) · 포 농도 정의',q:'포수용액 2㎥를 3% 농도로 만들 때 필요한 포원액은? (1㎥=1,000L)',correct:'60L',wrong:['6L','600L','6,000L'],explain:'2㎥=2,000L이고 2,000×3÷100=60L이다.'});
put({id:'119-calc3-foam-reverse',family:'foam',stage:'reverse',subject:'fire',scopeId:'F04',conceptId:'F04-C04',difficulty:'high',source:'2026 소방전술1(화재2) · 포 농도 정의',q:'포수용액 800L에 포원액 24L가 들어갔다면 농도는?',correct:'3%',wrong:['0.3%','6%','30%'],explain:'24÷800×100=3%이다.'});
put({id:'119-calc3-foam-trap',family:'foam',stage:'trap',subject:'fire',scopeId:'F04',conceptId:'F04-C04',difficulty:'high',source:'2026 소방전술1(화재2) · 포 팽창비 정의',q:'발포 후 포 체적이 1,200L이고 발포 전 포수용액이 100L라면, 농도가 아니라 팽창비는?',correct:'12배',wrong:['0.083배','3배','1,300배'],explain:'팽창비는 발포 후 체적÷발포 전 포수용액 체적 = 1,200÷100=12배이다.'});
put({id:'119-calc3-foam-exam',family:'foam',stage:'exam',subject:'fire',scopeId:'F04',conceptId:'F04-C04',difficulty:'high',source:'2026 소방전술1(화재2) · 포 농도·팽창비 정의',q:'500L의 6% 포수용액을 사용해 발포 후 체적 4,000L의 포가 만들어졌다. 필요한 원액량과 팽창비는?',correct:'30L · 8배',wrong:['30L · 80배','60L · 8배','470L · 8배'],explain:'원액은 500×0.06=30L, 팽창비는 4,000÷500=8배이다.'});

// 산소통
put({id:'119-calc3-o2-understand',family:'oxygen',stage:'understand',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'low',source:'2026 소방전술3(구급) 185~186쪽 · E형 산소통상수 0.28',q:'산소통 사용가능시간 T의 계산식으로 옳은 것은? (P=현재압력,R=안전잔압,C=상수,F=유량)',correct:'T = ((P-R) × C) ÷ F',wrong:['T = (P+R) × F ÷ C','T = P ÷ R ÷ C ÷ F','T = (P-R) × F × C'],explain:'사용 가능한 압력에 실린더상수를 곱하고 분당 유량으로 나눈다.'});
put({id:'119-calc3-o2-basic',family:'oxygen',stage:'basic',subject:'ems',scopeId:'E09',conceptId:'E09-C07',source:'2026 소방전술3(구급) 185~186쪽 · E형 산소통상수 0.28',q:'E형 산소통 현재압력 1,400psi, 안전잔압 200psi, 유량 12L/min이면 사용가능시간은?',correct:'28분',wrong:['14분','35분','56분'],explain:'((1400-200)×0.28)÷12=28분이다.'});
put({id:'119-calc3-o2-unit',family:'oxygen',stage:'unit',subject:'ems',scopeId:'E09',conceptId:'E09-C07',source:'2026 소방전술3(구급) 185~186쪽 · 시간 단위변환',q:'산소통 계산 결과가 90분이라면 시간 단위로는?',correct:'1.5시간',wrong:['0.9시간','1시간','9시간'],explain:'90÷60=1.5시간이다.'});
put({id:'119-calc3-o2-reverse',family:'oxygen',stage:'reverse',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'high',source:'2026 소방전술3(구급) 185~186쪽 · E형 산소통상수 0.28',q:'E형 산소통으로 유량 10L/min을 28분 사용하고 안전잔압 200psi를 남기려면 시작압력은?',correct:'1,200psi',wrong:['800psi','1,000psi','1,400psi'],explain:'P=(T×F÷C)+R=(28×10÷0.28)+200=1,200psi이다.'});
put({id:'119-calc3-o2-trap',family:'oxygen',stage:'trap',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'high',source:'2026 소방전술3(구급) 185~186쪽 · E형 산소통상수 0.28',q:'현재압력 1,000psi, 안전잔압 200psi, 유량 8L/min인 E형 산소통의 사용가능시간은? 잔압을 빼는 것을 잊지 않는다.',correct:'28분',wrong:['22.4분','35분','44.8분'],explain:'((1000-200)×0.28)÷8=28분이며, 35분은 잔압을 빼지 않은 함정값이다.'});
put({id:'119-calc3-o2-exam',family:'oxygen',stage:'exam',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'high',source:'2026 소방전술3(구급) 185~186쪽 · E형 산소통상수 0.28',q:'현재압력 1,800psi, 안전잔압 200psi, E형 상수 0.28, 유량 12L/min일 때 사용가능시간은 약?',correct:'37.3분',wrong:['28분','42분','56분'],explain:'((1800-200)×0.28)÷12≈37.3분이다.'});

// 수액·점적
put({id:'119-calc3-iv-understand',family:'iv',stage:'understand',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'low',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'총 수액량 V(mL), 점적계수 D(gtt/mL), 시간 H(hr)일 때 gtt/min 계산식은?',correct:'V × D ÷ (H × 60)',wrong:['V ÷ D × H','V × H ÷ D','V × D × H × 60'],explain:'시간을 분으로 바꾼 뒤 총 방울 수를 총 분으로 나눈다.'});
put({id:'119-calc3-iv-basic',family:'iv',stage:'basic',subject:'ems',scopeId:'E07',conceptId:'E07-C03',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'500mL를 4시간 동안 20gtt/mL 세트로 주입하면 분당 점적수는 약?',correct:'42gtt/min',wrong:['21gtt/min','50gtt/min','83gtt/min'],explain:'500×20÷(4×60)=41.7이므로 약 42gtt/min이다.'});
put({id:'119-calc3-iv-unit',family:'iv',stage:'unit',subject:'ems',scopeId:'E07',conceptId:'E07-C03',source:'식약처 제조인증 수액세트 점적계수 · 시간 단위변환',q:'6시간 동안 수액을 주입한다면 점적 계산에서 총 시간은 몇 분인가?',correct:'360분',wrong:['60분','180분','600분'],explain:'6×60=360분이다.'});
put({id:'119-calc3-iv-reverse',family:'iv',stage:'reverse',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'high',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'600mL를 20gtt/mL 세트로 40gtt/min에 주입하면 총 주입시간은?',correct:'5시간',wrong:['2.5시간','8시간','10시간'],explain:'총 방울 수 600×20=12,000gtt, 12,000÷40=300분=5시간이다.'});
put({id:'119-calc3-iv-trap',family:'iv',stage:'trap',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'high',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'1,000mL를 8시간 동안 20gtt/mL로 주입할 때 시간당 주입량과 분당 점적수의 조합은?',correct:'125mL/hr · 약 42gtt/min',wrong:['42mL/hr · 125gtt/min','125mL/hr · 125gtt/min','1,000mL/hr · 20gtt/min'],explain:'1,000÷8=125mL/hr이고 1,000×20÷480≈42gtt/min이다.'});
put({id:'119-calc3-iv-exam',family:'iv',stage:'exam',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'high',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'750mL를 5시간 동안 20gtt/mL 수액세트로 주입할 때 분당 점적수는?',correct:'50gtt/min',wrong:['25gtt/min','40gtt/min','150gtt/min'],explain:'750×20÷(5×60)=50gtt/min이다.'});

// 화상·Parkland
put({id:'119-calc3-burn-understand',family:'burn',stage:'understand',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'low',source:'2026 소방전술3(구급) 261쪽',q:'Parkland 24시간 수액량 계산식으로 옳은 것은?',correct:'4mL × 체중(kg) × 2·3도 화상면적(%)',wrong:['0.25mL × 체중 × 화상면적만 사용','체중 ÷ 화상면적 × 4','4mL × 체중만 사용'],explain:'교재의 24시간 Parkland 총량은 4mL×체중×화상면적이다.'});
put({id:'119-calc3-burn-basic',family:'burn',stage:'basic',subject:'ems',scopeId:'E14',conceptId:'E14-C03',source:'2026 소방전술3(구급) 261쪽',q:'체중 65kg, 2·3도 화상면적 20% 환자의 Parkland 24시간 총량은?',correct:'5,200mL',wrong:['1,300mL','2,600mL','10,400mL'],explain:'4×65×20=5,200mL이다.'});
put({id:'119-calc3-burn-unit',family:'burn',stage:'unit',subject:'ems',scopeId:'E14',conceptId:'E14-C03',source:'2026 소방전술3(구급) 261쪽 · 체중 단위변환',q:'체중 70,000g, 2·3도 화상면적 15% 환자의 Parkland 24시간 총량은?',correct:'4,200mL',wrong:['420mL','10,500mL','42,000mL'],explain:'70,000g=70kg이므로 4×70×15=4,200mL이다.'});
put({id:'119-calc3-burn-reverse',family:'burn',stage:'reverse',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'high',source:'2026 소방전술3(구급) 261쪽',q:'체중 60kg 환자의 Parkland 24시간 총량이 4,800mL라면 2·3도 화상면적은?',correct:'20%',wrong:['10%','30%','40%'],explain:'화상면적=4,800÷(4×60)=20%이다.'});
put({id:'119-calc3-burn-trap',family:'burn',stage:'trap',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'high',source:'2026 소방전술3(구급) 261쪽',q:'Parkland 24시간 총량이 7,200mL라면 첫 8시간 투여량은?',correct:'3,600mL',wrong:['1,800mL','4,800mL','7,200mL'],explain:'첫 8시간에는 24시간 총량의 절반인 3,600mL를 투여한다.'});
put({id:'119-calc3-burn-exam',family:'burn',stage:'exam',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'high',source:'2026 소방전술3(구급) 261쪽',q:'체중 55kg, 2·3도 화상면적 30% 환자의 Parkland 24시간 총량과 첫 8시간량의 조합은?',correct:'6,600mL · 3,300mL',wrong:['3,300mL · 1,650mL','6,600mL · 6,600mL','13,200mL · 6,600mL'],explain:'4×55×30=6,600mL이고 첫 8시간에는 그 절반인 3,300mL를 투여한다.'});

function inferFamily(q){
  if(q.calcFamily)return q.calcFamily;
  const id=String(q.id||''),s=String(q.source||'')+' '+String(q.q||'');
  if(/haz|지정수량|위험물/.test(id+' '+s))return'hazmat';
  if(/burn|Parkland|화상/.test(id+' '+s))return'burn';
  if(/oxygen|산소통/.test(id+' '+s))return'oxygen';
  if(/drip|gtt|수액/.test(id+' '+s))return'iv';
  if(/foam|포수용액|팽창비|포원액/.test(id+' '+s))return'foam';
  if(/heat|감열|비열|Q=m/.test(id+' '+s))return'heat';
  if(/comb|air|gas|공기량|산소량|공기비|보일/.test(id+' '+s))return'combustion';
  return'other';
}
function inferStage(q){
  if(q.calcStage)return q.calcStage;
  const stem=String(q.q||'');
  if(/계산식|관계식|점적계수/.test(stem))return'understand';
  if(/몇 시간|시작압력|화상면적/.test(stem))return'reverse';
  if(/kg.*g|g.*kg|㎥.*L|시간.*분|분.*시간/.test(stem))return'unit';
  if(q.difficulty==='high')return'trap';
  return'basic';
}

const seenId=new Set(V.questions.map(q=>q.id)),seenText=new Set(V.questions.map(q=>String(q.q||'').replace(/\s+/g,' ').trim().toLowerCase()));
let added=0;
for(const q of made){
  const k=String(q.q).replace(/\s+/g,' ').trim().toLowerCase();
  if(seenId.has(q.id)||seenText.has(k))continue;
  V.questions.push(q);seenId.add(q.id);seenText.add(k);added++;
}
for(const q of V.questions.filter(q=>q.type==='계산형')){
  q.calcFamily=inferFamily(q);
  q.calcStage=inferStage(q);
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.QuestionDifficulty?.annotate?.(V.questions);

function audit(){
  const rows=Object.keys(FAMILY_LABELS).map(family=>{
    const qs=V.questions.filter(q=>q.type==='계산형'&&q.calcFamily===family);
    const stages=Object.fromEntries(STAGES.map(([k])=>[k,qs.filter(q=>q.calcStage===k).length]));
    return{family,label:FAMILY_LABELS[family],total:qs.length,stages,ready:STAGES.every(([k])=>stages[k]>=1)};
  });
  return{version:'119-calculation-training-v3',rows,ready:rows.every(x=>x.ready),added,stageCount:STAGES.length,allGeneratedPractice:made.every(q=>q.grade==='P'&&q.pastExamClaim===false)};
}
V.CalculationTraining119={version:'119-calculation-training-v3',STAGES,FAMILY_LABELS,audit,added,planned:made.length,realMockCredit:false};
})();