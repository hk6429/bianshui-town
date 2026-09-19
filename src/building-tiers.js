export const MAX_TIER=5;
export const tierOf=b=>Math.max(1,Math.min(MAX_TIER,Number.isInteger(b.tier)?b.tier:1));
export const TIER_NAMES=['初築','添彩','華庭','重簷','盛景'];
export const TIER_DETAILS=['保留原有建築樣式','增加用途專屬設施','擴充工序或庭院','形成特色附屬建築','完成各類建築的專屬地標'];

// All gameplay tier values live here; legacy level/footprint still determine the base.
export const BUILDING_UPKEEP={home:300,shop:600,work:900,garden:450};
export const TIER_RULES=Object.freeze(Array.from({length:5},(_,i)=>Object.freeze({
 homeExtra:i,largeHomeExtra:i*2,production:1+i*.25,shopJobs:2+i,
 saleSeconds:12-i*2,retail:4+i*2,largeRetail:12+i*4,serviceFactor:i+1,serviceRange:24+i*4,
 gardenStrength:8+i*2,upkeepFactor:i+1,upgradeFactor:(i+2)/2
})));
export const tierRule=b=>TIER_RULES[tierOf(b)-1];
export function buildingStats(b){
 const r=tierRule(b),large=!!b.footprint;
 return {
  housing:b.type==='home'?(large?8+r.largeHomeExtra:(b.level>=2?4:2)+r.homeExtra):0,
  jobs:b.type==='work'?(large?6:4):b.type==='shop'?r.shopJobs:0,
  production:b.type==='work'?(large?2:b.level>=2?1.5:1)*r.production:0,
  saleSeconds:r.saleSeconds,
  retail:b.type==='shop'?(large?r.largeRetail:r.retail):0,
  water:(large?48:12)*r.serviceFactor,cleaning:(large?48:12)*r.serviceFactor,
  patrol:(large?32:8)*r.serviceFactor,education:8*r.serviceFactor,
  carePerWorker:(large?8:4)*r.serviceFactor,range:r.serviceRange,garden:r.gardenStrength,
  upkeep:BUILDING_UPKEEP[b.type]*(large?4:1)*r.upkeepFactor
 };
}
export function upgradePreview(b){return tierOf(b)<MAX_TIER?{...b,tier:tierOf(b)+1,level:['home','work'].includes(b.type)?2:b.level}:null;}
export function buildingAbility(b){
 const s=buildingStats(b);
 if(b.type==='home')return `住宅容量 ${s.housing} 人`;
 if(b.type==='work')return `工匠 ${s.jobs} 席，滿員加工 ${s.production} 倍`;
 if(b.type==='shop')return `過賣名額 ${s.jobs} 席，每過賣每 ${s.saleSeconds} 秒售一件${b.design==='herbShop'?`，每過賣照護 ${s.carePerWorker} 人／${s.range} 步`:''}`;
 if(b.design==='well')return `供水 ${s.water} 人／${s.range} 步`;
 if(b.design==='cleaningYard')return `每日清運 ${s.cleaning} 份／${s.range} 步`;
 if(b.design==='firePost')return `巡守 ${s.patrol} 處／${s.range} 步`;
 if(b.design==='academy')return `教育 ${s.education} 席／${s.range} 步，園景基礎 ${s.garden} 點`;
 return `園景基礎 ${s.garden} 點／${s.range} 步`;
}
