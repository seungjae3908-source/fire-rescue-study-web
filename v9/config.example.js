// 119 Study OS browser configuration example.
// The current Study deployment may use the shared Investment Staging Supabase only through
// study_* tables, study_memberships and owner RLS. Never point Study at Investment Production.
// Use only a browser-safe Supabase publishable key (sb_publishable_...), never a secret/service_role key.
window.AITUTOR_V9_CONFIG={
  supabaseUrl:'',
  supabasePublishableKey:'',
  enableCloudSync:false,
  officialPdfProxyBase:'',
  study119:true
};
