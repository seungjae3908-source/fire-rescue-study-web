'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
// Runs after app.js. The app handler saves profile values first; this listener then stamps the record for conflict-safe cloud merge.
document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b)return;if('profileSave' in b.dataset){const p=V.Store?.state?.profile;if(p){p.updatedAt=Date.now();V.Store.save()}}});
V.SyncUI={profileConflictClock:true};
})();
