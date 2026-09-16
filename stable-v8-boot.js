'use strict';
(()=>{
const A=window.AITUTOR,baseRender=render,baseBind=bind,baseRunQA=runQA;
function scrub(){document.title='AI과외';$$('*').forEach(el=>{if(el.children.length===0&&el.textContent&&/무료\s*AI/.test(el.textContent))el.textContent=el.textContent.replace(/무료\s*AI/g,'AI')})}
render=function(){baseRender();scrub()};
bind=function(){baseBind();A.bindCore?.();A.bindSource?.();A.bindUpload?.();scrub()};
runQA=function(){const b=baseRunQA(),rows=(b.rows||[]).filter(x=>!String(x.name).includes('22단원')&&!String(x.name).includes('무료 AI'));const add=(name,ok,detail='')=>rows.push({name,ok:!!ok,detail});add('앱 이름 AI과외',document.querySelector('.brand')?.textContent==='AI과외');add('UI 무료 AI 문구 제거',!document.body.innerText.includes('무료 AI'));add('소방학 4대 영역',A.fire?.length===4);add('응급처치 공식교재 24장',A.ems?.length===24);add('두 과목 문제 필터',typeof bank==='function');add('PDF·사진·TXT 업로드',typeof fileRead==='function');add('다중 공식 PDF 색인',typeof A.importOfficial==='function'&&typeof A.restoreSources==='function');add('범위밖 fail-closed',A.sourceDefs?.filter(x=>!x.allowed).every(x=>['scope-lock','reference'].includes(x.mode)));add('공식근거 검색',typeof A.hits==='function'&&typeof A.ground==='function');add('B문제 근거 게이트',typeof A.questionFor==='function');state.qa={rows,pass:rows.filter(x=>x.ok).length,total:rows.length};S.set('qa',state.qa);render();return state.qa};
exportData=function(){const b=new Blob([JSON.stringify({schema:8,app:'AI과외',...Object.fromEntries(['profile','notes','generated','answers','conf','wrongs','examHistory','chat'].map(k=>[k,state[k]]))},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='ai-tutor-study-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
A.restoreSources?.().finally(()=>{render();setTimeout(()=>runQA(),120)});
})();
