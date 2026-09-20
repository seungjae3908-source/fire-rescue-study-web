'use strict';
(()=>{const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const D={
'flashover-flow':['국부화재','고온 연기층','복사열 증가','열분해 확대','구획실 동시발화'],
'rollover-flow':['열분해가스','상층 축적','공기 혼합','천장부 화염 전파'],
'flameover-flow':['초기화재','대류 발달','불꽃 확대','벽면 화염 이동','천장 방향 면이동'],
'backdraft-flow':['산소 부족','미연소가스 축적','개구부 형성','공기 유입','폭발적 연소'],
'tank-overflow-compare':['보일오버: 하부 수분층+열파','슬롭오버: 표면에 물/포 유입','프로스오버: 고온 점성유체+물'],
'bleve-flow':['용기 가열','압력 상승','용기 약화·파열','급기화','점화 시 파이어볼'],
'pool-fire':['액체 누출','고임','증기 발생','점화','액면 연소'],
'sprinkler-system':['수원','가압송수장치','배관·밸브','헤드','방수·경보'],
'sprinkler-wet':['헤드 감열','헤드 개방','즉시 방수','압력·유수 변화','펌프·경보'],
'sprinkler-dry':['헤드 개방','공기 배출','건식밸브 개방','충수','방수'],
'sprinkler-preaction':['감지기 작동','밸브 개방','2차측 충수','헤드 개방','방수'],
'sprinkler-deluge':['감지기 작동','일제개방밸브','배관 급수','개방형 헤드 동시방수'],
'sprinkler-head':['화재열','감열부 작동','오리피스 개방','디플렉터','분산방수']
};
V.Visual119={data:D,layouts:{},render:id=>{const a=D[id]||[],layout=V.Visual119?.layouts?.[id]||'flow';if(!a.length)return'';if(layout==='vertical-org')return `<div class="concept-visual visual-org"><div class="visual-title">조직 관계</div><div class="visual-flow vertical-org">${a.map((x,i)=>`<div class="visual-node org-node"><b>${x}</b></div>${i<a.length-1?'<i class="org-arrow">↓</i>':''}`).join('')}</div></div>`;return `<div class="concept-visual"><div class="visual-title">원리 도식</div><div class="visual-flow">${a.map((x,i)=>`<div class="visual-node"><span>${i+1}</span><b>${x}</b></div>${i<a.length-1?'<i>→</i>':''}`).join('')}</div></div>`}};
})();