'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const LEVELS={
  low:{id:'low',label:'하',title:'기초',desc:'정의·대표수치·직접회상 중심'},
  mid:{id:'mid',label:'중',title:'표준',desc:'비교·예외·상황판단·2단계 사고'},
  high:{id:'high',label:'상',title:'심화',desc:'지엽·예외·복합비교·계산·함정선지'}
};
const PROFILES={
  easy:{label:'쉬움',mix:{low:.65,mid:.30,high:.05}},
  standard:{label:'표준',mix:{low:.25,mid:.55,high:.20}},
  hard:{label:'어려움',mix:{low:.10,mid:.40,high:.50}},
  extreme:{label:'지엽집중',mix:{low:.05,mid:.25,high:.70}}
};
function infer(q){
  if(q.difficulty&&LEVELS[q.difficulty])return q.difficulty;
  const t=(q.q||'')+' '+(q.ex||'');
  if(/계산|배수|옳지 않은|모두|예외|제외|비교|조합|순서|가장 적절하지/.test(t))return'high';
  if(/구분|원리|상황|적절한|특징|연결/.test(t))return'mid';
  return'low';
}
function annotate(list=[]){for(const q of list){q.difficulty=infer(q);q.difficultyLabel=LEVELS[q.difficulty].label}return list}
function stats(list=[]){const out={low:0,mid:0,high:0};for(const q of list)out[infer(q)]++;return out}
V.QuestionDifficulty={levels:LEVELS,profiles:PROFILES,infer,annotate,stats};
if(Array.isArray(V.questions))annotate(V.questions);
})();