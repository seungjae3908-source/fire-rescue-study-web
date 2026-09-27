import fs from 'node:fs';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const P=require('./api/official-pdf.js');
const doc=String(process.argv[2]||'');
const out=String(process.argv[3]||'');
if(!['fire1','fire2','ems'].includes(doc)||!out)throw new Error('USAGE: node official-pdf-materialize-resolve.mjs <fire1|fire2|ems> <output.json>');
const row=await P.resolveSource(doc,true);
if(!row?.urls?.length||!row.detailUrl)throw new Error('OFFICIAL_PDF_MATERIALIZE_RESOLVE_EMPTY_'+doc);
fs.writeFileSync(out,JSON.stringify({doc,name:row.name,urls:row.urls,detailUrl:row.detailUrl,cookie:row.cookie||''}),{mode:0o600});
console.log('OFFICIAL_PDF_MATERIALIZE_RESOLVED',JSON.stringify({doc,urlCount:row.urls.length,hasCookie:!!row.cookie}));
