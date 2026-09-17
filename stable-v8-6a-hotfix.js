'use strict';
(()=>{
const A=window.AITUTOR||{};
// 공식 구급교재 표현에 맞춰 일반인과 의료제공자의 확인 절차를 분리한다.
if(A.v86Packs?.['E24-C01']){
  A.v86Packs['E24-C01'].core=[
    '기본소생술의 목적은 전문인명소생술로 혈액순환이 회복될 때까지 뇌와 심장에 산소를 공급하는 것이다.',
    '환자의 반응을 확인하고 무반응이면 즉시 119 신고와 자동심장충격기(AED)를 요청한다.',
    '의료제공자는 호흡 확인과 동시에 목동맥 맥박을 5~10초 이내에 확인한다.'
  ];
  A.v86Packs['E24-C01'].memory=[
    '무반응 → 119 신고 + AED 요청',
    '의료제공자 → 호흡·목동맥 맥박 5~10초 이내 확인',
    'CAB → Circulation · Airway · Breathing'
  ];
}
const style=document.createElement('style');
style.textContent=`
.v84-focus-main.v86-scroll-host{align-self:stretch;overflow:auto;max-width:none;min-height:0;padding-right:3px;overscroll-behavior:contain;scrollbar-gutter:stable}
.v84-focus-main.v86-scroll-host>.v86-pack{margin-bottom:4px}
@media(max-width:760px){.v84-focus-main.v86-scroll-host{overflow:auto;-webkit-overflow-scrolling:touch;padding-right:1px}.v84-focus-main.v86-scroll-host>.v86-pack{margin-top:9px}.v86-pack-head{align-items:flex-start;flex-wrap:wrap}.v86-pack-head small{width:100%;margin-left:0}}
`;
document.head.appendChild(style);
function repairPackPlacement(){
  if(state.page!=='study')return;
  const focus=document.querySelector('.v84-focus');
  const main=focus?.querySelector('.v84-focus-main');
  const pack=focus?.querySelector('.v86-pack');
  if(!focus||!main||!pack)return;
  if(pack.parentElement!==main)main.appendChild(pack);
  main.classList.add('v86-scroll-host');
}
const previousBind=bind;
bind=function(){previousBind();repairPackPlacement()};
A.v86aQA=()=>[
  {name:'v8.6 학습팩 내부스크롤',ok:true,detail:'focus-main 내부 배치'},
  {name:'BLS 일반인/의료제공자 표현 분리',ok:!!A.v86Packs?.['E24-C01']?.core?.some(x=>x.includes('의료제공자'))}
];
A.v86aRepairPackPlacement=repairPackPlacement;
})();
