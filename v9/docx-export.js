'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const enc=new TextEncoder(),crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
const u16=(v,o,x)=>v.setUint16(o,x,true),u32=(v,o,x)=>v.setUint32(o,x>>>0,true);
function storedZip(entries){
 const locals=[],centrals=[];let offset=0,centralSize=0;const d=new Date(),time=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),date=((Math.max(1980,d.getFullYear())-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
 for(const e of entries){const name=enc.encode(e.name),data=typeof e.data==='string'?enc.encode(e.data):e.data,crc=crc32(data),lh=new Uint8Array(30),lv=new DataView(lh.buffer);u32(lv,0,0x04034b50);u16(lv,4,20);u16(lv,6,0x0800);u16(lv,8,0);u16(lv,10,time);u16(lv,12,date);u32(lv,14,crc);u32(lv,18,data.length);u32(lv,22,data.length);u16(lv,26,name.length);locals.push(lh,name,data);const ch=new Uint8Array(46),cv=new DataView(ch.buffer);u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0x0800);u16(cv,10,0);u16(cv,12,time);u16(cv,14,date);u32(cv,16,crc);u32(cv,20,data.length);u32(cv,24,data.length);u16(cv,28,name.length);u32(cv,42,offset);centrals.push(ch,name);centralSize+=46+name.length;offset+=30+name.length+data.length}
 const end=new Uint8Array(22),ev=new DataView(end.buffer);u32(ev,0,0x06054b50);u16(ev,8,entries.length);u16(ev,10,entries.length);u32(ev,12,centralSize);u32(ev,16,offset);return new Blob([...locals,...centrals,end],{type:MIME})
}
function run(text,kind='p'){
 const size=kind==='title'?36:kind==='h1'?30:kind==='h2'?27:kind==='h3'?24:22,bold=kind!=='p'&&kind!=='li',prefix=kind==='li'?'• ':'';
 return `<w:p><w:pPr><w:spacing w:after="${kind==='title'?220:kind.startsWith('h')?140:70}" w:line="340"/>${kind==='title'?'<w:jc w:val="center"/>':''}</w:pPr><w:r><w:rPr>${bold?'<w:b/>':''}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/><w:lang w:val="ko-KR" w:eastAsia="ko-KR"/></w:rPr><w:t xml:space="preserve">${esc(prefix+text)}</w:t></w:r></w:p>`
}
function rowsFromHtml(html,title){
 const doc=new DOMParser().parseFromString(String(html||''),'text/html'),rows=[{text:title,kind:'title'}],seenCover=false;
 for(const el of doc.body.querySelectorAll('h1,h2,h3,p,li')){
  const text=String(el.textContent||'').replace(/\s+/g,' ').trim();if(!text)continue;
  if(!seenCover&&el.tagName==='H1'&&text===title){seenCover=true;continue}
  const kind=el.tagName==='H1'?'h1':el.tagName==='H2'?'h2':el.tagName==='H3'?'h3':el.tagName==='LI'?'li':'p';
  rows.push({text,kind})
 }
 return rows
}
export function buildDocxBlobFromHtml(html,title='소방합격'){
 const body=rowsFromHtml(html,title).map(x=>run(x.text,x.kind)).join('');
 const document=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
 const types='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
 const rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
 return storedZip([{name:'[Content_Types].xml',data:types},{name:'_rels/.rels',data:rels},{name:'word/document.xml',data:document}])
}

V.DocxExport119={buildDocxBlobFromHtml};
})();
