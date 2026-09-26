const STUDY_119_LOCAL_MIRROR=typeof location!=='undefined'&&/^(?:127\.0\.0\.1|localhost)$/.test(String(location.hostname||''));
window.AITUTOR_V9_CONFIG={
  supabaseUrl:'https://petlfbztqguuzkasfpug.supabase.co',
  supabasePublishableKey:'sb_publishable_CxNMo2idqoaYJvbm8FTX8w_hre1kQ-c',
  enableCloudSync:true,
  officialPdfProxyBase:'https://study-119-pdf-proxy.vercel.app',
  officialPdfMirrorBase:STUDY_119_LOCAL_MIRROR?(location.origin+'/official-pdf-mirror'):'https://seungjae3908-source.github.io/fire-rescue-study-web/official-pdf-mirror',
  officialPdfMirrorDocs:['fire1','fire2','ems','prevention1','prevention2','law1','law2','law3','law4','law5'],
  study119:true
};
