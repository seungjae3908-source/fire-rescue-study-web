import { createHash } from 'node:crypto';

export const TARGET_YEAR = 2027;
export const BASELINE_YEAR = 2026;
export const OFFICIAL_HOSTS = new Set([
  'www.nfa.go.kr', 'nfa.go.kr',
  'www.nfsa.go.kr', 'cherish.nfsa.go.kr',
  'gongmuwon.gosi.kr'
]);

export const SOURCES = [
  {
    id: 'gosi-fire',
    label: '국가공무원 채용시스템 · 소방청',
    strategy: 'first-ok',
    detail: false,
    accept: /소방공무원|채용시험|시험일정|필기시험|시험과목|출제범위|문항수|시험시간|체력시험|가점|응시자격|원서접수|면접시험|임용령|응급처치학|소방학|시행계획|변경공고|정정공고/i,
    urls: [
      'https://gongmuwon.gosi.kr/spcsv/indexMain3.do'
    ]
  },
  {
    id: 'nfsa-notice',
    label: '중앙소방학교 고시·공고',
    strategy: 'first-ok',
    detail: false,
    accept: /소방공무원|채용시험|시험일정|채용일정|필기시험|시험과목|출제범위|문항수|시험시간|시험방법|체력시험|가점|응시자격|원서접수|신체검사|면접시험|응급처치학|소방학|시행계획|변경공고|정정공고/i,
    urls: [
      'https://www.nfsa.go.kr/nfsa/'
    ]
  },
  {
    id: 'nfsa-materials',
    label: '중앙소방학교 공식교재',
    strategy: 'first-ok',
    accept: /공통교재|소방전술[123]|구급.*(지침|기준|표준)|응급처치.*(지침|기준|표준)|공식교재/i,
    urls: [
      'https://www.nfsa.go.kr/nfsa/releaseinformation/archive/materials/'
    ],
    fallbackUrls: [
      'https://www.nfsa.go.kr/nfsa/'
    ]
  }
]

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

export const MONITOR_FETCH_POLICY=Object.freeze({
  requestTimeoutMs:9000,
  attempts:2,
  retryDelaysMs:[0,700],
  sourceGapMs:350,
  detailConcurrency:2
});

const sleep=ms=>ms>0?new Promise(resolve=>setTimeout(resolve,ms)):Promise.resolve();
function monitorError(code,message,cause){
  const err=new Error(message||code);
  err.code=code;
  if(cause)err.cause=cause;
  return err;
}
function fetchErrorCode(err){
  return String(err?.code||err?.cause?.code||err?.name||'FETCH_ERROR').slice(0,80);
}
function fetchErrorDetail(err){
  const parts=[fetchErrorCode(err),err?.message,err?.cause?.message].filter(Boolean);
  return [...new Set(parts.map(String))].join(': ').slice(0,180);
}
function retryableFetchError(err){
  const value=(fetchErrorCode(err)+' '+String(err?.message||'')).toUpperCase();
  return /FETCH|ABORT|TIMEOUT|ECONN|EAI_|ENET|EHOST|UND_|HTTP_(408|425|429|500|502|503|504)/.test(value);
}
function looksLikeWafChallenge(text){
  return /방문자\s*확인|자바스크립트.*활성|javascript.*(?:enable|required)|checking your browser|verify you are human|captcha|challenge-platform|cf-chl/i.test(String(text||''));
}
function normalizedFetchPolicy(options={}){
  return {
    requestTimeoutMs:Number(options.requestTimeoutMs)||MONITOR_FETCH_POLICY.requestTimeoutMs,
    attempts:Math.max(1,Number(options.attempts)||MONITOR_FETCH_POLICY.attempts),
    retryDelaysMs:Array.isArray(options.retryDelaysMs)?options.retryDelaysMs:MONITOR_FETCH_POLICY.retryDelaysMs,
    sourceGapMs:Number.isFinite(Number(options.sourceGapMs))?Math.max(0,Number(options.sourceGapMs)):MONITOR_FETCH_POLICY.sourceGapMs,
    detailConcurrency:Math.max(1,Number(options.detailConcurrency)||MONITOR_FETCH_POLICY.detailConcurrency)
  };
}

async function fetchText(url, fetchImpl, options={}) {
  if (!isOfficialUrl(url)) throw monitorError('NON_OFFICIAL_SOURCE');
  const policy=normalizedFetchPolicy(options);
  let lastError=null;
  for(let attempt=1;attempt<=policy.attempts;attempt++){
    const delay=Number(policy.retryDelaysMs[Math.min(attempt-1,policy.retryDelaysMs.length-1)]||0);
    if(delay>0)await sleep(delay);
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),policy.requestTimeoutMs);
    try{
      const res=await fetchImpl(url,{
        redirect:'follow',
        signal:ctrl.signal,
        headers:{
          'user-agent':'119-study-official-monitor/3.0',
          accept:'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language':'ko-KR,ko;q=0.9,en;q=0.7',
          'cache-control':'no-cache',
          pragma:'no-cache'
        }
      });
      const body=await res.text();
      if(looksLikeWafChallenge(body))throw monitorError('WAF_CHALLENGE','OFFICIAL_SITE_WAF_CHALLENGE');
      if(!res.ok)throw monitorError('HTTP_'+res.status,'HTTP_'+res.status);
      return body;
    }catch(err){
      lastError=err?.code?err:monitorError(fetchErrorCode(err),fetchErrorDetail(err),err);
      lastError.attempt=attempt;
      lastError.url=url;
      if(attempt>=policy.attempts||!retryableFetchError(lastError))break;
    }finally{
      clearTimeout(timer);
    }
  }
  throw lastError||monitorError('FETCH_ERROR','OFFICIAL_SOURCE_FETCH_FAILED');
}

export async function enrichOfficialRow(row, fetchImpl = fetch, options={}) {
  if(row?.detailEligible===false||!row?.reviewRequired||!isOfficialUrl(row.url))return row;
  const shouldCheck=row.targetYearMatch===true||row.explicitYear==null;
  if(!shouldCheck)return row;
  try{
    const html=await fetchText(row.url,fetchImpl,options);
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

async function collectSource(source,fetchImpl,options={}){
  const policy=normalizedFetchPolicy(options);
  const items=[];
  let okCount=0,lastError='',lastErrorCode='',lastErrorUrl='',fallbackUsed=false;
  const groups=[
    {urls:source.urls||[],fallback:false},
    {urls:source.fallbackUrls||[],fallback:true}
  ];
  for(const group of groups){
    if(group.fallback&&okCount>0)break;
    const blockedOrigins=new Set();
    for(const url of group.urls){
      let origin='';
      try{origin=new URL(url).origin}catch{}
      if(origin&&blockedOrigins.has(origin))continue;
      try{
        const html=await fetchText(url,fetchImpl,policy);
        const parsed=parseNoticeList(html,{sourceId:source.id,sourceLabel:source.label,baseUrl:url});
        const accepted=(source.accept?parsed.filter(row=>source.accept.test(row.title)):parsed)
          .map(row=>({...row,detailEligible:source.detail!==false}));
        items.push(...accepted);
        okCount++;
        if(group.fallback)fallbackUsed=true;
        if(source.strategy==='first-ok')break;
      }catch(err){
        lastError=fetchErrorDetail(err);
        lastErrorCode=fetchErrorCode(err);
        lastErrorUrl=url;
        if(origin&&(retryableFetchError(err)||fetchErrorCode(err)==='WAF_CHALLENGE'))blockedOrigins.add(origin);
      }
      if(policy.sourceGapMs>0)await sleep(policy.sourceGapMs);
    }
    if(source.strategy==='first-ok'&&okCount>0)break;
  }
  return{
    items,
    status:{
      id:source.id,label:source.label,ok:okCount>0,pagesOk:okCount,
      status:okCount>0?'ok':'error',
      error:okCount>0?'':lastError||'SOURCE_UNAVAILABLE',
      errorCode:okCount>0?'':lastErrorCode||'SOURCE_UNAVAILABLE',
      errorUrl:okCount>0?'':lastErrorUrl,
      fallbackUsed
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

export async function collectOfficialNotices(fetchImpl = fetch, now = new Date(), options={}) {
  const policy=normalizedFetchPolicy(options);
  const sourceResults=[];
  for(const source of SOURCES){
    sourceResults.push(await collectSource(source,fetchImpl,policy));
    if(policy.sourceGapMs>0)await sleep(policy.sourceGapMs);
  }
  const items=sourceResults.flatMap(x=>x.items);
  const sourceStatus=sourceResults.map(x=>x.status);

  const unique = new Map();
  for (const row of items) {
    const key = (row.title + '|' + row.publishedAt).toLowerCase();
    const prev = unique.get(key);
    if (!prev || (!prev.targetYearMatch && row.targetYearMatch)) unique.set(key, row);
  }

  const uniqueRows=[...unique.values()];
  const enriched=await mapLimit(uniqueRows,policy.detailConcurrency,row=>enrichOfficialRow(row,fetchImpl,policy));

  const sorted = enriched
    .filter(x => x.meaningful)
    .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')) || a.title.localeCompare(b.title, 'ko'));

  const successCount = sourceStatus.filter(x => x.ok).length;

  return {
    version: '119-official-monitor-snapshot-v1',
    generatedAt: now.toISOString(),
    targetExamYear: TARGET_YEAR,
    baselineYear: BASELINE_YEAR,
    officialOnly: true,
    policy: {
      sources: ['국가공무원 채용시스템(소방청)', '중앙소방학교'],
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
      sequentialSourceFetch:true,
      maxConcurrentSourceGroups:1,
      detailConcurrency:policy.detailConcurrency,
      requestTimeoutMs:policy.requestTimeoutMs,
      requestAttempts:policy.attempts,
      deterministicBackoffMs:policy.retryDelaysMs,
      officialHostFailover:true,
      wafChallengeDetection:true,
      wafBypassForbidden:true,
      machineFriendlyRecruitmentSource:'https://gongmuwon.gosi.kr/spcsv/indexMain3.do',
      requiredSourceCount:SOURCES.length,
      snapshotBranch: 'chore/official-monitor-snapshot'
    },
    healthy: sourceStatus.length === SOURCES.length && successCount === SOURCES.length,
    hasRelevantItems: sorted.length > 0,
    sourceStatus,
    items: sorted.slice(0, 120)
  };
}
