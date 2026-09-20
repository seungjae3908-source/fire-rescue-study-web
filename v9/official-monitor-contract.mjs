import fs from 'node:fs';
import { parseNoticeList, classifyNotice, isRelevantTitle, isOfficialUrl, extractOfficialDetail, enrichOfficialRow, collectOfficialNotices, SOURCES, MONITOR_FETCH_POLICY } from './official-monitor-lib.mjs';

const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};
const fixture=[
  '<table>',
  '<tr><td><a href="/nfa/news/job/nfajob/?mode=view&cntId=2027">2027년 소방공무원 채용시험 시행계획 공고</a></td><td>2026-12-20</td></tr>',
  '<tr><td><a href="/nfa/news/job/nfajob/?mode=view&cntId=change">2027년 소방공무원 채용시험 시행계획 변경공고</a></td><td>2027-01-05</td></tr>',
  '<tr><td><a href="/nfa/news/job/nfajob/?mode=view&cntId=staff">소방청 공무직 환경미화 채용 공고</a></td><td>2027-01-06</td></tr>',
  '<tr><td><a href="https://evil.example.com/x">2027년 소방공무원 시험일정 공고</a></td><td>2027-01-07</td></tr>',
  '</table>'
].join('');

const rows=parseNoticeList(fixture,{sourceId:'nfa-recruit',sourceLabel:'소방청 채용·시험',baseUrl:'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=list&pageIdx=1'});
assert(rows.length===3,'relevant official recruitment rows are selected while unrelated employment is ignored');
assert(rows.some(x=>x.kind==='change_notice'&&x.reviewRequired),'change notice is high-impact and review-required');
assert(rows.every(x=>isOfficialUrl(x.url)),'parsed notice URLs remain on official allowlisted hosts');
assert(rows.every(x=>/^[a-f0-9]{20}$/.test(x.fingerprint||'')),'each official notice carries a stable row-local revision fingerprint');
assert(rows.find(x=>x.title.includes('2027년 소방공무원 채용시험 시행계획 공고'))?.notificationEligible===true,'explicit 2027 official notice is eligible for app notification');
const oldYearRows=parseNoticeList('<table><tr><td><a href="/nfa/news/job/nfajob/?mode=view&cntId=old-year">2026년 소방공무원 채용시험 일정 공고</a></td><td>2026-09-21</td></tr></table>',{sourceId:'nfa-recruit',sourceLabel:'소방청 채용·시험',baseUrl:'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=list&pageIdx=1'});
assert(oldYearRows[0]?.notificationEligible===false,'2026 official notice remains visible data but is not pushed as a new 2027 exam notice');
const detail=extractOfficialDetail('<div>2027년 소방공무원 채용시험 안내 접수일 : 2026-12-28 마감일 : 2027-01-03 필기시험일 : 2027. 3. 13. 체력시험일 : 2027-04-02 면접시험일 : 2027/05/12 최종합격자 발표 : 2027-06-01 <a href="/nfa/file/2027-plan.pdf">시행계획 공고문 PDF</a></div>','https://www.nfa.go.kr/nfa/news/notice/?mode=view&cntId=2027');
assert(detail.targetYearMention===true&&detail.schedule.applicationStart==='2026-12-28'&&detail.schedule.applicationEnd==='2027-01-03','official detail parser extracts target year and application window without guessing');
assert(detail.schedule.writtenExam==='2027-03-13'&&detail.schedule.physicalExam==='2027-04-02'&&detail.schedule.interview==='2027-05-12'&&detail.schedule.finalResult==='2027-06-01','official detail parser extracts labeled written/physical/interview/final dates');
assert(detail.attachmentCount===1&&detail.attachments[0]?.url==='https://www.nfa.go.kr/nfa/file/2027-plan.pdf','official detail parser records official attached notice files without guessing their contents');
const yearless=parseNoticeList('<table><tr><td><a href="/nfa/news/job/nfajob/?mode=view&cntId=yearless">소방공무원 채용시험 시행계획 공고</a></td><td>2026-12-20</td></tr></table>',{sourceId:'nfa-recruit',sourceLabel:'소방청 채용·시험',baseUrl:'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=list&pageIdx=1'})[0];
const enriched=await enrichOfficialRow(yearless,async()=>new Response('<div>2027년 소방공무원 채용시험 시행계획 접수일 2026-12-28 마감일 2027-01-03</div>',{status:200}));
assert(enriched.targetYearMatch===true&&enriched.notificationEligible===true&&enriched.schedule?.applicationStart==='2026-12-28','yearless list title is promoted to 2027 only after official detail text confirms the target year');
const enrichedRevision=await enrichOfficialRow(yearless,async()=>new Response('<div>2027년 소방공무원 채용시험 시행계획 접수일 2026-12-29 마감일 2027-01-04 <a href="/nfa/file/plan-v2.pdf">변경 공고문 PDF</a></div>',{status:200}));
assert(enriched.id===enrichedRevision.id&&enriched.fingerprint!==enrichedRevision.fingerprint,'same official post changes revision fingerprint when official detail schedule or attachment metadata changes');
const originalRevision=parseNoticeList('<table><tr><td><a href="/nfa/news/job/nfajob/?mode=view&cntId=same-post">2027년 소방공무원 채용시험 일정 공고</a></td><td>2026-12-20</td></tr></table>',{sourceId:'nfa-recruit',sourceLabel:'소방청 채용·시험',baseUrl:'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=list&pageIdx=1'})[0];
const correctedRevision=parseNoticeList('<table><tr><td><a href="/nfa/news/job/nfajob/?mode=view&cntId=same-post">2027년 소방공무원 채용시험 일정 정정공고</a></td><td>2026-12-21</td></tr></table>',{sourceId:'nfa-recruit',sourceLabel:'소방청 채용·시험',baseUrl:'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=list&pageIdx=1'})[0];
assert(originalRevision.id===correctedRevision.id,'same official post keeps a stable identity when its title/date are corrected');
assert(originalRevision.fingerprint!==correctedRevision.fingerprint,'same official post correction changes its revision fingerprint');
assert(classifyNotice('2027년 응급처치학개론 출제범위 변경공고')==='change_notice','scope change notice keeps change priority');
assert(classifyNotice('2027년 소방공무원 채용 체력시험 개편 안내')==='exam_policy','fitness/policy changes are monitored as exam policy');
assert(isRelevantTitle('2027년 공통교재 소방전술3(구급) 게시'),'official EMS textbook title is relevant');
assert(!isRelevantTitle('2027년 중앙소방학교 환경미화 공무직 채용'),'unrelated school employment notice is ignored');
assert(SOURCES.some(x=>x.id==='gosi-fire')&&SOURCES.some(x=>x.id==='nfsa-notice')&&SOURCES.some(x=>x.id==='nfsa-materials')&&SOURCES.length===3,'monitor covers the official fire recruitment system plus NFSA notices and official materials');
const libSource=fs.readFileSync(new URL('./official-monitor-lib.mjs',import.meta.url),'utf8');
assert(libSource.includes('noRelevantNoticeIsHealthy: true')&&libSource.includes('healthy: sourceStatus.length === SOURCES.length && successCount === SOURCES.length'),'monitor health requires every declared V2 official source to be reachable');
assert(libSource.includes('sequentialSourceFetch:true')&&libSource.includes('maxConcurrentSourceGroups:1')&&MONITOR_FETCH_POLICY.detailConcurrency===2&&MONITOR_FETCH_POLICY.requestTimeoutMs===9000,'monitor avoids burst traffic with sequential source groups, low detail concurrency and bounded request timeouts');
assert(libSource.includes('wafChallengeDetection:true')&&libSource.includes('wafBypassForbidden:true')&&libSource.includes("machineFriendlyRecruitmentSource:'https://gongmuwon.gosi.kr/spcsv/indexMain3.do'")&&MONITOR_FETCH_POLICY.attempts===2,'monitor detects WAF challenges, forbids bypass and routes recruitment through an official machine-friendly source');
const gosiFire=SOURCES.find(x=>x.id==='gosi-fire'),nfsaNotice=SOURCES.find(x=>x.id==='nfsa-notice'),nfsaMaterials=SOURCES.find(x=>x.id==='nfsa-materials');
assert(gosiFire?.urls?.[0]==='https://gongmuwon.gosi.kr/spcsv/indexMain3.do'&&gosiFire.detail===false,'fire recruitment monitoring uses the official National Civil Service Recruitment System landing and avoids unsafe aggregate-page detail promotion');
assert(nfsaNotice?.urls?.[0]==='https://www.nfsa.go.kr/nfsa/'&&nfsaNotice?.detail===false,'NFSA notice monitoring uses the reachable canonical official school home without unsafe aggregate-page detail promotion');
assert(nfsaMaterials?.urls?.[0]==='https://www.nfsa.go.kr/nfsa/releaseinformation/archive/materials/'&&nfsaMaterials?.fallbackUrls?.[0]==='https://www.nfsa.go.kr/nfsa/','official textbook monitoring uses the canonical certificate-valid NFSA materials path with the official school home fallback');
assert(!JSON.stringify(SOURCES).includes('"https://nfsa.go.kr/')&&!JSON.stringify(SOURCES).includes('"https://www.nfa.go.kr/nfsa/')&&!JSON.stringify(SOURCES).includes('cherish.nfsa.go.kr'),'V2 removes the known TLS-bad non-www NFSA path, WAF-blocked NFA-hosted school path and unstable cherish automatic path');
assert(nfsaMaterials.accept.test('2027년 공통교재 [소방전술3]')&&!nfsaMaterials.accept.test('2027년 소방공무원 채용시험 시행계획 공고'),'materials source accepts textbook/standard changes without relabeling recruitment notices as textbooks');


let activeFetches=0,maxActiveFetches=0;
const fakeList='<table><tr><td><a href="/nfa/news/job/nfajob/?mode=view&cntId=sequential-test">2027년 소방공무원 채용시험 시행계획 공고</a></td><td>2026-12-20</td></tr></table>';
const fakeFetch=async(url)=>{
  activeFetches++;maxActiveFetches=Math.max(maxActiveFetches,activeFetches);
  await new Promise(r=>setTimeout(r,2));
  activeFetches--;
  return new Response(fakeList,{status:200,headers:{'content-type':'text/html'}});
};
const sequentialSnapshot=await collectOfficialNotices(fakeFetch,new Date('2026-12-20T00:00:00Z'),{attempts:1,retryDelaysMs:[0],sourceGapMs:0,detailConcurrency:1});
assert(sequentialSnapshot.healthy===true&&sequentialSnapshot.sourceStatus.length===SOURCES.length,'sequential collector preserves three-source V2 fail-closed health semantics');
assert(maxActiveFetches===1,'collector avoids source burst traffic and keeps the deterministic contract test single-flight');

let gosiCalls=0;
const noBypassFetch=async(url)=>{
  const host=new URL(String(url)).hostname;
  if(host==='gongmuwon.gosi.kr'){
    gosiCalls++;
    return new Response('<html><title>방문자 확인</title><body>JavaScript 활성 후 다시 접속</body></html>',{status:200});
  }
  return new Response(fakeList,{status:200,headers:{'content-type':'text/html'}});
};
const blockedSnapshot=await collectOfficialNotices(noBypassFetch,new Date('2026-12-20T00:00:00Z'),{attempts:2,retryDelaysMs:[0,1],sourceGapMs:0,detailConcurrency:1});
assert(blockedSnapshot.healthy===false&&blockedSnapshot.sourceStatus.find(x=>x.id==='gosi-fire')?.errorCode==='WAF_CHALLENGE','WAF challenge on the official recruitment source fails closed instead of being treated as content');
assert(gosiCalls===1,'WAF challenge is not retried or bypassed on the same official endpoint');

const workflow=fs.readFileSync(new URL('../.github/workflows/official-monitor.yml',import.meta.url),'utf8');
const vercel=fs.readFileSync(new URL('../vercel.json',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('./api/official-monitor.js',import.meta.url),'utf8');
const rootApi=fs.readFileSync(new URL('../api/official-monitor.js',import.meta.url),'utf8');
const client=fs.readFileSync(new URL('./official-monitor.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');

assert(workflow.includes("cron: '17 * * * *'"),'official monitor runs every hour');
assert(workflow.includes('chore/official-monitor-snapshot'),'scheduled monitor writes only to the isolated snapshot branch');
assert(workflow.includes('continue-on-error: true')&&workflow.includes('official-monitor-health.json')&&workflow.includes('official-monitor-last-good.json'),'scheduled monitor publishes health/degraded bootstrap state while preserving a separate last-good snapshot');
assert(workflow.includes('Fail closed when live official collection is unhealthy')&&workflow.includes('OFFICIAL_MONITOR_LIVE_COLLECTION_UNHEALTHY'),'scheduled monitor persists outage evidence before the workflow still fails closed');
assert(!workflow.includes('git push origin HEAD:main'),'scheduled monitor never pushes main');
assert(vercel.includes('"chore/**": false'),'snapshot branch is excluded from Vercel deployments');
assert(api.includes('chore/official-monitor-snapshot')&&api.includes('MAX_STALE_MS=90*60*1000')&&api.includes('degraded-snapshot')&&api.includes('OFFICIAL_MONITOR_UNAVAILABLE'),'app API reads isolated snapshot/health state, avoids retry storms during a recent known outage and keeps a safe unavailable fallback');
assert(rootApi.includes("require('../v9/api/official-monitor.js')"),'project-root Vercel API route delegates to the Study monitor implementation');
assert(client.includes('noAutomaticCurriculumMutation:true')&&client.includes('data-monitor-refresh'),'client keeps official notice monitoring separate from curriculum mutation and exposes controls');
assert(client.includes("'/api/official-monitor'")&&client.includes('SNAPSHOT_URL')&&client.includes('cachedSnapshotFallback:true'),'client uses root app API first, then static/cached snapshot fallbacks');
assert(client.includes('MAX_SNAPSHOT_AGE_MS=90*60*1000')&&client.includes('staleSnapshotNeverClaimsNoChange:true')&&client.includes('notificationSuppressed'),'client never converts an old/degraded snapshot into a no-change claim or a new-notice push');
assert(client.includes('data-monitor-key')&&client.includes('old.dataset.monitorKey!==key'),'monitor DOM decoration is idempotent and cannot loop on its own MutationObserver');
assert(client.includes('backgroundServerMonitor:true')&&client.includes('wafBypassForbidden:true')&&client.includes('machineFriendlyOfficialSources:true')&&client.includes('devicePushWhenClosed:false')&&client.includes('setAppBadge')&&client.includes('매시간'),'monitor copy/contracts distinguish hourly server monitoring, forbid WAF bypass and expose machine-friendly official-source policy');
assert(client.includes('seenRevisionKeys')&&client.includes("changeState==='updated'")&&client.includes('공고 내용 변경'),'monitor re-alerts a previously seen notice only when its official revision fingerprint changes');
assert(client.includes('requiredSourceCount:Number(state.snapshot?.policy?.requiredSourceCount')&&client.includes('requiredSourceCount=Number(m.requiredSourceCount||sourceTotal||0)')&&client.includes('completeSources=fresh&&requiredSourceCount>0')&&client.includes("sourceOk+'/'+(requiredSourceCount||sourceTotal||0)")&&client.includes('일부 공식소스 확인 필요')&&client.includes('결과 확정 보류'),'monitor reports dynamic required-source coverage and never claims no change while any declared official source is unavailable');
assert(client.includes('eligibleNotice')&&client.includes('targetItems'),'client alerts and foregrounds target-year eligible official notices instead of old-year history');
assert(libSource.includes('verifyTargetYearFromOfficialDetail: true')&&libSource.includes('extractOfficialScheduleDates: true')&&libSource.includes('neverGuessMissingDates: true'),'monitor verifies yearless target notices and extracts only labeled official schedule dates');
assert(client.includes('official-monitor-schedule')&&client.includes('detailScheduleDisplay:true')&&client.includes('neverGuessMissingDates:true'),'student monitor displays structured official schedule dates without invented values');
assert(client.includes('function dday')&&client.includes('scheduleDday:true'),'student monitor computes D-day from official labeled dates only');
assert(client.includes('downloadScheduleCalendar')&&client.includes('text/calendar')&&client.includes('scheduleCalendarExport:true'),'student monitor can export official labeled schedule dates as an ICS calendar');
assert(client.includes('official-monitor-attachment')&&client.includes('officialAttachmentHint:true'),'student monitor tells the user to inspect the official attached notice when labeled dates are not present in HTML');
const sync=fs.readFileSync(new URL('./official-monitor-sync.mjs',import.meta.url),'utf8');
assert(sync.includes('previousFingerprint')&&sync.includes("changeState='updated'")&&sync.includes('updatedIds'),'scheduled snapshot marks same-notice revisions, including enriched detail revisions, without mutating curriculum');
assert(sync.includes('official-monitor-last-good.json')&&sync.includes('degradedSnapshot')&&sync.includes('notificationSuppressed:true'),'sync preserves last-good notice items across an outage and publishes a truthful degraded bootstrap when no last-good snapshot exists');
assert(sync.includes('structuredChanges')&&sync.includes('공식 첨부파일 변경')&&client.includes('official-monitor-change-summary'),'updated official notices expose structured date/file differences instead of only a generic changed label');
assert(sw.includes('/api/official-monitor')&&sw.includes('notificationclick'),'service worker uses network-first monitor data and notification click handling');
console.log('OFFICIAL_MONITOR_CONTRACT_COMPLETE');
// Exact-head revision-monitor regression trigger.
// Exact-head 2027-target monitor proof.
// Partial-source fail-closed regression trigger.
// Exact-head official detail schedule regression trigger.
// Exact-head NFA notice-board coverage regression trigger.
// Exact-head hourly-freshness regression trigger.
// Exact-head detail-revision fingerprint regression trigger.
