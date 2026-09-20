import { createHash } from 'node:crypto';

export const TARGET_YEAR = 2027;
export const BASELINE_YEAR = 2026;
export const OFFICIAL_HOSTS = new Set([
  'www.nfa.go.kr', 'nfa.go.kr',
  'www.nfsa.go.kr', 'nfsa.go.kr', 'cherish.nfsa.go.kr'
]);

export const SOURCES = [
  {
    id: 'nfa-recruit',
    label: '소방청 채용·시험',
    strategy: 'all',
    urls: [
      'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=list&pageIdx=1',
      'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=list&pageIdx=2',
      'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=list&pageIdx=3'
    ]
  },
  {
    id: 'nfa-notice',
    label: '소방청 공지사항',
    strategy: 'all',
    accept: /소방공무원|채용시험|시험일정|채용일정|필기시험|시험과목|출제범위|문항수|시험시간|시험방법|체력시험|가점|응시자격|원서접수|신체검사|면접시험|응급처치학|소방학|시행계획|변경공고|정정공고/i,
    urls: [
      'https://www.nfa.go.kr/nfa/news/notice/?mode=list&pageIdx=1',
      'https://www.nfa.go.kr/nfa/news/notice/?mode=list&pageIdx=2',
      'https://www.nfa.go.kr/nfa/news/notice/?mode=list&pageIdx=3'
    ]
  },
  {
    id: 'nfsa-notice',
    label: '중앙소방학교 고시·공고',
    strategy: 'first-ok',
    accept: /소방공무원|채용시험|시험일정|채용일정|필기시험|시험과목|출제범위|문항수|시험시간|시험방법|체력시험|가점|응시자격|원서접수|신체검사|면접시험|응급처치학|소방학|시행계획|변경공고|정정공고/i,
    urls: [
      'https://www.nfsa.go.kr/nfsa/news/notice/?mode=list&pageIdx=1',
      'https://cherish.nfsa.go.kr/nfsa/news/notice/?mode=list&pageIdx=1',
      'https://www.nfa.go.kr/nfsa/'
    ]
  },
  {
    id: 'nfsa-materials',
    label: '중앙소방학교 공식교재',
    strategy: 'all',
    accept: /공통교재|소방전술[123]|구급.*(지침|기준|표준)|응급처치.*(지침|기준|표준)|공식교재/i,
    urls: [
      'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?mode=list&pageIdx=1',
      'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?mode=list&pageIdx=2',
      'https://www.nfsa.go.kr/nfsa/releaseinformation/archive/materials/?mode=list&pageIdx=1',
      'https://nfsa.go.kr/nfsa/releaseinformation/archive/materials/?mode=list&pageIdx=1',
      'https://www.nfa.go.kr/nfsa/'
    ]
  }
];

const IMPORTANT = /소방공무원|채용시험|시험일정|채용일정|필기시험|시험과목|출제범위|문항수|시험시간|시험방법|체력시험|가점|응시자격|원서접수|신체검사|면접시험|응급처치학|소방학|공통교재|소방전술[123]|구급|교재|시행계획|변경공고|정정공고/i;
const IGNORE = /공무직|환경미화|청년인턴|전문임기제|일반임기제|전문경력관|외래강사|연구논문|콘퍼런스|화재조사관|소방간부후보생|항공분야|법무분야/i;
const HIGH_IMPACT = /변경공고|정정공고|시행계획|시험일정|채용일정|필기시험|시험과목|출제범위|문항수|시험시간|시험방법|체력시험|가점|응시자격|원서접수|신체검사|면접시험|응급처치학|소방학|공통교재|소방전술3|구급/i;

export function isOfficialUrl(value) {
  try {
    const u = new URL(String(value || ''));
    return u.protocol === 'https:' && OFFICIAL_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function decodeEntities(value) {
  const map = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
  return String(value || '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, m => map[m] || m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function textOnly(value) {
  return decodeEntities(
    String(value || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

function dateNear(value) {
  const m = String(value || '').match(/(20\d{2})[.\/-]\s*(0?\d{1,2})[.\/-]\s*(0?\d{1,2})/);
  return m ? [m[1], String(Number(m[2])).padStart(2, '0'), String(Number(m[3])).padStart(2, '0')].join('-') : '';
}

function rowContext(src, index, anchorLength) {
  for (const tag of ['tr', 'li']) {
    const open = src.lastIndexOf('<' + tag, index);
    const close = src.indexOf('</' + tag + '>', index + anchorLength);
    if (open >= 0 && close >= 0 && close - open <= 4000) return textOnly(src.slice(open, close + tag.length + 3));
  }
  return textOnly(src.slice(Math.max(0, index - 350), Math.min(src.length, index + anchorLength + 450)));
}

function fingerprintFor(row, context) {
  return createHash('sha256')
    .update([row.sourceId, row.title, row.publishedAt, row.url, context].join('\n'))
    .digest('hex')
    .slice(0, 20);
}

function explicitYearFromTitle(title) {
  const t = String(title || '').match(/20\d{2}/);
  return t ? Number(t[0]) : null;
}
function yearFrom(title, publishedAt) {
  const t = explicitYearFromTitle(title);
  if (t) return t;
  const d = String(publishedAt || '').match(/^20\d{2}/);
  return d ? Number(d[0]) : null;
}
function labeledDate(text,labelRe){
  const src=String(text||''),m=labelRe.exec(src);
  if(!m)return'';
  return dateNear(src.slice(m.index,Math.min(src.length,m.index+110)));
}
export function extractOfficialDetail(html, baseUrl='') {
  const text=textOnly(html);
  const attachments=[];
  const aRe=/<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  for(const m of String(html||'').matchAll(aRe)){
    const href=(m[1].match(/\bhref\s*=\s*["']([^"']+)["']/i)||[])[1]||'';
    const label=textOnly(m[2]);
    const looksFile=/\.(pdf|hwpx?|hwp)(?:$|[?#])/i.test(href)||/PDF|HWPX?|첨부|다운로드|공고문|시행계획/i.test(label);
    if(!looksFile||!baseUrl)continue;
    const url=resolveNoticeUrl(href,baseUrl);
    if(!isOfficialUrl(url))continue;
    if(!attachments.some(x=>x.url===url))attachments.push({label:label||'첨부파일',url});
    if(attachments.length>=8)break;
  }
  const schedule={
    applicationStart:labeledDate(text,/접수일|원서\s*접수\s*(?:시작|기간)?/i),
    applicationEnd:labeledDate(text,/마감일|원서\s*접수\s*(?:마감|종료)/i),
    writtenExam:labeledDate(text,/필기\s*시험(?:일|일자|일정)?/i),
    physicalExam:labeledDate(text,/체력\s*시험(?:일|일자|일정)?/i),
    interview:labeledDate(text,/면접\s*시험(?:일|일자|일정)?/i),
    finalResult:labeledDate(text,/최종\s*(?:합격자?\s*)?(?:발표|합격)/i)
  };
  for(const k of Object.keys(schedule))if(!schedule[k])delete schedule[k];
  return{
    targetYearMention:new RegExp('(?:^|[^0-9])'+TARGET_YEAR+'\\s*년').test(text),
    schedule,
    scheduleCount:Object.keys(schedule).length,
    attachments,
    attachmentCount:attachments.length
  };
}

export function classifyNotice(title) {
  const t = String(title || '');
  if (/변경공고|정정공고/.test(t)) return 'change_notice';
  if (/시험일정|필기시험.*(일정|장소)|장소.*공고/.test(t)) return 'exam_schedule';
  if (/시험과목|출제범위|문항수|시험시간|응급처치학|소방학/.test(t)) return 'exam_scope';
  if (/체력시험|가점|응시자격|원서접수|시험방법|신체검사|면접시험/.test(t)) return 'exam_policy';
  if (/공통교재|소방전술[123]|교재/.test(t)) return 'official_textbook';
  if (/구급.*(지침|기준|표준)|응급처치.*(지침|기준|표준)/.test(t)) return 'official_standard';
  if (/시행계획|소방공무원.*채용시험/.test(t)) return 'recruitment_notice';
  return 'other_relevant';
}

export function isRelevantTitle(title) {
  const t = textOnly(title);
  return t.length >= 7 && IMPORTANT.test(t) && !IGNORE.test(t);
}

function resolveNoticeUrl(raw, baseUrl) {
  const href = decodeEntities(String(raw || '').trim()).replace(/&amp;/g, '&');
  if (!href || href === '#') return baseUrl;
  if (/^javascript:/i.test(href)) {
    const direct = (href.match(/https?:\/\/[^'"\s)]+/i) || [])[0];
    return direct && isOfficialUrl(direct) ? direct : baseUrl;
  }
  try {
    const u = new URL(href, baseUrl);
    return isOfficialUrl(u.href) ? u.href : baseUrl;
  } catch {
    return baseUrl;
  }
}

function stableOfficialKey(row) {
  try {
    const u=new URL(String(row.url||''));
    const stableParams=['cntId','cntid','bbsId','bbsid','nttId','nttid','boardId','boardid'];
    const ids=stableParams.map(k=>[k,u.searchParams.get(k)]).filter(([,v])=>v);
    if(ids.length){
      const strong=ids.filter(([k])=>!/board/i.test(k));
      const selected=strong.length?strong:ids;
      return [row.sourceId,u.hostname.toLowerCase(),u.pathname,...selected.flat()].join('|');
    }
  } catch {}
  return [row.sourceId,row.title,row.publishedAt,row.url].join('|');
}
function idFor(row) {
  return createHash('sha256')
    .update(stableOfficialKey(row))
    .digest('hex')
    .slice(0, 24);
}
function enrichedFingerprint(row,detail){
  const stableDetail={
    targetYearMention:detail?.targetYearMention===true,
    schedule:detail?.schedule||{},
    attachments:(detail?.attachments||[]).map(x=>({label:String(x.label||''),url:String(x.url||'')}))
  };
  return createHash('sha256')
    .update([String(row?.fingerprint||''),JSON.stringify(stableDetail)].join('\n'))
    .digest('hex')
    .slice(0,20)
}

export function parseNoticeList(html, { sourceId, sourceLabel, baseUrl }) {
  const src = String(html || '');
  const out = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

  for (const m of src.matchAll(re)) {
    const title = textOnly(m[2]);
    if (!isRelevantTitle(title)) continue;

    const href = (m[1].match(/\bhref\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    const context = rowContext(src, m.index || 0, m[0].length);
    const publishedAt = dateNear(context);
    const url = resolveNoticeUrl(href, baseUrl);
    const kind = classifyNotice(title);
    const explicitYear = explicitYearFromTitle(title);
    const noticeYear = yearFrom(title, publishedAt);

    const row = {
      sourceId,
      sourceLabel,
      title,
      publishedAt,
      url,
      kind,
      meaningful: kind !== 'other_relevant' || HIGH_IMPACT.test(title),
      reviewRequired: HIGH_IMPACT.test(title),
      targetYearMatch: noticeYear === TARGET_YEAR,
      baselineYearMatch: noticeYear === BASELINE_YEAR,
      explicitYear,
      noticeYear,
      notificationEligible: noticeYear === TARGET_YEAR
    };
    row.id = idFor(row);
    row.fingerprint = fingerprintFor(row, context);
    out.push(row);
  }

  const dedupe = new Map();
  for (const row of out) {
    const key = (row.title + '|' + row.publishedAt).toLowerCase();
    if (!dedupe.has(key) || (dedupe.get(key).url === baseUrl && row.url !== baseUrl)) dedupe.set(key, row);
  }
  return [...dedupe.values()];
}

const FETCH_TIMEOUT_MS=8000;
const DETAIL_CONCURRENCY=6;

async function fetchText(url, fetchImpl) {
  if (!isOfficialUrl(url)) throw new Error('NON_OFFICIAL_SOURCE');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 119-study-official-monitor/1.0',
        accept: 'text/html,application/xhtml+xml'
      }
    });
    if (!res.ok) throw new Error('HTTP_' + res.status);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function enrichOfficialRow(row, fetchImpl = fetch) {
  if(!row?.reviewRequired||!isOfficialUrl(row.url))return row;
  const shouldCheck=row.targetYearMatch===true||row.explicitYear==null;
  if(!shouldCheck)return row;
  try{
    const html=await fetchText(row.url,fetchImpl);
    const detail=extractOfficialDetail(html,row.url);
    const targetYearMatch=row.targetYearMatch===true||detail.targetYearMention===true;
    return{
      ...row,
      detailChecked:true,
      fingerprint:enrichedFingerprint(row,detail),
      targetYearMatch,
      baselineYearMatch:targetYearMatch?false:row.baselineYearMatch,
      noticeYear:targetYearMatch?TARGET_YEAR:row.noticeYear,
      notificationEligible:targetYearMatch,
      schedule:detail.schedule,
      scheduleCount:detail.scheduleCount,
      attachments:detail.attachments,
      attachmentCount:detail.attachmentCount
    };
  }catch(err){
    return{...row,detailChecked:false,detailError:String(err?.message||err).slice(0,80)}
  }
}

async function collectSource(source,fetchImpl){
  const load=async url=>{
    const html=await fetchText(url,fetchImpl);
    const parsed=parseNoticeList(html,{sourceId:source.id,sourceLabel:source.label,baseUrl:url});
    const accepted=source.accept?parsed.filter(row=>source.accept.test(row.title)):parsed;
    return{url,accepted}
  };
  const pending=source.urls.map(url=>load(url));
  if(source.strategy==='first-ok'){
    let lastError='';
    for(const task of pending){
      try{
        const hit=await task;
        return{
          items:hit.accepted,
          status:{id:source.id,label:source.label,ok:true,pagesOk:1,status:'ok',error:''}
        }
      }catch(err){lastError=String(err?.message||err).slice(0,120)}
    }
    return{
      items:[],
      status:{id:source.id,label:source.label,ok:false,pagesOk:0,status:'error',error:lastError}
    }
  }
  const settled=await Promise.allSettled(pending);
  const ok=settled.filter(x=>x.status==='fulfilled');
  const items=ok.flatMap(x=>x.value.accepted);
  const errors=settled.filter(x=>x.status==='rejected').map(x=>String(x.reason?.message||x.reason).slice(0,120));
  return{
    items,
    status:{
      id:source.id,label:source.label,ok:ok.length>0,pagesOk:ok.length,
      status:ok.length>0?'ok':'error',
      error:ok.length>0?'':errors[errors.length-1]||'SOURCE_UNAVAILABLE'
    }
  }
}

async function mapLimit(rows,limit,fn){
  const out=new Array(rows.length);
  let cursor=0;
  const workers=Array.from({length:Math.min(limit,rows.length)},async()=>{
    while(true){
      const i=cursor++;
      if(i>=rows.length)return;
      out[i]=await fn(rows[i],i)
    }
  });
  await Promise.all(workers);
  return out
}

export async function collectOfficialNotices(fetchImpl = fetch, now = new Date()) {
  const sourceResults=await Promise.all(SOURCES.map(source=>collectSource(source,fetchImpl)));
  const items=sourceResults.flatMap(x=>x.items);
  const sourceStatus=sourceResults.map(x=>x.status);

  const unique = new Map();
  for (const row of items) {
    const key = (row.title + '|' + row.publishedAt).toLowerCase();
    const prev = unique.get(key);
    if (!prev || (!prev.targetYearMatch && row.targetYearMatch)) unique.set(key, row);
  }

  const uniqueRows=[...unique.values()];
  const enriched=await mapLimit(uniqueRows,DETAIL_CONCURRENCY,row=>enrichOfficialRow(row,fetchImpl));

  const sorted = enriched
    .filter(x => x.meaningful)
    .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')) || a.title.localeCompare(b.title, 'ko'));

  const successCount = sourceStatus.filter(x => x.ok).length;
  const nfaRecruitOk = sourceStatus.some(x => x.id === 'nfa-recruit' && x.ok);
  const nfaNoticeOk = sourceStatus.some(x => x.id === 'nfa-notice' && x.ok);

  return {
    version: '119-official-monitor-snapshot-v1',
    generatedAt: now.toISOString(),
    targetExamYear: TARGET_YEAR,
    baselineYear: BASELINE_YEAR,
    officialOnly: true,
    policy: {
      sources: ['소방청', '중앙소방학교'],
      noThirdParty: true,
      noAutomaticCurriculumMutation: true,
      notifyOnlyRelevantOfficialNotices: true,
      targetYearNotificationsOnly: true,
      noRelevantNoticeIsHealthy: true,
      detectSameNoticeMetadataRevision: true,
      verifyTargetYearFromOfficialDetail: true,
      extractOfficialScheduleDates: true,
      neverGuessMissingDates: true,
      detectOfficialAttachments: true,
      parallelSourceFetch:true,
      detailConcurrency:DETAIL_CONCURRENCY,
      requestTimeoutMs:FETCH_TIMEOUT_MS,
      snapshotBranch: 'chore/official-monitor-snapshot'
    },
    healthy: nfaRecruitOk && nfaNoticeOk && successCount === sourceStatus.length,
    hasRelevantItems: sorted.length > 0,
    sourceStatus,
    items: sorted.slice(0, 120)
  };
}
