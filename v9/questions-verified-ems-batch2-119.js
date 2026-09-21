'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions))return;
const Q=[
{
 id:'119-verems2-airway-open-01',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C03',
 difficulty:'mid',type:'상황형',source:'2026 소방전술3(구급) 166~167쪽',
 q:'교통사고 후 머리·목·척추 손상이 의심되는 무의식 환자의 기도를 열어야 한다. 우선 고려할 방법은?',
 choices:['머리 움직임을 최소화하며 턱밀어올리기법을 고려한다','목을 최대한 뒤로 젖혀 머리기울임만 강하게 시행한다','기도평가 없이 입인두기도기를 먼저 삽입한다','환자를 앉힌 뒤 물을 마시게 한다'],a:0,
 choiceExplanations:['정답. 척추손상 가능성이 있으면 경추 움직임을 최소화하면서 턱밀어올리기를 우선 고려한다.','과도한 목 젖힘은 의심되는 경추손상을 악화시킬 수 있다.','기도 상태와 의식·구역반사 평가가 먼저다.','기도개방 방법이 아니며 흡인 위험을 높일 수 있다.']
},
{
 id:'119-verems2-rr-age-01',grade:'B',subject:'ems',scopeId:'E10',conceptId:'E10-C02',
 difficulty:'mid',type:'수치비교형',source:'2026 소방전술3(구급) 193쪽',
 q:'교재의 정상 호흡수 범위를 연령별로 올바르게 연결한 것은?',
 choices:['성인 12~20회/분 · 아동 15~30회/분 · 유아 25~50회/분','성인 25~50회/분 · 아동 12~20회/분 · 유아 15~30회/분','성인 15~30회/분 · 아동 25~50회/분 · 유아 12~20회/분','모든 연령 12~20회/분으로 동일하다'],a:0,
 choiceExplanations:['정답. 교재 표의 연령별 정상 호흡수 범위다.','성인과 유아 범위를 뒤바꾼 오답이다.','세 연령군 범위를 모두 잘못 연결했다.','연령에 따라 정상 호흡수 범위가 다르다.']
},
{
 id:'119-verems2-dyspnea-position-01',grade:'B',subject:'ems',scopeId:'E10',conceptId:'E10-C03',
 difficulty:'mid',type:'처치원칙형',source:'2026 소방전술3(구급) 194~196쪽',
 q:'의식이 있고 스스로 호흡하는 호흡곤란 환자의 자세에 대한 원칙으로 가장 적절한 것은?',
 choices:['일반적으로 환자가 가장 편하게 호흡할 수 있는 자세를 유지하도록 돕는다','모든 환자를 강제로 완전한 바로누운 자세로 고정한다','호흡노력과 관계없이 엎드린 자세만 허용한다','자세는 호흡상태와 무관하므로 평가하지 않는다'],a:0,
 choiceExplanations:['정답. 의식이 있는 호흡곤란 환자는 대체로 스스로 가장 편하게 호흡할 수 있는 자세를 유지하도록 돕는다.','강제적인 단일 자세는 호흡곤란을 악화시킬 수 있다.','모든 환자에게 엎드린 자세를 일률적으로 적용하지 않는다.','자세와 호흡노력은 호흡평가와 처치에 영향을 줄 수 있다.']
},
{
 id:'119-verems2-arrest-response-01',grade:'B',subject:'ems',scopeId:'E11',conceptId:'E11-C03',
 difficulty:'mid',type:'순서형',source:'2026 소방전술3(구급) 205~206쪽',
 q:'무의식·무호흡·무맥박으로 심장마비가 의심되는 환자에서 다음 연결로 가장 적절한 것은?',
 choices:['지체 없이 기본소생술과 제세동 체계로 연결한다','정상호흡이 돌아올 때까지 아무 처치 없이 기다린다','병력문진을 모두 끝낸 뒤 가슴압박을 시작한다','환자를 걷게 하면서 증상 변화를 관찰한다'],a:0,
 choiceExplanations:['정답. 심정지 인식 뒤에는 지체 없이 기본소생술과 제세동 체계로 연결해야 한다.','심정지에서는 즉각적인 소생술이 필요하다.','완전한 병력수집 때문에 소생술을 지연해서는 안 된다.','심정지 의심 환자를 걷게 하는 것은 적절하지 않다.']
},
{
 id:'119-verems2-aed-pad-01',grade:'B',subject:'ems',scopeId:'E11',conceptId:'E11-C06',
 difficulty:'mid',type:'장비위치형',source:'2026 소방전술3(구급) 210~215쪽',
 q:'성인 AED 패드의 일반적인 부착 위치로 가장 적절한 것은?',
 choices:['오른쪽 쇄골 아래 상흉부와 왼쪽 유두 바깥쪽 측흉부','양쪽 손바닥 위','복부 중앙과 이마','양쪽 무릎 위'],a:0,
 choiceExplanations:['정답. 교재는 일반적인 전외측 패드 위치로 오른쪽 상흉부와 왼쪽 측흉부를 제시한다.','손바닥은 AED 패드의 일반적 부착 위치가 아니다.','복부와 이마에 부착하는 방식이 아니다.','무릎은 제세동 전류를 심장에 전달하기 위한 위치가 아니다.']
},
{
 id:'119-verems2-abd-assess-01',grade:'B',subject:'ems',scopeId:'E12',conceptId:'E12-C03',
 difficulty:'high',type:'환자평가형',source:'2026 소방전술3(구급) 216~222쪽',
 q:'급성 복통 환자의 병원 전 평가 원칙으로 가장 적절한 것은?',
 choices:['ABC와 쇼크 징후를 먼저 보고 OPQRST·SAMPLE로 병력을 수집하며 통증 부위를 불필요하게 반복 압박하지 않는다','통증 위치와 양상만 확인한 뒤 활력징후·쇼크 평가는 생략하고 현장에서 원인질환을 확정한다','병력수집은 최소화하고 복부 전 영역을 처음부터 깊고 강하게 반복 촉진해 반응을 비교한다','ABC보다 최근 음식섭취와 배변여부를 먼저 확인한 뒤 전신상태 평가는 이송 후로 미룬다'],a:0,
 choiceExplanations:['정답. 급성복통은 생명위협과 쇼크를 우선 평가하고 구조화된 병력수집과 부드러운 신체평가를 시행한다.','통증 위치 하나만으로 원인을 확정할 수 없다.','강한 반복 촉진은 통증과 손상을 악화시킬 수 있다.','ABC와 전신상태 평가가 우선이다.']
},
{
 id:'119-verems2-external-bleed-01',grade:'B',subject:'ems',scopeId:'E13',conceptId:'E13-C03',
 difficulty:'mid',type:'상황판단형',source:'2026 소방전술3(구급) 228쪽',
 q:'상처에서 선홍색 혈액이 심박동에 맞춰 뿜어져 나오고 있다. 가장 가능성이 높은 출혈 형태는?',
 choices:['동맥 출혈','정맥 출혈만','모세혈관 출혈만','출혈이 아닌 정상 소견'],a:0,
 choiceExplanations:['정답. 동맥 출혈은 산소가 풍부한 선홍색 혈액이 맥박에 맞춰 분출될 수 있다.','정맥 출혈의 대표 양상과 다르다.','모세혈관 출혈은 일반적으로 이런 박동성 분출 양상과 다르다.','명백한 출혈 소견으로 정상 상태가 아니다.']
},
{
 id:'119-verems2-shock-compensated-01',grade:'B',subject:'ems',scopeId:'E13',conceptId:'E13-C05',
 difficulty:'high',type:'보상기판단형',source:'2026 소방전술3(구급) 234~239쪽',
 q:'출혈 후 혈압은 아직 정상 범위지만 빈맥, 빠른 호흡, 창백하고 차고 축축한 피부가 나타난 환자에 대한 판단으로 옳은 것은?',
 choices:['보상기 쇼크 가능성을 고려해 출혈조절·체온보존·신속이송과 반복평가를 한다','혈압이 정상이므로 쇼크를 완전히 배제한다','피부와 의식상태는 쇼크 평가와 무관하다','쇼크는 심장질환이 있을 때만 발생한다'],a:0,
 choiceExplanations:['정답. 초기 쇼크에서는 보상기전 때문에 혈압이 유지될 수 있어 다른 관류저하 징후를 함께 본다.','정상 혈압만으로 초기 쇼크를 배제할 수 없다.','피부·의식·맥박·호흡은 관류평가에 중요하다.','출혈과 체액손실도 저혈량 쇼크를 일으킨다.']
},
{
 id:'119-verems2-burn-parkland-01',grade:'B',subject:'ems',scopeId:'E14',conceptId:'E14-C03',
 difficulty:'high',type:'계산원리형',source:'2026 소방전술3(구급) 261쪽',
 q:'교재의 Parkland 24시간 수액량 계산식으로 옳은 것은?',
 choices:['4mL × 체중(kg) × 2·3도 화상 체표면적(%)','체중(kg) + 화상면적(%)','0.25mL × 체중만','4mL × 화상면적만'],a:0,
 choiceExplanations:['정답. 교재는 24시간 총 수액량을 4mL×체중×2·3도 화상면적으로 제시한다.','Parkland 공식의 곱셈 구조와 다르다.','병원 전 초기 수액량의 다른 실용적 계산과 혼동한 것이다.','체중 요소가 빠져 있다.']
},
{
 id:'119-verems2-poison-history-01',grade:'B',subject:'ems',scopeId:'E18',conceptId:'E18-C01',
 difficulty:'mid',type:'중독평가형',source:'2026 소방전술3(구급) 315~319쪽',
 q:'중독 환자 평가에서 확인할 정보의 조합으로 가장 적절한 것은?',
 choices:['노출물질·시간·양·노출기간·이미 시행한 처치·환자 체중','평소 식사메뉴와 수면시간만','체중 없이 물질 이름 하나만','노출경로와 시간을 모두 생략한다'],a:0,
 choiceExplanations:['정답. 중독평가에서는 물질, 시간, 양, 노출기간, 시행처치, 체중 등 구체적인 노출정보를 확인한다.','평소 식사·수면 정보만으로 노출량과 독성위험을 판단할 수 없다.','용량과 환자 체중 등 추가 정보가 중요하다.','노출경로와 시점은 중독평가의 중요한 정보다.']
},
{
 id:'119-verems2-fbao-mild-01',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C05',
 difficulty:'mid',type:'기도이물형',source:'2026 소방전술3(구급) 417~423쪽',
 q:'기도 이물폐쇄가 의심되지만 환자가 의식이 있고 힘 있게 기침하며 환기도 양호하다. 가장 적절한 초기 대응은?',
 choices:['자발적인 기침을 계속하도록 관찰·격려하고 악화 여부를 재평가한다','힘 있는 기침이 있어도 즉시 강한 폐쇄해소 처치를 반복한다','물을 마시게 해 이물을 밀어낸다','환기를 평가하지 않고 바로 눕힌다'],a:0,
 choiceExplanations:['정답. 경미한 기도폐쇄에서는 힘 있는 자발기침이 가능하므로 기침을 유지시키며 상태변화를 관찰한다.','효과적인 기침이 있는 경미 폐쇄에서 무조건 강한 처치를 시작하지 않는다.','물을 마시게 하는 것은 흡인 위험을 만들 수 있다.','환기와 의식상태를 계속 평가해야 한다.']
}
];

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>norm(q.q)));
for(const q of Q){
 if(ids.has(q.id))throw Error('VERIFIED_EMS_BATCH2_DUP_ID '+q.id);
 if(texts.has(norm(q.q)))throw Error('VERIFIED_EMS_BATCH2_DUP_TEXT '+q.id+' :: '+q.q);
 q.ex=q.choiceExplanations[q.a];q.examStyle=true;q.questionClass='exam-style';q.pageVerified=true;q.reviewStatus='source-reviewed';q.pastExamClaim=false;
 if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices.map(norm)).size!==4)throw Error('VERIFIED_EMS_BATCH2_CHOICES '+q.id);
 if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4||q.choiceExplanations.some(x=>String(x).trim().length<8))throw Error('VERIFIED_EMS_BATCH2_EXPLANATIONS '+q.id);
 if(!/\d+(?:\s*[~\-–]\s*\d+)?\s*쪽/.test(q.source))throw Error('VERIFIED_EMS_BATCH2_PAGE '+q.id);
 V.questions.push(q);ids.add(q.id);texts.add(norm(q.q));
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.VerifiedEMSBatch2119={version:'119-verified-ems-batch2-v1',planned:Q.length,added:Q.length,ids:Q.map(q=>q.id),grade:'B',pageVerified:true,pastExamClaim:false};
})();