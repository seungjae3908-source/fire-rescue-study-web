'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const SESSION_KEY='aitutor9:supabase-lite-session';
const safeJson=s=>{try{return s?JSON.parse(s):null}catch{return null}};
const readSession=()=>{try{return safeJson(localStorage.getItem(SESSION_KEY))}catch{return null}};
const writeSession=s=>{try{s?localStorage.setItem(SESSION_KEY,JSON.stringify(s)):localStorage.removeItem(SESSION_KEY)}catch{}};
const decodeJwt=token=>{try{const p=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(decodeURIComponent(escape(atob(p))))}catch{return{}}};
function createClient(url,key){
  url=String(url||'').replace(/\/$/,'');let session=readSession(),refreshing=null;const listeners=new Set();
  const headers=(token=session?.access_token)=>({'apikey':key,'Authorization':`Bearer ${token||key}`,'Content-Type':'application/json'});
  const errObj=async r=>{let d=null;try{d=await r.json()}catch{}const e=new Error(d?.msg||d?.message||d?.error_description||d?.error||`HTTP ${r.status}`);e.status=r.status;e.code=d?.code||null;return e};
  const emit=(event)=>{const s=session?{...session,user:session.user||null}:null;for(const fn of listeners){try{fn(event,s)}catch(e){console.warn('auth listener failed',e)}}};
  function clearSession(event='SIGNED_OUT'){const had=!!session;session=null;writeSession(null);if(had)emit(event);return null}
  function store(raw){if(!raw?.access_token)return null;const claims=decodeJwt(raw.access_token),expiresAt=raw.expires_at?Number(raw.expires_at):claims.exp||Math.floor(Date.now()/1000)+(Number(raw.expires_in)||3600);session={access_token:raw.access_token,refresh_token:raw.refresh_token||session?.refresh_token||'',token_type:raw.token_type||'bearer',expires_at:expiresAt,user:raw.user||session?.user||null};writeSession(session);return session}
  async function refresh(){
    if(refreshing)return refreshing;
    const rt=session?.refresh_token;
    if(!rt)return clearSession();
    refreshing=(async()=>{
      const r=await fetch(url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:rt})});
      if(!r.ok)return clearSession();
      const d=await r.json();return store(d)
    })().finally(()=>refreshing=null);
    return refreshing
  }
  async function token(){
    if(!session?.access_token)return null;
    const exp=Number(session.expires_at)||decodeJwt(session.access_token).exp||0;
    if(exp&&exp*1000<Date.now()+30000){
      if(!session.refresh_token)return clearSession();
      const renewed=await refresh();if(!renewed)return null
    }
    return session?.access_token||null
  }
  async function api(path,opt={},retry=true){
    const t=await token();
    const r=await fetch(url+path,{...opt,headers:{...headers(t),...(opt.headers||{})}});
    if(r.status===401&&retry){
      if(session?.refresh_token&&await refresh())return api(path,opt,false);
      if(session)clearSession()
    }
    return r
  }
  function consumeRedirect(){try{const h=new URLSearchParams(location.hash.replace(/^#/,''));if(h.get('access_token')){store({access_token:h.get('access_token'),refresh_token:h.get('refresh_token')||'',token_type:h.get('token_type')||'bearer',expires_in:Number(h.get('expires_in'))||3600});history.replaceState(null,'',location.pathname+location.search);return true}}catch{}return false}
  consumeRedirect();
  class Query{
    constructor(table){this.table=table;this.op='select';this.cols='*';this.filters=[];this.body=null;this.options={}}
    select(cols='*'){this.op='select';this.cols=cols||'*';return this}
    eq(col,val){this.filters.push([col,'eq',val]);return this}
    in(col,vals){this.filters.push([col,'in',Array.isArray(vals)?vals:[]]);return this}
    delete(){this.op='delete';return this}
    update(values){this.op='update';this.body=values||{};return this}
    upsert(rows,options={}){this.op='upsert';this.body=rows;this.options=options||{};return this.exec()}
    maybeSingle(){this.single=true;return this.exec()}
    then(a,b){return this.exec().then(a,b)}
    async exec(){
      const qs=new URLSearchParams();if(this.op==='select')qs.set('select',this.cols);
      for(const [c,o,v] of this.filters){if(o==='eq')qs.set(c,'eq.'+String(v));else if(o==='in')qs.set(c,'in.('+v.map(x=>String(x).replace(/"/g,'')).join(',')+')')}
      if(this.options.onConflict)qs.set('on_conflict',this.options.onConflict);
      const q=qs.toString(),path='/rest/v1/'+encodeURIComponent(this.table)+(q?'?'+q:'');
      let method='GET',body,extra={};
      if(this.op==='upsert'){method='POST';body=JSON.stringify(this.body);extra.Prefer='resolution=merge-duplicates,return=minimal'}
      if(this.op==='update'){method='PATCH';body=JSON.stringify(this.body);extra.Prefer='return=minimal'}
      if(this.op==='delete'){method='DELETE';extra.Prefer='return=minimal'}
      const r=await api(path,{method,headers:extra,body});
      if(!r.ok)return{data:null,error:await errObj(r)};
      if(this.op!=='select'||r.status===204)return{data:null,error:null};
      const d=await r.json();return{data:this.single?(Array.isArray(d)?d[0]||null:d):d,error:null};
    }
  }
  const auth={
    async getUser(){
      let t=await token();if(!t)return{data:{user:null},error:null};
      let r=await api('/auth/v1/user',{method:'GET'});
      if(!r.ok){const e=await errObj(r);return{data:{user:null},error:e}}
      const user=await r.json();session={...session,user};writeSession(session);return{data:{user},error:null}
    },
    onAuthStateChange(fn){listeners.add(fn);return{data:{subscription:{unsubscribe(){listeners.delete(fn)}}}}},
    async signUp({email,password,options={}}){
      const r=await fetch(url+'/auth/v1/signup',{method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},body:JSON.stringify({email,password,data:options.data||{}})});
      if(!r.ok)return{data:null,error:await errObj(r)};const d=await r.json(),s=store(d);if(s)emit('SIGNED_IN');return{data:{user:d.user||d,session:s},error:null}
    },
    async resend({type,email}){const r=await fetch(url+'/auth/v1/resend',{method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},body:JSON.stringify({type,email})});if(!r.ok)return{data:null,error:await errObj(r)};let d=null;try{d=await r.json()}catch{}return{data:d,error:null}},
    async signInWithPassword({email,password}){const r=await fetch(url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},body:JSON.stringify({email,password})});if(!r.ok)return{data:null,error:await errObj(r)};const d=await r.json(),s=store(d);emit('SIGNED_IN');return{data:{user:d.user||s?.user||null,session:s},error:null}},
    async signOut(){const t=session?.access_token;clearSession();if(t){try{await fetch(url+'/auth/v1/logout',{method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+t,'Content-Type':'application/json'}})}catch{}}return{error:null}}
  };
  return{auth,from(table){return new Query(table)},__runtime:'same-origin-lite'};
}
V.SupabaseLite={createClient,sessionKey:SESSION_KEY,runtime:'same-origin-lite'};
})();