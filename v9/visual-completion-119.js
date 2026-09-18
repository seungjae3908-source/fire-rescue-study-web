'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},X=V.Visual119,P=V.contentPacks?.authored,C=V.curriculum?.byId;
if(!X?.data||!X?.render||!P||!C)return;

const targets=[
'F03-C06','F07-C05',
'E04-C01','E04-C02','E07-C01','E09-C01','E10-C01','E10-C04',
'E11-C01','E11-C03','E11-C04','E11-C05','E12-C01','E14-C03',
'E15-C01','E15-C03','E16-C01','E20-C01','E20-C02','E20-C03','E20-C04',
'E21-C01','E21-C02','E21-C04','E22-C01','E24-C02','E24-C05'
];
const preferred={
'F03-C06':['flashover-flow','backdraft-flow','rollover-flow'],
'F07-C05':['sprinkler-system'],
'E09-C01':['ems-airway-open'],
'E11-C04':['ems-ecg-arrest-rhythms'],
'E11-C05':['ems-ecg-arrest-rhythms','ems-electrical-therapy'],
'E11-C06':['ems-electrical-therapy'],
'E24-C02':['ems-airway-open']
};
const clean=x=>String(x||'').replace(/\s+/g,' ').trim();
const clip=(x,n=42)=>{const s=clean(x);return s.length>n?s.slice(0,n-1)+'…':s};
const uniq=a=>[...new Map(a.filter(Boolean).map(x=>[clean(x).toLowerCase(),clean(x)])).values()];

function groundedNodes(id){
  const p=P[id],c=C[id];if(!p||!c)return[];
  const pools=[
    p.flow||[],
    p.must||[],
    (p.compare||[]).map(x=>Array.isArray(x)?x[0]+': '+x[1]:x),
    (p.deepSections||[]).map(x=>x.title),
    p.detail||[],
    [p.summary]
  ];
  const out=[];
  for(const pool of pools){
    for(const x of pool){
      const t=clip(x);if(!t||out.some(y=>y===t))continue;
      out.push(t);if(out.length>=5)return out;
    }
  }
  return out;
}
const assigned={};
for(const id of targets){
  const p=P[id],c=C[id];if(!p||p.status!=='verified')throw new Error('VISUAL_COMPLETION_SOURCE_NOT_VERIFIED '+id);
  const ranges=c.sourceRanges||[];
  if(!ranges.length||!ranges.every(r=>r.doc&&Number.isFinite(Number(r.from))))throw new Error('VISUAL_COMPLETION_PAGE_EVIDENCE_MISSING '+id);
  let ids=(preferred[id]||[]).filter(x=>Array.isArray(X.data[x])&&X.data[x].length>=3);
  if(!ids.length){
    const nodes=groundedNodes(id);
    if(nodes.length<3)throw new Error('VISUAL_COMPLETION_INSUFFICIENT_GROUNDED_NODES '+id);
    const vid='contract-'+id.toLowerCase();
    X.data[vid]=nodes;
    ids=[vid];
  }
  p.visuals=[...new Set([...(p.visuals||[]),...ids])];
  const rendered=p.visuals.map(x=>X.render(x)).filter(Boolean);
  if(!rendered.length)throw new Error('VISUAL_COMPLETION_RENDER_FAIL '+id);
  assigned[id]={visuals:p.visuals.slice(),rendered:rendered.length};
}
V.VisualCompletion119={version:'119-grounded-visual-completion-v1',targets,assigned,sourcePolicy:'verified pack + numeric official sourceRanges'};
})();