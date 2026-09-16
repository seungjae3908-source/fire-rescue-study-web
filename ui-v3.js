const NAV_V3_ITEMS = [
  ['home','⌂','홈'],['study','▣','학습'],['tutor','AI','과외'],['notes','▤','노트'],['bank','?','문제'],
  ['exam','⏱','시험'],['wrong','!','오답'],['stats','▥','통계'],['resources','◎','자료'],['settings','⚙','설정']
];

nav = function () {
  return `<nav class="nav" aria-label="주요 메뉴">${NAV_V3_ITEMS.map(([p, icon, label]) =>
    `<button type="button" data-nav="${p}" aria-label="${label}" ${state.page === p ? 'aria-current="page"' : ''} class="${state.page === p ? 'active' : ''}"><span class="nav-icon" aria-hidden="true">${icon}</span><span class="nav-label">${label}</span></button>`
  ).join('')}</nav>`;
};

function syncDeviceClass() {
  const w = window.innerWidth;
  const device = w < 700 ? 'phone' : w < 1200 ? 'tablet' : 'desktop';
  document.documentElement.dataset.device = device;
}
syncDeviceClass();
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(syncDeviceClass, 120);
}, { passive: true });

window.addEventListener('keydown', (e) => {
  if (!e.altKey || e.ctrlKey || e.metaKey) return;
  const target = e.target;
  if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
  const map = {'1':'home','2':'study','3':'tutor','4':'notes','5':'bank','6':'exam','7':'wrong','8':'stats','9':'resources','0':'settings'};
  const page = map[e.key];
  if (!page || typeof go !== 'function') return;
  e.preventDefault();
  go(page);
});

document.addEventListener('click', (e) => {
  const navButton = e.target.closest?.('[data-nav]');
  if (!navButton) return;
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
});
