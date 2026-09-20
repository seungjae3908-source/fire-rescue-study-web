'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},C=V.curriculum,P=V.contentPacks?.authored;
if(!C?.concepts||!P)return;

const TEMPLATES={
  governance:{label:'조직·행정형',detailOrder:['definition','structure','roles','legal','comparison','traps'],coreVisual:'hierarchy',genericSchema:false},
  law:{label:'법령·제도형',detailOrder:['definition','target','actor','requirements','procedure','exceptions','numbers','traps'],coreVisual:'matrix',genericSchema:false},
  phenomenon:{label:'화재현상형',detailOrder:['definition','conditions','mechanism','warning','progress','risk','comparison'],coreVisual:'flow',genericSchema:true},
  suppression:{label:'소화·약제형',detailOrder:['definition','mechanism','characteristics','application','limitations','comparison','traps'],coreVisual:'matrix',genericSchema:false},
  hazmat:{label:'위험물형',detailOrder:['classification','items','designatedQuantity','properties','storage','extinguishing','prohibitions','comparison'],coreVisual:'table',genericSchema:false},
  facility:{label:'설비형',detailOrder:['purpose','components','mechanism','sequence','types','application','comparison','traps'],coreVisual:'flow',genericSchema:false},
  investigation:{label:'조사·절차형',detailOrder:['purpose','principles','procedure','evidence','record','traps'],coreVisual:'steps',genericSchema:false},
  emsSystem:{label:'구급체계·법규형',detailOrder:['definition','system','roles','legal','procedure','comparison','traps'],coreVisual:'flow',genericSchema:false},
  emsAnatomy:{label:'해부·생리형',detailOrder:['structure','function','normal','clinicalLink','numbers','traps'],coreVisual:'anatomy',genericSchema:false},
  emsAssessment:{label:'환자평가형',detailOrder:['purpose','sequence','assessment','redFlags','reassessment','traps'],coreVisual:'steps',genericSchema:false},
  emsProcedure:{label:'처치·술기형',detailOrder:['indication','assessment','sequence','technique','contraindications','complications','traps'],coreVisual:'steps',genericSchema:false},
  emsCondition:{label:'질환·응급형',detailOrder:['definition','cause','signs','assessment','treatment','redFlags','comparison','traps'],coreVisual:'clinical',genericSchema:false},
  emsTrauma:{label:'외상형',detailOrder:['mechanism','assessment','signs','treatment','immobilization','complications','traps'],coreVisual:'clinical',genericSchema:false},
  emsResuscitation:{label:'소생술형',detailOrder:['recognition','sequence','technique','numbers','aed','specialCases','traps'],coreVisual:'algorithm',genericSchema:false},
  equipment:{label:'장비형',detailOrder:['purpose','components','indications','use','checks','contraindications','traps'],coreVisual:'equipment',genericSchema:false}
};

function infer(c){
  const id=c.id||'',s=c.scopeId||'',t=String(c.title||'');
  if(c.subject==='fire'){
    if(s==='F01'||s==='F02')return governance;
    if(s==='F03')return phenomenon;
    if(s==='F04')return suppression;
    if(s==='F05')return hazmat;
    if(s==='F06')return investigation;
    if(s==='F07')return facility;
    return law
  }
  if(s==='E01'||s==='E02'||s==='E05')return emsSystem;
  if(s==='E04')return emsAnatomy;
  if(s==='E07')return equipment;
  if(s==='E08')return emsAssessment;
  if(s==='E06'||s==='E09')return emsProcedure;
  if(s==='E14'||s==='E15'||s==='E16')return emsTrauma;
  if(s==='E24'||/심폐소생|제세동|심장충격|소생술/.test(t))return emsResuscitation;
  if(s==='E03')return emsProcedure;
  return emsCondition
}
const governance='governance',law='law',phenomenon='phenomenon',suppression='suppression',hazmat='hazmat',investigation='investigation',facility='facility',emsSystem='emsSystem',emsAnatomy='emsAnatomy',emsAssessment='emsAssessment',emsProcedure='emsProcedure',emsCondition='emsCondition',emsTrauma='emsTrauma',emsResuscitation='emsResuscitation',equipment='equipment';

const map={};
for(const c of C.concepts){
  const type=infer(c),cfg=TEMPLATES[type]||TEMPLATES.law;
  map[c.id]={id:c.id,type,label:cfg.label,detailOrder:[...cfg.detailOrder],coreVisual:cfg.coreVisual,genericSchema:cfg.genericSchema};
  const p=P[c.id];
  if(p){p.studyType=type;p.studyTemplate=map[c.id]}
}

function termsFor(id){
  const c=C.byId?.[id],p=P[id]||{},rows=[c?.title,...(p.compare||[]).map(x=>x?.[0]),p.compareFamily?.title];
  return [...new Set(rows.flatMap(v=>String(v||'').split(/[·,/()\s-]+/)).map(x=>x.trim()).filter(x=>x.length>=2))]
}
V.ConceptArchitecture119={
  version:'119-concept-architecture-v1',
  templates:TEMPLATES,
  map,
  get:id=>map[id]||null,
  typeOf:id=>map[id]?.type||'law',
  termsFor,
  policy:{
    fireAndEms:true,
    oneConceptOneBoundary:true,
    coreIsReviewLayer:true,
    detailIsTextbookLayer:true,
    genericPhenomenonFieldsOnlyForPhenomena:true,
    currentConceptAiBoundary:true
  }
};
})();