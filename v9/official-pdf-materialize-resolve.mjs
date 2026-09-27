import fs from 'node:fs';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const P=require('./api/official-pdf.js');
const doc=String(process.argv[2]||'');
const out=String(process.argv[3]||'');
const allowed=['fire1','fire2','ems','prevention1','prevention2','law1','law2','law3','law4','law5'];
if(!allowed.includes(doc)||!out)throw new Error('USAGE: node official-pdf-materialize-resolve.mjs <official-doc-key> <output.json>');
const row=await P.resolveSource(doc,true);
if(!row?.urls?.length||!row.detailUrl)throw new Error('OFFICIAL_PDF_MATERIALIZE_RESOLVE_EMPTY_'+doc);
fs.writeFileSync(out,JSON.stringify({doc,name:row.name,urls:row.urls,detailUrl:row.detailUrl,cookie:row.cookie||''}),{mode:0o600});
console.log('OFFICIAL_PDF_MATERIALIZE_RESOLVED',JSON.stringify({doc,urlCount:row.urls.length,hasCookie:!!row.cookie}));
