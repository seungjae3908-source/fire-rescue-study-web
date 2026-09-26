'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const base='https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/';
const cfg=window.AITUTOR_V9_CONFIG||{};
const host=typeof location!=='undefined'?String(location.hostname||''):'';
const sameOriginProduction=/^fire-rescue-study-web(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(host);
const proxyBase=String(sameOriginProduction?(location.origin||''):(cfg.officialPdfProxyBase||'')).replace(/\/$/,'');
const mirrorBase=String(sameOriginProduction?'':(cfg.officialPdfMirrorBase||'')).replace(/\/$/,'');
const mirrorDocs=new Set(sameOriginProduction?[]:(Array.isArray(cfg.officialPdfMirrorDocs)?cfg.officialPdfMirrorDocs:[]));
const mirrored=doc=>!!mirrorBase&&mirrorDocs.has(doc);
const proxyPdf=doc=>`${proxyBase}/api/official-pdf?doc=${encodeURIComponent(doc)}`;
const mirrorPdf=doc=>mirrored(doc)?`${mirrorBase}/${encodeURIComponent(doc)}.pdf`:'';
const directPdf=doc=>mirrorPdf(doc)||proxyPdf(doc);
const transport=doc=>mirrored(doc)?'range-static':'full-cache-proxy';
const C={
  ems:{
    key:'ems',label:'2026 소방전술3(구급)',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106811&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('ems'),mirrorPdf:mirrorPdf('ems'),proxyPdf:proxyPdf('ems'),transport:transport('ems'),proxyDoc:'ems',expectedNames:['13. 소방전술3(구급)-저용량.pdf']
  },
  fire1:{
    key:'fire1',label:'2026 소방전술1(화재1)',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('fire1'),mirrorPdf:mirrorPdf('fire1'),proxyPdf:proxyPdf('fire1'),transport:transport('fire1'),proxyDoc:'fire1',expectedNames:['10. 소방전술1(화재1).pdf']
  },
  fire2:{
    key:'fire2',label:'2026 소방전술1(화재2)',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('fire2'),mirrorPdf:mirrorPdf('fire2'),proxyPdf:proxyPdf('fire2'),transport:transport('fire2'),proxyDoc:'fire2',expectedNames:['11. 소방전술1(화재2).pdf']
  },
  prevention1:{
    key:'prevention1',label:'2026 예방실무1',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('prevention1'),mirrorPdf:mirrorPdf('prevention1'),proxyPdf:proxyPdf('prevention1'),transport:transport('prevention1'),proxyDoc:'prevention1',expectedNames:['1.예방실무1.pdf']
  },
  prevention2:{
    key:'prevention2',label:'2026 예방실무2',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('prevention2'),mirrorPdf:mirrorPdf('prevention2'),proxyPdf:proxyPdf('prevention2'),transport:transport('prevention2'),proxyDoc:'prevention2',expectedNames:['2.예방실무2.pdf']
  },
  law1:{key:'law1',label:'2026 소방법령1',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('law1'),mirrorPdf:mirrorPdf('law1'),proxyPdf:proxyPdf('law1'),transport:transport('law1'),proxyDoc:'law1',expectedNames:['3._소방법령1.pdf']},
  law2:{key:'law2',label:'2026 소방법령2',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('law2'),mirrorPdf:mirrorPdf('law2'),proxyPdf:proxyPdf('law2'),transport:transport('law2'),proxyDoc:'law2',expectedNames:['4. 소방법령2.pdf']},
  law3:{key:'law3',label:'2026 소방법령3',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('law3'),mirrorPdf:mirrorPdf('law3'),proxyPdf:proxyPdf('law3'),transport:transport('law3'),proxyDoc:'law3',expectedNames:['5. 소방법령3.pdf']},
  law4:{key:'law4',label:'2026 소방법령4',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('law4'),mirrorPdf:mirrorPdf('law4'),proxyPdf:proxyPdf('law4'),transport:transport('law4'),proxyDoc:'law4',expectedNames:['6. 소방법령4.pdf']},
  law5:{key:'law5',label:'2026 소방법령5',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('law5'),mirrorPdf:mirrorPdf('law5'),proxyPdf:proxyPdf('law5'),transport:transport('law5'),proxyDoc:'law5',expectedNames:['7. 소방법령5.pdf']}
};
function get(key){return C[key]||null}
function resolveForConcept(id){const c=V.curriculum?.byId?.[id],r=c?.sourceRanges?.[0];return r?.doc?get(r.doc):null}
function canDirect(key){return !!get(key)?.directPdf}
function withDirect(key,url,meta={}){if(!C[key])return false;C[key]={...C[key],directPdf:url||'',...meta};return true}
function audit(){const rows=Object.values(C);return{total:rows.length,direct:rows.filter(x=>x.directPdf).length,fallback:rows.filter(x=>!x.directPdf).length,licenseOk:rows.every(x=>x.license==='KOGL-1'),rows}}
V.SourceCatalog119={catalog:C,get,resolveForConcept,canDirect,withDirect,audit,policy:{officialOnly:true,noUserUploadRequired:true,attributionRequired:true,directWhenVerified:true,officialPageFallback:true,sameOriginProxy:!proxyBase,crossOriginProxy:!!proxyBase,arbitraryUrlProxy:false,allCatalogDocsProxyable:true,staticMirrorEnabled:!!mirrorBase,staticMirrorDocs:[...mirrorDocs]}};
})();