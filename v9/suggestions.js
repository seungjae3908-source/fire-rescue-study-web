'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const T='study_suggestions',A='study_admins';
const STATUS=['접수','수렴완료','개선중','개선완료','보류'];
const CATEGORY=['개선','건의','오류','콘텐츠','기타'];
const id=()=>crypto.randomUUID?crypto.randomUUID():'suggest-'+Date.now()+'-'+Math.random().toString(36).slice(2);
async function ready(){await V.Auth?.init?.();if(!V.Auth?.client||!V.Auth?.user)throw Error('LOGIN_REQUIRED');return{client:V.Auth.client,user:V.Auth.user}}
async function isAdmin(){
  const {client,user}=await ready(),r=await client.from(A).select('user_id').eq('user_id',user.id).maybeSingle();
  if(r.error)throw r.error;return !!r.data
}
async function list({offset=0,limit=20}={}){
  const {client}=await ready(),start=Math.max(0,Number(offset)||0),size=Math.max(1,Math.min(50,Number(limit)||20));
  const r=await client.from(T).select('*').order('created_at',{ascending:false}).range(start,start+size);if(r.error)throw r.error;
  const page=(r.data||[]).sort((a,b)=>Date.parse(b.created_at||0)-Date.parse(a.created_at||0)),hasMore=page.length>size,rows=page.slice(0,size);
  rows.hasMore=hasMore;return rows
}
async function create({category='개선',title='',body='',anonymous=true}={}){
  const {client,user}=await ready();title=String(title||'').trim();body=String(body||'').trim();
  if(title.length<2)throw Error('TITLE_REQUIRED');if(body.length<2)throw Error('BODY_REQUIRED');
  if(!CATEGORY.includes(category))category='기타';
  const row={id:id(),user_id:user.id,category,title,body,anonymous:anonymous!==false,status:'접수',admin_reply:'',created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const r=await client.from(T).insert([row]);if(r.error)throw r.error;return row
}
async function adminReply(suggestionId,{status='수렴완료',reply=''}={}){
  if(!STATUS.includes(status))throw Error('INVALID_STATUS');if(!(await isAdmin()))throw Error('ADMIN_REQUIRED');
  const {client}=await ready(),one=await client.from(T).select('*').eq('id',suggestionId).maybeSingle();if(one.error)throw one.error;if(!one.data)throw Error('SUGGESTION_NOT_FOUND');
  const patch={status,admin_reply:String(reply||'').trim(),admin_replied_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const r=await client.from(T).update(patch).eq('id',suggestionId);if(r.error)throw r.error;return{...one.data,...patch}
}
async function remove(suggestionId){
  const {client}=await ready(),r=await client.from(T).delete().eq('id',suggestionId);if(r.error)throw r.error;return true
}
V.Suggestions={STATUS,CATEGORY,isAdmin,list,create,adminReply,remove};
})();