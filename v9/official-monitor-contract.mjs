import fs from 'node:fs';
import { parseNoticeList, classifyNotice, isRelevantTitle, isOfficialUrl, SOURCES } from './official-monitor-lib.mjs';

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
assert(classifyNotice('2027년 응급처치학개론 출제범위 변경공고')==='change_notice','scope change notice keeps change priority');
assert(classifyNotice('2027년 소방공무원 채용 체력시험 개편 안내')==='exam_policy','fitness/policy changes are monitored as exam policy');
assert(isRelevantTitle('2027년 공통교재 소방전술3(구급) 게시'),'official EMS textbook title is relevant');
assert(!isRelevantTitle('2027년 중앙소방학교 환경미화 공무직 채용'),'unrelated school employment notice is ignored');
assert(SOURCES.some(x=>x.id==='nfa-recruit')&&SOURCES.some(x=>x.id==='nfsa-notice')&&SOURCES.some(x=>x.id==='nfsa-materials'),'monitor covers NFA recruitment, NFSA notices and official materials');
const nfsaNotice=SOURCES.find(x=>x.id==='nfsa-notice'),nfsaMaterials=SOURCES.find(x=>x.id==='nfsa-materials');
assert(nfsaNotice.urls.includes('https://www.nfa.go.kr/nfsa/'),'NFSA notice monitoring has an NFA-hosted school-home fallback');
assert(nfsaMaterials.urls.some(x=>x.startsWith('https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/'))&&nfsaMaterials.urls.includes('https://www.nfa.go.kr/nfsa/'),'official textbook monitoring prefers NFA-hosted materials and falls back to the official school home');
assert(nfsaMaterials.accept.test('2027년 공통교재 [소방전술3]')&&!nfsaMaterials.accept.test('2027년 소방공무원 채용시험 시행계획 공고'),'materials source accepts textbook/standard changes without relabeling recruitment notices as textbooks');

const workflow=fs.readFileSync(new URL('../.github/workflows/official-monitor.yml',import.meta.url),'utf8');
const vercel=fs.readFileSync(new URL('../vercel.json',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('./api/official-monitor.js',import.meta.url),'utf8');
const rootApi=fs.readFileSync(new URL('../api/official-monitor.js',import.meta.url),'utf8');
const client=fs.readFileSync(new URL('./official-monitor.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');

assert(workflow.includes("cron: '17 */6 * * *'"),'official monitor runs every six hours');
assert(workflow.includes('chore/official-monitor-snapshot'),'scheduled monitor writes only to the isolated snapshot branch');
assert(!workflow.includes('git push origin HEAD:main'),'scheduled monitor never pushes main');
assert(vercel.includes('"chore/**": false'),'snapshot branch is excluded from Vercel deployments');
assert(api.includes('chore/official-monitor-snapshot')&&api.includes('OFFICIAL_MONITOR_UNAVAILABLE'),'app API reads isolated snapshot with safe unavailable fallback');
assert(rootApi.includes("require('../v9/api/official-monitor.js')"),'project-root Vercel API route delegates to the Study monitor implementation');
assert(client.includes('noAutomaticCurriculumMutation:true')&&client.includes('data-monitor-refresh'),'client keeps official notice monitoring separate from curriculum mutation and exposes controls');
assert(client.includes("'/api/official-monitor'")&&client.includes('SNAPSHOT_URL')&&client.includes('cachedSnapshotFallback:true'),'client uses root app API first, then static/cached snapshot fallbacks');
assert(client.includes('data-monitor-key')&&client.includes('old.dataset.monitorKey!==key'),'monitor DOM decoration is idempotent and cannot loop on its own MutationObserver');
assert(client.includes('backgroundServerMonitor:true')&&client.includes('devicePushWhenClosed:false')&&client.includes('setAppBadge'),'monitor copy/contracts distinguish scheduled server monitoring from closed-app push and support installed-app badges');
assert(client.includes('seenRevisionKeys')&&client.includes("changeState==='updated'")&&client.includes('공고 내용 변경'),'monitor re-alerts a previously seen notice only when its official revision fingerprint changes');
const sync=fs.readFileSync(new URL('./official-monitor-sync.mjs',import.meta.url),'utf8');
assert(sync.includes('previousFingerprint')&&sync.includes("changeState='updated'")&&sync.includes('updatedIds'),'scheduled snapshot marks same-notice revisions without mutating curriculum');
assert(sw.includes('/api/official-monitor')&&sw.includes('notificationclick'),'service worker uses network-first monitor data and notification click handling');
console.log('OFFICIAL_MONITOR_CONTRACT_COMPLETE');
