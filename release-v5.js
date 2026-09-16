const RELEASE_VERSION='5.0.0';
const RELEASE_LABEL='공식근거·학습지도·문제품질 v5';
const _settingsBeforeRelease=settings;
settings=function(){return _settingsBeforeRelease().replace(`구급 합격AI v${APP_VERSION}`,`구급 합격AI v${RELEASE_VERSION}`).replace('PWA · Local-first · 무료 AI only',`PWA · Local-first · 무료 AI only · ${RELEASE_LABEL}`);};
