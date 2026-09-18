'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},P=V.contentPacks?.authored;
if(!P)return;
const p=P['F05-C01'];if(!p||p.status!=='verified')throw new Error('CALCULATION_CONTRACT_F05_C01_NOT_VERIFIED');
p.calculations=[...new Map([
  ...(p.calculations||[]),
  {
    title:'지정수량 배수',
    formula:'Σ(저장·취급량 ÷ 해당 품명의 지정수량)',
    note:'서로 다른 위험물을 함께 저장·취급할 때 각 품목의 저장·취급량을 해당 지정수량으로 나눈 값을 합산한다.',
    example:'황화린 100kg ÷ 100kg + 철분 250kg ÷ 500kg = 1.5배',
    source:'소방청 위험물 공통 규칙 · 119 Hazmat2026 지정수량 계약'
  }
].map(x=>[x.title,x])).values()];
V.CalculationContract119={
  version:'119-source-applicable-calculation-v2',
  requiredIds:['F03-C03','F05-C01','F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07','E14-C03'],
  falsePositiveRemoved:['F04-C02','F04-C03','F04-C04','F04-C05','F04-C06','F04-C08','F05-C08'],
  sourcePolicy:'only concepts with actual formula/quantity-calculation applicability'
};
})();