import fs from 'node:fs';
import vm from 'node:vm';

function ok(cond,msg){if(!cond)throw new Error(msg);console.log('PASS',msg)}
globalThis.window={AITUTOR_V9:{}};
for(const file of ['curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','master-syllabus-119.js','content-packs.js','questions.js','verified-expansion.js','verified-completion.js','verified-final.js','questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-ems-restored-verified-119.js','questions-hazmat-depth-119.js','questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-facilities-depth-119.js','questions-restored-fire-verified-119.js','question-difficulty.js','question-quality-119.js','content-contract-119.js','depth-enrichment.js','depth-enrichment-2.js','content-rich-2026.js','fire-depth-119.js','fire-visuals-119.js','governance-depth-119.js','governance-visuals-119.js','investigation-depth-119.js','investigation-visuals-119.js','facilities-depth-119.js','facilities-visuals-119.js','hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js','suppression-depth-119.js','suppression-visuals-119.js','ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','questions-calculation-119.js','questions-law-119.js','questions-special-combustible-119.js','question-bank-119.js','textbook-grounded-119.js','visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js']){
  const code=fs.readFileSync(new URL(`./${file}`,import.meta.url),'utf8');
  vm.runInThisContext(code,{filename:file});
}
const V=window.AITUTOR_V9;
ok(V.curriculum.totalConcepts===176,'176 current curriculum nodes load successfully');
ok(V.MasterSyllabus119?.groups?.fire?.length===6&&V.MasterSyllabus119?.groups?.ems?.length===10,'119 master syllabus groups fire/EMS into exam-oriented parts');
ok(typeof V.ContentContract119?.audit==='function','119 fail-closed content completion contract is loaded');
ok(typeof V.QuestionQuality119?.isExamStyle==='function','119 exam-style question quality gate is loaded');
const questionAudit=V.QuestionQuality119.audit();
ok(questionAudit.examStyle>0,'exam-style question bank is non-empty');
ok(questionAudit.duplicateTexts.length===0,'exam-style question text duplicates = 0');
ok((V.questions||[]).filter(V.QuestionQuality119.isExamStyle).every(q=>q.choiceExplanations?.length===4),'every exam-style question explains all four options');
ok((V.questions||[]).filter(V.QuestionQuality119.isExamStyle).every(q=>q.difficulty&&q.type&&q.source),'every exam-style question has difficulty, type and source');
const reviewed119=(V.questions||[]).filter(q=>/^119-/.test(q.id||'')&&!q.generatedPractice);
const generated119=(V.questions||[]).filter(q=>q.generatedPractice===true);
ok(reviewed119.length>=29,'119 manually-authored/reviewed exam-question bank remains intact');
ok(reviewed119.every(V.QuestionQuality119.isExamStyle),'every manually-authored 119 question passes the full exam-style quality contract');
ok(V.QuestionFactory119?.generated===generated119.length&&generated119.length>0,'grounded factory reports exactly the generated practice questions it added');
ok(generated119.every(q=>q.grade==='P'&&q.generatedBy==='119-grounded-question-factory-v1'&&V.QuestionQuality119.isExamStyle(q)),'factory questions stay P-grade practice and pass the exam-style contract');
ok(V.CalculationQuestions119?.added===13,'calculation practice bank adds thirteen source-backed questions');
const calculationPractice=(V.questions||[]).filter(q=>/^119-calc-/.test(q.id||''));
ok(calculationPractice.length===13&&calculationPractice.every(q=>q.grade==='P'&&q.type==='계산형'&&V.QuestionQuality119.isExamStyle(q)),'all calculation questions remain practice-only and pass the exam-style quality gate');
ok(calculationPractice.every(q=>!/기출|실제 출제|과거시험/.test(String(q.q||''))),'calculation practice makes no unsupported past-exam claim');
ok(V.LawQuestions119?.added===6,'six current-law practice questions are loaded');
const lawPractice=(V.questions||[]).filter(q=>/^119-law-/.test(q.id||''));
ok(lawPractice.length===6&&lawPractice.every(q=>q.grade==='P'&&V.QuestionQuality119.isExamStyle(q)),'current-law questions stay practice-only and pass the exam-style gate');
ok(lawPractice.every(q=>!/기출|실제 출제|과거시험/.test(String(q.q||''))),'current-law practice makes no unsupported past-exam claim');
ok(V.SpecialCombustibleQuestions119?.added===6,'six current-law special-combustible practice questions are loaded');
const specialCombustiblePractice=(V.questions||[]).filter(q=>/^119-specialcomb-/.test(q.id||''));
ok(specialCombustiblePractice.length===6&&specialCombustiblePractice.every(q=>q.grade==='P'&&V.QuestionQuality119.isExamStyle(q)),'special-combustible questions stay practice-only and pass the exam-style gate');
ok(generated119.every(q=>!/(다음 심화 설명을 가장 정확히|교재형 상세 설명|30초 핵심 설명|학습노드)/.test(String(q.q||''))),'generated practice stems use concise exam language without internal/meta wording');

const questionContractRows=V.curriculum.concepts.map(c=>{const qs=V.QuestionQuality119.forConcept(c.id),d={low:0,mid:0,high:0};for(const q of qs)d[q.difficulty]=(d[q.difficulty]||0)+1;return{id:c.id,n:qs.length,...d}});
ok(questionContractRows.every(x=>x.n>=6&&x.low>=1&&x.mid>=2&&x.high>=1),'all 176 concepts satisfy >=6 exam-style questions with low>=1 mid>=2 high>=1');
ok(V.QuestionQuality119.audit().duplicateTexts.length===0,'post-factory exam-style question text duplicates = 0');
ok(new Set(V.curriculum.concepts.map(x=>x.id)).size===176,'unique concept ids');
ok(V.curriculum.concepts.every(x=>x.sourceRanges.length>0),'all concepts have official source ranges');
ok(V.curriculum.fire.length===7,'seven complete fire scopes');
ok(V.curriculum.ems.length===24,'twenty-four EMS scopes');
ok(V.questions.every(q=>q.choices.length===4),'all questions have four choices');
ok(V.questions.every(q=>new Set(q.choices).size===4),'no duplicate choices inside a question');
ok(new Set(V.questions.map(q=>q.id)).size===V.questions.length,'unique question ids');
ok(V.questions.every(q=>Number.isInteger(q.a)&&q.a>=0&&q.a<4),'single valid answer index');
ok(V.questions.every(q=>!/(기출|실제 출제|과거시험)/.test(String(q.q||''))),'no generated question is mislabeled as past exam');
const contentAudit=V.ContentContract119.audit();
ok(contentAudit.total===176&&contentAudit.complete===176&&contentAudit.incomplete===0,'current 176-node curriculum contract is internally complete');
ok(Object.keys(contentAudit.blockers||{}).length===0,'119 content contract has no remaining blockers');
ok(!contentAudit.blockers.questionsEnough&&!contentAudit.blockers.difficultyLow&&!contentAudit.blockers.difficultyMid&&!contentAudit.blockers.difficultyHigh&&!contentAudit.blockers.choiceExplanations,'question-count, difficulty-mix and option-explanation blockers are closed without weakening the contract');
ok(V.TextbookGrounded119?.targetChars===900&&V.curriculum.concepts.every(x=>V.contentPacks.authored[x.id]?.textbookGrounded119===true),'grounded textbook layer closes whatever depth/section/trap/memory shortfalls remain after source-backed enrichment');
ok(!contentAudit.blockers.textbookDepth&&!contentAudit.blockers.structuredSections&&!contentAudit.blockers.examTraps&&!contentAudit.blockers.memoryPoints&&!contentAudit.blockers.comparison,'textbook depth, structure, traps, memory and required comparisons are closed');
ok(V.VisualCompletion119?.targets?.length===27,'visual completion tracks the audited 27 remaining visual concepts');
ok(V.VisualCompletion119.targets.every(id=>{
  const p=V.contentPacks.authored[id];
  return (p?.visuals||[]).length>0&&(p.visuals||[]).some(v=>!!V.Visual119.render(v));
}),'all 27 required visual concepts render at least one real Visual119 diagram');
ok(!contentAudit.blockers.visual,'visual blocker remains closed');
ok(V.CalculationContract119?.requiredIds?.length===9&&V.CalculationContract119.requiredIds.includes('F03-C03')&&V.CalculationContract119.requiredIds.includes('E14-C03'),'calculation contract tracks hazardous-material, combustion-air and Parkland source-applicable concepts');
ok(V.CalculationContract119.requiredIds.every(id=>(V.contentPacks.authored[id]?.calculations||[]).length>0),'all source-applicable calculation concepts expose a real calculation contract');
ok(V.CalculationContract119.falsePositiveRemoved.every(id=>V.ContentContract119.evaluateConcept(id).needsCalc===false),'former keyword-only calculation false positives are no longer required');
ok(!contentAudit.blockers.calculation,'calculation blocker is closed by source-applicable contracts, not keyword padding');
const fullCoverage=V.CoverageMap119?.audit?.();
ok(!!fullCoverage&&fullCoverage.total>70,'full exam Coverage Map is loaded as a separate truth layer');
ok(fullCoverage.missing>0&&fullCoverage.partial>0&&fullCoverage.implementationPercent<100,'full exam Coverage Map truthfully exposes remaining partial/missing areas');
ok(fullCoverage.rows.find(x=>x.id==='F-SCI-04')?.status==='partial'&&fullCoverage.rows.find(x=>x.id==='F-BLD-02')?.status==='missing','fire-science enrichment is partial while building-fire gaps remain explicit');
ok(fullCoverage.rows.find(x=>x.id==='E-ECG-01')?.status==='partial'&&fullCoverage.rows.find(x=>x.id==='E-MCI-01')?.status==='partial','ECG and mass-casualty topics remain explicitly partial after source-backed VF/VT and START enrichment');
ok(fullCoverage.calcMissing.includes('E-CALC-01')&&!fullCoverage.calcMissing.includes('E-BURN-02'),'oxygen-cylinder calculation remains open while Parkland is source-backed and closed');

ok(contentAudit.complete===176&&contentAudit.incomplete===0&&contentAudit.averageScore===100,'current 176-node content contract reaches 176/176 without claiming full exam coverage');
const mock=V.examReadiness();
const restoredVerifiedIds=['119-ver-f05-c04-a','119-ver-f05-c05-a','119-ver-f06-c01-a','119-ver-f06-c03-a','119-ver-f07-c05-a','119-ver-f07-c11-a'];
const restoredVerified=restoredVerifiedIds.map(id=>V.questionById[id]);
ok(restoredVerified.every(q=>q&&q.grade==='B'&&q.pageVerified===true&&q.reviewStatus==='manual-reviewed'&&V.QuestionQuality119.isExamStyle(q)),'six restored-scope questions are manually reviewed B-grade page-verified exam-style questions');
ok(restoredVerified.every(q=>/PDF\s+[0-9]+(?:[·~][0-9]+)?쪽/.test(q.source)&&!/기출|실제 출제|과거시험/.test(q.q)),'restored-scope B questions cite exact PDF pages without past-exam claims');
ok(new Set(restoredVerified.map(q=>q.scopeId)).size===3&&['F05','F06','F07'].every(s=>restoredVerified.some(q=>q.scopeId===s)),'page-verified B questions cover F05 F06 F07');
ok(mock.ready===(mock.fire>=25&&mock.ems>=40&&mock.scopeComplete),'real mock gate remains count + all-subject scope fail-closed contract');
ok(Array.isArray(mock.missingFireScopes)&&Array.isArray(mock.missingEmsScopes),'real mock readiness exposes both fire and EMS uncovered verified scopes');
ok(mock.scopeComplete===(mock.missingFireScopes.length===0&&mock.missingEmsScopes.length===0),'real mock scopeComplete requires both fire and EMS coverage');
ok(mock.ready||mock.missingFireScopes.length>0||mock.missingEmsScopes.length>0||mock.fireNeed>0||mock.emsNeed>0,'real mock never reports false readiness when verified evidence is incomplete');
ok(mock.ready===true&&mock.missingFireScopes.length===0&&mock.missingEmsScopes.length===0,'page-verified EMS gap repair closes all verified-scope blockers for the 65-question real mock');
ok(V.scopePractice2026?.questions===27&&V.questions.filter(q=>q.grade==='P').length>=27,'27 practice-only restored-scope questions remain P-grade and separate from real-exam credit');
ok(V.QuestionDifficulty?.levels?.high&&V.QuestionDifficulty?.profiles?.hard,'question difficulty is independent from evidence grade');
ok(V.Hazmat2026?.grade2?.items?.length===7,'official grade-2 hazardous-material item table is loaded');
ok(V.Hazmat2026?.multiple([{quantity:100,designated:100},{quantity:250,designated:500}])===1.5,'hazardous-material designated-quantity multiple calculator works');
const coverage=V.contentPacks.coverage();
const missing=V.curriculum.concepts.filter(c=>V.contentPacks.authored[c.id]?.status!=='verified').map(c=>c.id);
const scopeVerified=V.curriculum.concepts.filter(c=>V.contentPacks.authored[c.id]?.status==='scope-verified').map(c=>c.id);
const extra=Object.keys(V.contentPacks.authored).filter(id=>!V.curriculum.byId[id]);
console.log('VERIFIED_COVERAGE',coverage);
console.log('MISSING_VERIFIED_CONCEPTS',missing);
console.log('EXTRA_AUTHORED_CONCEPTS',extra);
ok(coverage.total===176,'content coverage denominator is 176');
const exactAnchorBatch={'F07-C05':284,'F07-C16':288,'F07-C17':288,'F07-C18':284,'F07-C19':284,'F07-C20':302,'F07-C21':287};
ok(Object.entries(exactAnchorBatch).every(([id,page])=>{
  const r=V.curriculum.byId[id]?.sourceRanges?.[0],p=V.contentPacks.authored[id];
  return Number(r?.from)===page&&Number(r?.to)===page&&p?.status==='verified'&&p?.sourcePrecision==='exact-pdf-page-anchor';
}),'seven sprinkler concepts are exact-page verified from 2026 prevention1 PDF');
const exactFirePhenomenaBatch={'F03-C09':37,'F03-C10':40,'F03-C11':453,'F03-C12':319,'F03-C13':320,'F03-C14':319,'F03-C15':326,'F03-C16':453};
ok(Object.entries(exactFirePhenomenaBatch).every(([id,page])=>{
  const r=V.curriculum.byId[id]?.sourceRanges?.[0],p=V.contentPacks.authored[id];
  return Number(r?.from)===page&&Number(r?.to)===page&&p?.status==='verified'&&p?.sourcePrecision==='exact-pdf-page-anchor';
}),'eight fire-phenomena concepts are exact-page verified from 2026 fire1 PDF');
const exactHazmatBatch={'F05-C02':385,'F05-C03':407,'F05-C04':428,'F05-C05':449,'F05-C06':496,'F05-C07':523};
ok(Object.entries(exactHazmatBatch).every(([id,page])=>{
  const r=V.curriculum.byId[id]?.sourceRanges?.[0],p=V.contentPacks.authored[id];
  return r?.doc==='prevention2'&&Number(r?.from)===page&&Number(r?.to)===page&&p?.status==='verified'&&p?.sourcePrecision==='exact-pdf-page-anchor';
}),'hazardous-material classes 1-6 are exact-page verified from 2026 prevention2 PDF');
const haz01=V.curriculum.byId['F05-C01']?.sourceRanges||[],haz08=V.curriculum.byId['F05-C08']?.sourceRanges||[];
ok(haz01.length===2&&haz01[0]?.doc==='prevention2'&&Number(haz01[0]?.from)===345&&Number(haz01[1]?.from)===385&&V.contentPacks.authored['F05-C01']?.status==='verified','hazardous-material definition/classification keeps both exact official pages');
ok(haz08.length===2&&haz08[0]?.doc==='fire1'&&Number(haz08[0]?.from)===319&&haz08[1]?.doc==='prevention2'&&Number(haz08[1]?.from)===536&&V.contentPacks.authored['F05-C08']?.status==='verified','hazardous-material fire principles keep exact special-phenomenon and response pages');
const inv=Object.fromEntries(['F06-C01','F06-C02','F06-C03','F06-C04'].map(id=>[id,V.curriculum.byId[id]?.sourceRanges||[]]));
ok(inv['F06-C01']?.length===2&&inv['F06-C01'].every(r=>r.doc==='fire2')&&Number(inv['F06-C01'][0].from)===269&&Number(inv['F06-C01'][1].from)===270&&V.contentPacks.authored['F06-C01']?.status==='verified','fire-investigation purpose keeps exact fire2 pages 269 and 270');
ok(inv['F06-C02']?.length===2&&inv['F06-C02'].every(r=>r.doc==='fire2')&&Number(inv['F06-C02'][0].from)===276&&Number(inv['F06-C02'][1].from)===282&&V.contentPacks.authored['F06-C02']?.status==='verified','fire-investigation preservation/procedure keeps exact fire2 pages 276 and 282');
ok(inv['F06-C03']?.length===2&&inv['F06-C03'].every(r=>r.doc==='fire2')&&Number(inv['F06-C03'][0].from)===282&&Number(inv['F06-C03'][1].from)===297&&V.contentPacks.authored['F06-C03']?.status==='verified','fire-investigation origin/cause keeps exact fire2 pages 282 and 297');
ok(inv['F06-C04']?.length===2&&inv['F06-C04'].every(r=>r.doc==='fire2')&&Number(inv['F06-C04'][0].from)===287&&Number(inv['F06-C04'][1].from)===294&&V.contentPacks.authored['F06-C04']?.status==='verified','fire-damage investigation/records keep exact fire2 pages 287 and 294');
const facilitySingles={'F07-C01':17,'F07-C02':207,'F07-C03':247,'F07-C04':273,'F07-C07':328,'F07-C08':347,'F07-C09':432,'F07-C10':415,'F07-C11':23,'F07-C12':18,'F07-C13':465,'F07-C14':201};
ok(Object.entries(facilitySingles).every(([id,page])=>{
  const rows=V.curriculum.byId[id]?.sourceRanges||[],p=V.contentPacks.authored[id];
  return rows.length===1&&rows[0].doc==='prevention1'&&Number(rows[0].from)===page&&Number(rows[0].to)===page&&p?.status==='verified'&&p?.sourcePrecision==='exact-pdf-page-anchor';
}),'twelve single-page non-sprinkler facility concepts keep exact Prevention1 evidence');
const f06=V.curriculum.byId['F07-C06']?.sourceRanges||[];
ok(f06.length===2&&f06.every(r=>r.doc==='prevention1')&&Number(f06[0].from)===321&&Number(f06[1].from)===333&&V.contentPacks.authored['F07-C06']?.status==='verified'&&V.contentPacks.authored['F07-C06']?.sourcePrecision==='exact-pdf-page-anchor','simple + ESFR sprinkler concept keeps exact Prevention1 pages 321 and 333');
const f15=V.curriculum.byId['F07-C15']?.sourceRanges||[];
ok(f15.length===4&&f15.every(r=>r.doc==='prevention1')&&[167,174,433,482].every((p,i)=>Number(f15[i]?.from)===p)&&V.contentPacks.authored['F07-C15']?.status==='verified'&&V.contentPacks.authored['F07-C15']?.sourcePrecision==='exact-pdf-page-anchor','firefighter-support concept keeps exact Prevention1 pages 167,174,433,482');
ok(scopeVerified.length===0,'all 176 concepts now have exact official page evidence; page-anchor pending = 0');
ok(missing.length===0,'no curriculum concept remains in scope-verified/page-anchor-pending state');
ok(Object.keys(V.contentPacks.authored).filter(id=>V.curriculum.byId[id]).length===176,'exactly 176 valid authored concept packs');
ok(coverage.verified===176&&coverage.pending===0,'page-evidence truth reaches 176 page-verified + 0 page-anchor-pending');
ok(extra.length===0,`no authored concept IDs outside curriculum; extra=${extra.join(',')||'none'}`);
ok(Object.values(V.contentPacks.authored).every(p=>p.status==='verified'||p.status==='scope-verified'),'every authored content pack has an explicit verified/scope-verified truth state');
ok(V.curriculum.concepts.every(c=>V.contentPacks.authored[c.id]),'every curriculum concept has an authored study pack');
ok(V.curriculum.byId['F05-C05']&&V.curriculum.byId['F07-C05'],'hazardous materials and sprinkler scopes exist');
ok(V.contentPacks.authored['F05-C05']?.deepSections?.length>0&&V.contentPacks.authored['F07-C05']?.deepSections?.length>0,'new fire scopes have rich detail sections');
ok(V.curriculumExpansion2026?.addedConcepts===27,'official missing fire scope expansion adds 27 concepts');
ok(V.curriculumDepth119?.addedConcepts===14,'119 depth syllabus adds 14 granular fire/sprinkler concepts');
ok(V.FireDepth119?.concepts?.length===14,'14 new deep fire concepts have textbook packs');
ok(V.curriculum.byId['F03-C10']?.title==='플레임오버','flameover is a separate curriculum concept instead of being conflated with rollover');
ok((V.contentPacks.authored['F03-C06']?.compare||[]).map(x=>x?.[0]).join('|').includes('플레임오버')&&(V.contentPacks.authored['F03-C06']?.compare||[]).map(x=>x?.[0]).join('|').includes('롤오버'),'fire-phenomena comparison distinguishes flameover and rollover');
ok((V.contentPacks.authored['F03-C10']?.visuals||[]).includes('flameover-flow')&&!!V.Visual119.render('flameover-flow'),'flameover has its own learning flow diagram');
ok(V.FireQuestions119?.added===13,'deep fire batch adds 13 sourced practice questions with option explanations');
ok(V.GovernanceDepth119?.concepts?.length===12,'all fire-organization and disaster-management concepts receive textbook-depth enrichment');
ok(V.GovernanceQuestions119?.added===24,'governance batch adds twenty-four exam-style questions');
ok(V.GovernanceDepth119.concepts.every(id=>V.contentPacks.authored[id]?.visuals?.length>0),'governance concepts have learning diagrams');
ok(V.InvestigationDepth119?.concepts?.length===4,'all fire-investigation concepts receive textbook-depth enrichment');
ok(V.InvestigationQuestions119?.added===8,'fire-investigation batch adds eight exam-style questions');
ok(V.InvestigationDepth119.concepts.every(id=>V.contentPacks.authored[id]?.visuals?.length>0),'fire-investigation concepts have learning diagrams');
ok(V.SuppressionDepth119?.concepts?.length===8,'all eight suppression theory concepts receive textbook-depth enrichment');
ok(V.SuppressionQuestions119?.added===16,'suppression batch adds sixteen exam-style questions with option explanations');
ok(V.SuppressionDepth119.concepts.every(id=>V.contentPacks.authored[id]?.visuals?.length>0),'all suppression concepts have learning diagrams');
ok(V.FacilitiesDepth119?.concepts?.length===14,'fourteen non-sprinkler fire-protection concepts receive textbook-depth enrichment');
ok(V.FacilitiesQuestions119?.added>=17,'fire-protection depth batch adds exam-style questions with option explanations');
ok(V.FacilitiesDepth119.concepts.every(id=>V.contentPacks.authored[id]?.visuals?.length>0),'fire-protection depth concepts have learning diagrams');
ok(V.HazmatDepth119?.concepts?.length===6,'all six hazardous-material classes receive official common-rule depth');
ok(V.HazmatQuestions119?.added===7,'hazardous-material depth batch adds seven sourced questions');
ok(V.HazmatDepth119.concepts.every(id=>V.contentPacks.authored[id]?.calculations?.length>0),'all hazardous-material class lessons expose designated-quantity calculation contract');
ok(V.EMSDepth119?.concepts?.length===9,'nine high-yield EMS concepts receive textbook-depth enrichment');
const examGapIds=V.ExamGapEnrichment119?.conceptIds||[];
ok(['F05-C01','F07-C01','E01-C03','E05-C04','E20-C03','E14-C02','E14-C03','F03-C03','F04-C06','F03-C07','F03-C08','E09-C07','E11-C03','E11-C04','E11-C05'].every(id=>examGapIds.includes(id))&&new Set(examGapIds).size===examGapIds.length,'source-backed high-yield exam gap enrichment is loaded');
ok(V.curriculum.byId['E05-C04']?.title==='기록지·중증도 분류','E05-C04 student title includes START triage instead of hiding it under records only');
ok((V.contentPacks.authored['E14-C03']?.calculations||[]).some(x=>/4 mL/.test(x.formula||'')),'burn lesson exposes the source-backed Parkland calculation');
ok((V.contentPacks.authored['E14-C02']?.detail||[]).some(x=>/긴장성 기흉/.test(x)),'soft-tissue/chest lesson includes source-backed tension-pneumothorax deterioration and dressing response');
ok(V.curriculum.byId['E01-C03']?.title==='응급구조사 법적책임·119구급대 법령','119-law content is visible in the EMS curriculum');
ok((V.contentPacks.authored['E01-C03']?.officialLinks||[]).length>=4,'119-law lesson exposes current official law source links');
ok(fullCoverage.rows.find(x=>x.id==='E-LAW-01')?.status==='partial'&&fullCoverage.rows.find(x=>x.id==='E-TRN-02')?.status==='partial','119-law and air/international EMS gaps are truthfully partial after source-backed enrichment');
ok(fullCoverage.rows.find(x=>x.id==='F-HAZ-04')?.status==='covered','special-combustible gap is closed by current-law definition, quantity table and storage rules');
ok(fullCoverage.rows.find(x=>x.id==='F-BLD-02')?.status==='partial'&&fullCoverage.rows.find(x=>x.id==='F-BLD-03')?.status==='partial','building compartment and fire-material topics remain honestly partial after current-law enrichment');
ok(V.curriculum.byId['F07-C01']?.title==='소방시설 5분류·건축방재','building-fire fundamentals are visible in the facilities curriculum title');
ok((V.contentPacks.authored['F07-C01']?.officialLinks||[]).length>=3,'building-fire lesson exposes official Building Act source links');
ok((V.contentPacks.authored['F05-C01']?.specialCombustibles||[]).length===11,'special-combustible lesson exposes the eleven current law quantity rows');
ok(V.curriculum.byId['E20-C03']?.title==='정상분만·신생아 초기처치','newborn initial care is visible in the obstetric curriculum title');
ok((V.contentPacks.authored['E20-C03']?.detail||[]).some(x=>/아프가\(Apgar\).*1분.*5분/.test(x)),'newborn lesson includes exact-source Apgar 1- and 5-minute assessment');
ok((V.contentPacks.authored['E20-C03']?.must||[]).some(x=>/입 먼저.*코 다음/.test(x)),'newborn lesson preserves textbook mouth-before-nose suction order');
ok((V.contentPacks.authored['E20-C03']?.visuals||[]).includes('ems-newborn-initial')&&!!V.Visual119.render('ems-newborn-initial'),'newborn initial-care flow renders as a real study visual');
ok(fullCoverage.rows.find(x=>x.id==='E-NRP-01')?.status==='partial','NRP remains honestly partial until ventilation/compression algorithm evidence is completed');
ok((V.contentPacks.authored['F03-C07']?.compare||[]).some(x=>/굴뚝|연돌/.test(String(x?.[0]))),'smoke/Flow Path lesson compares stack-effect smoke movement');
ok((V.contentPacks.authored['F03-C08']?.compare||[]).some(x=>/UVCE/.test(String(x?.[0]))),'explosion lesson compares UVCE with other explosion mechanisms');
ok(V.EMSQuestions119?.added===9,'nine page-grounded EMS exam-style questions are loaded');
ok(V.EMSRestoredVerified119?.added===5&&V.EMSRestoredVerified119.scopes.join(',')==='E02,E03,E04,E05,E07','five page-verified EMS scope-gap questions are loaded without past-exam claims');
ok(V.EMSRestoredVerified119?.questions.every(id=>V.questionById[id]?.grade==='B'&&V.questionById[id]?.restoredVerified===true&&V.questionById[id]?.pastExamClaim===false),'restored EMS gap questions remain manually reviewed B-grade evidence');
ok(V.EMSDepth119.concepts.every(id=>V.contentPacks.authored[id]?.visuals?.length>0),'high-yield EMS depth concepts have learning diagrams');
ok(V.emsRich2026?.scopes===24&&V.emsRich2026?.concepts===107,'all 24 EMS chapters / 107 concepts receive structured rich detail');
ok((V.depthEnrichment?.conceptIds||[]).length>=19,'source-depth enrichment batch 1 is loaded');
ok(!!V.depthEnrichment2,'source-depth enrichment batch 2 is loaded');

const brandFiles=[
  fs.readFileSync(new URL('./index.html',import.meta.url),'utf8'),
  fs.readFileSync(new URL('./preview.html',import.meta.url),'utf8'),
  fs.readFileSync(new URL('./app.js',import.meta.url),'utf8'),
  fs.readFileSync(new URL('./selftest.js',import.meta.url),'utf8')
].join('\n');
ok(!brandFiles.includes('AI과외'),'legacy AI과외 brand is absent from v9 runtime surfaces');
ok(brandFiles.includes('119'),'119 brand is present in v9 runtime surfaces');
const manifest=JSON.parse(fs.readFileSync(new URL('./manifest.webmanifest',import.meta.url),'utf8'));
ok(manifest.start_url==='./'&&manifest.scope==='./','v9 PWA manifest is subpath-scoped');
ok(manifest.name==='119'&&manifest.short_name==='119','PWA install name is unified as 119');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
ok(sw.includes("const PREFIX='ai-tutor-v9-'"),'v9 service worker uses a dedicated cache prefix');
ok(!sw.includes('ai-tutor-v8'),'v9 service worker never targets v8 cache names');
ok(sw.includes("'./sync-merge.js'")&&sw.includes("'./sync-ui.js'"),'v9 sync hardening files are offline-cached');
ok(sw.includes("'./depth-enrichment.js'")&&sw.includes("'./depth-enrichment-2.js'")&&sw.includes("'./content-rich-2026.js'")&&sw.includes("'./ems-rich-2026.js'"),'v9 depth enrichments are offline-cached');
ok(sw.includes("'./curriculum-complete-2026.js'"),'complete curriculum expansion is offline-cached');
ok(sw.includes("'./coverage-map-119.js'"),'full exam Coverage Map is offline-cached');
ok(sw.includes("'./questions-ems-restored-verified-119.js'"),'restored EMS verified questions are offline-cached');
ok(sw.includes("'./exam-gap-enrichment-119.js'"),'exam gap enrichment is offline-cached');
ok(sw.includes("'./questions-calculation-119.js'"),'calculation practice bank is offline-cached');
ok(sw.includes("'./questions-law-119.js'"),'current-law practice bank is offline-cached');
ok(sw.includes("'./questions-special-combustible-119.js'"),'special-combustible practice bank is offline-cached');

const v9index=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
ok(v9index.includes("register('./sw.js',{scope:'./'})"),'v9 service worker registers only at ./ scope');
ok(v9index.indexOf('./curriculum-complete-2026.js')>v9index.indexOf('./curriculum.js')&&v9index.indexOf('./curriculum-complete-2026.js')<v9index.indexOf('./content-packs.js'),'complete curriculum loads before content packs');
ok(v9index.indexOf('./depth-enrichment.js')>v9index.indexOf('./verified-final.js'),'depth enrichment loads after base verified packs');
ok(v9index.indexOf('./depth-enrichment-2.js')>v9index.indexOf('./depth-enrichment.js'),'depth enrichment batch 2 loads after batch 1');
ok(v9index.indexOf('./sync-merge.js')<v9index.indexOf('./auth.js'),'conflict-safe merge loads before member auth');
ok(v9index.indexOf('./pdf.js')<v9index.indexOf('./auth.js'),'private document sync API loads before member auth');
ok(v9index.indexOf('./source-catalog-119.js')>v9index.indexOf('./pdf.js')&&v9index.indexOf('./source-catalog-119.js')<v9index.indexOf('./source-pdf.js'),'official source catalog loads before PDF engine');
ok(v9index.indexOf('./source-pdf.js')>v9index.indexOf('./source-catalog-119.js')&&v9index.indexOf('./source-pdf.js')<v9index.indexOf('./app.js'),'official PDF highlight engine loads before app UI');
ok(v9index.indexOf('./coverage-map-119.js')>v9index.indexOf('./calculation-contract-119.js')&&v9index.indexOf('./coverage-map-119.js')<v9index.indexOf('./store.js'),'full exam Coverage Map loads after content/question contracts and before runtime state');


const sql=fs.readFileSync(new URL('../supabase/v9-schema.sql',import.meta.url),'utf8');
const studyTables=['study_profiles','study_user_progress','study_user_answers','study_wrong_answers','study_review_schedule','study_personal_notes','study_private_documents','study_document_chunks','study_sessions','study_exam_history','study_tutor_preferences'];
for(const table of studyTables){
  ok(sql.includes(`alter table public.${table} enable row level security;`),`${table} RLS enabled`);
}
ok(!/create table if not exists public\.profiles\s*\(/.test(sql),'shared backend never creates or repurposes investment public.profiles');
ok(sql.includes("values('study-private-v9','study-private-v9',false"),'Study private storage bucket is non-public');
ok(sql.includes("bucket_id='study-private-v9'"),'Storage policies are isolated to the Study bucket');
ok(sql.includes('to authenticated'),'Study policies explicitly target authenticated users');
ok(sql.includes('(select auth.uid())'),'Study owner checks use cached auth.uid() form');
ok(!sql.toLowerCase().includes('public = true'),'schema never enables public storage');
ok((sql.match(/deleted_at timestamptz/g)||[]).length>=2,'personal notes and private documents support deletion tombstones');
ok(!sql.includes('create trigger on_ai_tutor_user_created')&&!sql.includes('handle_new_ai_tutor_user'),'shared backend adds no project-wide auth.users bootstrap trigger');
ok(!/^\s*alter\s+default\s+privileges\b/im.test(sql),'shared schema does not execute project-wide default-privilege changes');

const hardening=fs.readFileSync(new URL('../supabase/v9-owner-hardening.sql',import.meta.url),'utf8');
ok(hardening.includes('study_private_documents_id_user_id_key'),'private document identity constraint is Study-namespaced');
ok(hardening.includes('foreign key (document_id, user_id)'),'document chunks use an owner-bound composite foreign key');
ok(hardening.includes('public.study_private_documents'),'document hardening never targets investment tables');
ok(hardening.includes('d.id = document_id and d.user_id = (select auth.uid())'),'document chunk RLS verifies parent ownership');

const liveHardening=fs.readFileSync(new URL('../supabase/v9-live-backend-hardening.sql',import.meta.url),'utf8');
ok(liveHardening.includes('revoke all privileges on table public.%I from anon'),'anonymous Data API access is explicitly revoked for Study tables');
ok(liveHardening.includes('grant select, insert, update, delete on table public.%I to authenticated'),'authenticated Data API grants are explicit');
ok(liveHardening.includes("'study_profiles'")&&liveHardening.includes("'study_tutor_preferences'"),'live hardening is bound to Study-prefixed tables');
ok(!/^\s*alter\s+default\s+privileges\b/im.test(liveHardening),'live hardening does not execute investment-app default-privilege changes');
ok(!/^\s*create\s+(?:or\s+replace\s+)?function\b/im.test(liveHardening)&&!/^\s*create\s+trigger\b/im.test(liveHardening),'live hardening adds no project-wide trigger/function');
ok(liveHardening.includes('c.relrowsecurity'),'live hardening aborts if any Study private table lacks RLS');

const syncMerge=fs.readFileSync(new URL('./sync-merge.js',import.meta.url),'utf8');
ok(syncMerge.includes('{...clone(prev),...clone(row)}')&&syncMerge.includes('{...clone(row),...clone(prev)}'),'remote summary merges preserve richer local exam-analysis fields without DB mutation');

const auth=fs.readFileSync(new URL('./auth.js',import.meta.url),'utf8');
const appCode=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
ok(auth.includes("event==='SIGNED_OUT'")&&auth.includes('V.Store.switchOwner(V.Store.guestId)'), 'SIGNED_OUT auth events switch runtime ownership back to the guest namespace');
ok(auth.includes("'session-expired'")&&auth.includes("'manual-signout'"),'auth runtime distinguishes session expiry from explicit logout');
ok(appCode.includes('로그인 세션이 만료되어 게스트 모드로 전환되었습니다.')&&appCode.includes('로그인 세션 만료 · 다시 로그인해주세요'),'session expiry UX provides persistent and immediate re-login guidance');
ok(appCode.includes('examReportId')&&appCode.includes('오답·미응답 분석')&&appCode.includes('incorrectQuestionIds'),'post-exam analytics stores the local answer snapshot and renders wrong/unanswered analysis');
ok(appCode.includes('data-exam-report')&&appCode.includes('data-report-close'),'recent exam history exposes a reopenable local analysis flow');
for(const [logical,physical] of Object.entries({profiles:'study_profiles',user_progress:'study_user_progress',user_answers:'study_user_answers',wrong_answers:'study_wrong_answers',review_schedule:'study_review_schedule',personal_notes:'study_personal_notes',private_documents:'study_private_documents',document_chunks:'study_document_chunks',study_sessions:'study_sessions',exam_history:'study_exam_history',tutor_preferences:'study_tutor_preferences'})){
  ok(auth.includes(`${logical}:'${physical}'`),`member sync maps ${logical} -> ${physical}`);
}
ok(auth.includes('remoteFirstOnSignIn:true'),'existing-member sign-in is remote-first before local push');
ok(auth.includes('remoteFirstOnManualSync:true'),'manual sync is remote-first before local push');
ok(auth.includes('await pullRemoteIntoLocal(user.id);return syncAllInternal(user.id)'),'manual sync performs pull/merge before push');
ok(auth.includes('deleted_at:iso(d.deletedAt)'),'private document tombstones are uploaded');
ok(auth.includes('client.from(T.document_chunks).delete()'),'deleted private documents remove remote extracted chunks');
ok(auth.includes('originalFilesAutoUpload:false'),'original personal files are never auto-uploaded');
ok(!auth.includes('.storage.from('),'auth sync has no original-file storage upload path');
ok(auth.includes('sharedProjectNamespace:\'study_*\''),'sync contract records the Study shared-project namespace');
ok(auth.includes('supabasePublishableKey'),'browser auth prefers the Supabase publishable key');
ok(auth.includes('enableCloudSync===true'),'backend connection is feature-gated until explicitly enabled');
ok(auth.includes("client.auth.resend({type:'signup',email})"),'signup confirmation email can be resent without changing project-wide auth settings');
ok(auth.includes('pendingEmailConfirmation:true'),'unconfirmed signup is represented as a pending state instead of a false failure');
ok(appCode.includes('data-resend-confirmation'),'account UI exposes confirmation-email resend');
ok(appCode.includes('Email not confirmed'),'account UI explains unconfirmed-email sign-in failures');

const membershipSql=fs.readFileSync(new URL('../supabase/v9-study-membership-trigger.sql',import.meta.url),'utf8');
ok(membershipSql.includes('create table if not exists public.study_memberships'),'Study membership registry is migration-controlled');
ok(membershipSql.includes("source text not null default 'study-v9' check (source = 'study-v9')"),'Study membership source is constrained');
ok(membershipSql.includes('grant select on table public.study_memberships to authenticated'),'clients can only read their own membership through RLS');
ok(membershipSql.includes('revoke all on function public.handle_new_study_v9_user() from public, anon, authenticated'),'Study bootstrap SECURITY DEFINER is not client-callable');
ok(membershipSql.includes('create policy study_membership_gate on public.%I as restrictive for all to authenticated'),'every Study table receives a restrictive membership gate');
ok(membershipSql.includes("bucket_id='study-private-v9'")&&membershipSql.includes('from public.study_memberships m'),'Study Storage policies require both owner folder and Study membership');

const guard=fs.readFileSync(new URL('./auth-membership-guard.js',import.meta.url),'utf8');
ok(guard.includes("from('study_memberships')"),'browser session guard checks server-created Study membership');
ok(guard.includes('STUDY_ACCOUNT_REQUIRED'),'non-Study shared-auth sessions fail closed');
ok(auth.includes("V.Auth?.hasStudyMembership&&!(await V.Auth.hasStudyMembership(next.id))"),'member adopt checks Study membership before any remote pull/push');
ok(guard.includes('membershipPreflightBeforeAdopt:true'),'membership preflight contract is recorded in sync policy');
ok(v9index.indexOf('./auth.js')<v9index.indexOf('./auth-membership-guard.js')&&v9index.indexOf('./auth-membership-guard.js')<v9index.indexOf('./app.js'),'Study membership guard loads after auth and before app UI');
const preview=fs.readFileSync(new URL('./preview.html',import.meta.url),'utf8');
ok(preview.includes('enableCloudSync:true')&&preview.includes('previewOnly:true'),'preview keeps real cloud sync enabled and remains explicitly preview-only');
ok(preview.includes('./auth-membership-guard.js'),'preview uses the same membership guard as v9');
ok(preview.indexOf('./supabase-lite.js')<preview.indexOf('./auth.js'),'preview loads same-origin auth client before member auth');
ok(auth.includes("clientRuntime:'same-origin-lite'")&&auth.includes('externalSdkRequired:false'),'auth runtime contract forbids external SDK dependency');
ok(!auth.includes('esm.sh')&&!auth.includes('cdn.jsdelivr.net')&&!auth.includes('unpkg.com'),'member auth has no external runtime SDK dependency');
const supabaseLite=fs.readFileSync(new URL('./supabase-lite.js',import.meta.url),'utf8');
ok(supabaseLite.includes("/auth/v1/signup"),'same-origin auth client implements signup');
ok(supabaseLite.includes("/auth/v1/token?grant_type=password"),'same-origin auth client implements password sign-in');
ok(supabaseLite.includes("/auth/v1/resend"),'same-origin auth client implements confirmation resend');
ok(supabaseLite.includes("/rest/v1/"),'same-origin auth client implements RLS Data API calls');
ok(v9index.indexOf('./supabase-lite.js')<v9index.indexOf('./auth.js'),'same-origin auth client loads before member auth');
ok(!auth.includes('service_role')&&!auth.includes('sb_secret_'),'browser auth contains no privileged Supabase key');
const configExample=fs.readFileSync(new URL('./config.example.js',import.meta.url),'utf8');
ok(configExample.includes('supabasePublishableKey'),'config example uses a publishable key');
ok(!/supabase(?:ServiceRole|Secret|Service)_?Key\s*:/i.test(configExample)&&!/sb_secret_[A-Za-z0-9]/.test(configExample),'config example never configures a privileged key');
const config=fs.readFileSync(new URL('./config.js',import.meta.url),'utf8');
ok(config.includes('enableCloudSync:true'),'release-ready v9 config enables real Study cloud sync');
ok(config.includes("officialPdfProxyBase:'https://study-119-pdf-proxy.vercel.app'"),'release-ready v9 config pins the verified official PDF proxy');
ok(!config.includes('bawcbkoyovbeajkrnduq'),'release-ready v9 config never points at Investment Production');
ok(config.includes("supabaseUrl:'https://petlfbztqguuzkasfpug.supabase.co'"),'checked-in v9 config pins the approved shared Supabase URL');
ok(/supabasePublishableKey:'sb_publishable_[A-Za-z0-9_-]+'/.test(config),'checked-in v9 config uses a browser-safe publishable key');
ok(!/sb_secret_[A-Za-z0-9_-]+/.test(config)&&!/service_role/i.test(config),'checked-in v9 config contains no privileged Supabase key');

const sourceCatalog=fs.readFileSync(new URL('./source-catalog-119.js',import.meta.url),'utf8');
ok(sourceCatalog.includes('noUserUploadRequired:true'),'official source catalog forbids user-upload requirement');
ok(sourceCatalog.includes('officialPageFallback:true'),'official source catalog has official-page fallback');
ok(sourceCatalog.includes('const proxy=doc=>')&&['fire1','fire2','ems','prevention1','prevention2','law1','law2','law3','law4','law5'].every(k=>sourceCatalog.includes(`directPdf:proxy('${k}')`)),'all ten official textbooks use the configured PDF proxy resolver');
ok(sourceCatalog.includes('arbitraryUrlProxy:false')&&sourceCatalog.includes('allCatalogDocsProxyable:true')&&sourceCatalog.includes('crossOriginProxy:!!proxyBase'),'official source catalog supports dedicated proxy origin while forbidding arbitrary URL proxying');
const officialProxy=fs.readFileSync(new URL('./api/official-pdf.js',import.meta.url),'utf8');
ok(officialProxy.includes("const SOURCES=Object.freeze")&&['fire1','fire2','ems','prevention1','prevention2','law1','law2','law3','law4','law5'].every(k=>officialProxy.includes(k+":")),'official PDF proxy uses a fixed ten-document allowlist');
ok(!/req\.query\?\.url|req\.query\.url|new URL\(.*req\.query/i.test(officialProxy),'official PDF proxy accepts no arbitrary upstream URL');
ok(officialProxy.includes("req.headers.range")&&officialProxy.includes("'content-range'")&&officialProxy.includes("'accept-ranges'"),'official PDF proxy forwards byte-range semantics for PDF.js');
ok(officialProxy.includes('resolveSource(doc')&&officialProxy.includes('extractAttachmentCandidates')&&officialProxy.includes('selectWorkingCandidate')&&officialProxy.includes('pdfProbe')&&officialProxy.includes('jsessionid'),'official PDF proxy resolves and verifies session-bound NFA PDF endpoint candidates server-side');
ok(officialProxy.includes("const BASE='https://www.nfa.go.kr'")&&officialProxy.includes("/nfsa/releaseinformation/archive/materials/"),'official PDF proxy resolver is pinned to NFA official materials');

const sourcePdf=fs.readFileSync(new URL('./source-pdf.js',import.meta.url),'utf8');
ok(sourcePdf.includes('pdf-evidence-line')&&sourcePdf.includes('evidenceLines('),'official PDF evidence highlights scored evidence lines instead of every matching word');
ok(sourcePdf.includes('devicePixelRatio')&&sourcePdf.includes('outputScale'),'official PDF canvas uses device-pixel scaling for crisp mobile rendering');
ok(sourcePdf.includes('serverUpload:false')&&sourcePdf.includes('originalUnmodified:true'),'official source PDFs are never server-uploaded and remain unmodified');
ok(sourcePdf.includes('userUploadRequired:false')&&sourcePdf.includes('officialRemotePreferred:true'),'PDF evidence prefers official remote sources and never requires user upload');
ok(sourcePdf.includes('SOURCE_REMOTE_UNRESOLVED'),'unresolved direct PDFs fail closed to official-page fallback');
const pdf=fs.readFileSync(new URL('./pdf.js',import.meta.url),'utf8');
ok(pdf.includes('exportForSync')&&pdf.includes('importFromSync'),'private extracted text supports owner-scoped member sync');
ok(pdf.includes('deletedDocuments')&&pdf.includes('deletionTombstones:true'),'local private-document deletion uses owner-scoped tombstones');
ok(pdf.includes('serverUpload:false')&&pdf.includes('crossUserSharing:false'),'personal document defaults remain private/no-share');

const liveClosedLoop=fs.readFileSync(new URL('../supabase/tests/v9-live-closed-loop.sql',import.meta.url),'utf8');
for(const table of ['study_user_progress','study_user_answers','study_wrong_answers','study_review_schedule','study_personal_notes','study_private_documents','study_document_chunks','study_sessions','study_exam_history']){
  ok(liveClosedLoop.includes('public.'+table),`live closed-loop covers ${table}`);
}
ok(liveClosedLoop.includes("set_config('request.jwt.claim.sub', a::text, true)")&&liveClosedLoop.includes("set_config('request.jwt.claim.sub', b::text, true)"),'live closed-loop tests two distinct Study identities');
ok(liveClosedLoop.includes('B_CAN_READ_A_DOC')&&liveClosedLoop.includes('B_CAN_INSERT_FOR_A'),'live closed-loop locks cross-owner negative cases');
ok(liveClosedLoop.includes("delete from public.study_document_chunks where id like '__liveqa_%'"),'live closed-loop includes explicit cleanup');
const root=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
ok(!root.includes('/v9/')&&!root.includes('v9/app.js'),'production root remains v8.6 during development');
console.log(JSON.stringify({concepts:V.curriculum.totalConcepts,verifiedPacks:coverage.verified,enrichedPacks:Object.values(V.contentPacks.authored).filter(p=>p.depthEnriched).length,questions:V.questions.length,mock,studyTables},null,2));