finishExam=function(auto=false){
  if(!state.exam||state.exam.finishing)return;
  const e=state.exam;const unanswered=e.qs.length-Object.keys(e.answers).length;
  if(!auto&&unanswered>0&&!confirm(`미응답 ${unanswered}문제가 있습니다. 그래도 채점할까요?`))return;
  e.finishing=true;
  const breakdown={'소방학개론':{total:25,correct:0,answered:0},'응급처치학개론':{total:40,correct:0,answered:0}};let correct=0;
  for(const q of e.qs){const ans=e.answers[q.instance],row=breakdown[q.subject];if(row&&ans!==undefined)row.answered++;if(ans===q.a){correct++;if(row)row.correct++;}else if(ans!==undefined){const existing=state.wrongs.find(w=>w.qid===q.id&&!w.resolved);if(!existing)state.wrongs.push({id:uid('wrong'),qid:q.id,q,confidence:e.conf[q.instance]||'none',at:Date.now(),dueAt:Date.now(),intervalDays:1,attempts:1,resolved:false});}}
  const durationSec=Math.min(3900,Math.floor((Date.now()-e.started)/1000));const result={id:uid('exam'),at:Date.now(),correct,score:Math.round(correct/65*100),unanswered,durationSec,marked:Object.values(e.marked).filter(Boolean).length,blueprint:e.blueprint||{fire:25,ems:40,minutes:65,version:EXAM_2026.version},breakdown};
  state.examHistory.push(result);store.set('examHistory',state.examHistory);store.set('wrongs',state.wrongs);clearInterval(examTimer);state.exam=null;toast(`${result.correct}/65 · ${result.score}점`);go('stats');
};
if(state.page==='exam')render();
