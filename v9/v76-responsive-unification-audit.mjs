import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};

const index=read('./index.html');
const styles=read('./styles.css');
const responsive=read('./v54-responsive.css');
const sw=read('./sw.js');

assert(!/<style>/.test(index),'V76 removes the one-off inline responsive style layer');
assert((responsive.match(/--study-max:1680px/g)||[]).length>=1,'study width token reflects the current fluid desktop contract');
assert(!responsive.includes('--study-max:1440px'),'legacy 1440px large-desktop study cap is removed');
assert(responsive.includes('.page-study .study-body-unified>:not(.concept-nav-single)'),'study content shares one canonical width owner');
assert(responsive.includes('grid-template-columns:repeat(5,minmax(0,1fr))!important'),'five study tabs use one equal-column grid');
assert(responsive.includes('.page-study .concept-visual .vertical-org>.visual-node{flex:0 0 auto!important;min-height:0!important;height:auto!important;padding:10px 14px!important}'),'organization nodes neutralize inherited flex basis and size to content');
assert(responsive.includes('grid-template-columns:repeat(auto-fit,minmax(190px,1fr))!important'),'desktop flow diagrams use responsive auto-fit columns');
assert(responsive.includes('@media(min-width:721px) and (max-width:1024px)')&&responsive.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'),'tablet flow diagrams use two columns');
assert(responsive.includes('@media(max-width:720px)')&&responsive.includes('.page-study .concept-visual .visual-flow:not(.vertical-org){grid-template-columns:1fr!important'),'mobile flow diagrams collapse to one column');
assert(responsive.includes('.page-study .study-ai{max-width:var(--study-max)!important'),'AI uses the same content-width owner as study content');
assert(responsive.includes('.page-study .study-ai .tutor-compose{position:static!important'),'AI composer remains in document flow and cannot cover the latest answer');
assert(responsive.includes('.page-study .study-ai-chat{min-height:0!important;max-height:none!important;overflow:visible!important'),'AI history does not become a second vertical scroll owner');
assert(!responsive.includes('.page-study .study-body-desktop>.lesson,.page-study .detail-view{width:100%;max-width:980px!important}'),'legacy 980px study cap is removed');
assert(!responsive.includes('.page-study .study-body-unified>.lesson{width:100%;max-width:980px'),'legacy unified-body 980px cap is removed');
assert(!styles.includes('.page-study .concept-nav{position:sticky!important;bottom:0!important;z-index:10!important}'),'legacy sticky concept navigation override is removed');
assert(!styles.includes('.page-study .study-body-desktop>.lesson{max-width:900px!important}'),'legacy tablet 900px lesson cap is removed');
assert(!styles.includes('.page-study .study-body-desktop>.lesson{max-width:1240px!important}'),'legacy large-desktop 1240px lesson cap is removed');
assert(sw.includes("ai-tutor-v9-shell-20261002-v82-auth-ux"),'current shell cache epoch ships the unified responsive assets');

console.log('V76_RESPONSIVE_UNIFICATION_AUDIT_SUCCESS');
// Exact-head V76 responsive regression trigger.
