import fs from 'node:fs';

const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('./source-pdf.js',import.meta.url),'utf8');
const catalog=fs.readFileSync(new URL('./source-catalog-119.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const manifest=JSON.parse(fs.readFileSync(new URL('./manifest.webmanifest',import.meta.url),'utf8'));

const failures=[];
const ok=(v,m)=>{if(!v)failures.push(m);else console.log('PASS',m)};

ok(app.includes('bindDetailSectionTracking()'),'detail scroll tracking is wired after render');
ok(app.includes('syncDetailTocActive(root,key,{scrollChip:true})'),'detail click updates active state');
ok(app.includes("e.target.matches('[data-tutor-input]')&&!e.isComposing"),'tutor Enter send handler exists');
ok(css.includes('.detail-toc-chip[aria-current="location"]'),'active detail chip has explicit style');
ok(css.includes('.detail-section-active h3'),'active detail section title is highlighted');
ok(index.includes('<title>소방합격</title>'),'browser title is 소방합격');
ok(index.includes('content="소방합격"'),'description is 소방합격');
ok(manifest.name==='소방합격'&&manifest.short_name==='소방합격','PWA name is 소방합격');
ok(catalog.includes('sameOriginProduction'),'production source catalog prefers same-origin PDF API');
ok(source.includes("origin='official-proxy-full-cache'"),'proxy PDF uses reliable full-cache path');
ok(!source.includes('proxyRange=!staticRange'),'legacy proxy-range path removed');

if(failures.length){
  console.error('V68_DETAIL_SOURCE_BRAND_AUDIT_FAIL',JSON.stringify(failures));
  process.exit(1);
}
console.log('V68_DETAIL_SOURCE_BRAND_AUDIT_SUCCESS');
