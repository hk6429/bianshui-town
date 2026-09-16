import {DESIGNS,designFor} from './heritage.js';
export const VISIONS={home:'安居',craft:'工藝',culture:'文風'};
export const MILESTONE_IDS=['settlement','craft','culture'];
export const createJourney=()=>({version:1,enabled:false,vision:'home',guide:{stage:0,skipped:false},observedResident:false,claimed:[],shortGoal:'observe'});
export function journeyFacts(t){
 const ready=t.buildings.filter(b=>b.stage>=3&&!b.fireDamage);
 return {homes:ready.filter(b=>b.type==='home').length,people:t.people.length,works:ready.filter(b=>b.type==='work').length,culture:ready.filter(b=>DESIGNS[designFor(b)]?.source).length,made:t.economy.lots.some(l=>l.madeAt!=null)||['ceramics','furniture','cloth'].some(g=>(t.economy.sold[g]||0)>0),written:t.literati.collected.length};
}
const condition=(text,value,target)=>({text,value,target,done:value>=target});
export function visionConditions(t,vision=t.journey.vision){
 const f=journeyFacts(t);
 if(vision==='craft')return [condition('落成作坊',f.works,1),condition('實際製成或售出一件工藝品',Number(f.made),1)];
 if(vision==='culture')return [condition('落成一處有作品來源的文化地景',f.culture,1),condition('文人實際落筆作品',f.written,1)];
 return [condition('落成民居',f.homes,1),condition('實際入住居民',f.people,4)];
}
export function milestones(t){
 const f=journeyFacts(t),specs=[{id:'settlement',name:'煙火初起',conditions:[condition('落成民居',f.homes,1),condition('實際入住居民',f.people,2)]},{id:'craft',name:'百工初成',conditions:visionConditions(t,'craft')},{id:'culture',name:'汴水文韻',conditions:visionConditions(t,'culture')}];
 return specs.map(s=>({...s,state:t.journey.claimed.includes(s.id)?'claimed':s.conditions.every(c=>c.done)?'ready':'locked'}));
}
export function claimMilestone(t,id){if(!t.journey.enabled||!milestones(t).some(m=>m.id===id&&m.state==='ready'))return false;t.journey.claimed.push(id);return true;}
export const GUIDE_STEPS=[{title:'安放第一間民居，等候落成與入住',wait:'需遊戲時間：施工約18秒，入住依城市條件決定。'},{title:'主動打開一位居民的資訊小卡',wait:'不需等候：城市清單 → 選居民；只等待不算觀察。'},{title:'增添一間作坊，等候落成',wait:'需遊戲時間：施工約18秒；已有落成作坊也符合。'},{title:'回到城鎮旅程，看建設與居民的結果',wait:'不需等候：重新開啟此面板即可回顧。'}];
export function refreshGuide(t){
 const j=t.journey;if(!j.enabled||j.guide.skipped)return false;const before=j.guide.stage,f=journeyFacts(t);
 if(j.guide.stage===0&&f.homes>0&&f.people>0)j.guide.stage=1;
 if(j.guide.stage===2&&f.works>0)j.guide.stage=3;
 return before!==j.guide.stage;
}
export function inspectResident(t,id){
 if(!t.journey.enabled||!t.people.some(p=>p.id===id))return false;
 const j=t.journey,before=JSON.stringify(j);refreshGuide(t);j.observedResident=true;if(!j.guide.skipped&&j.guide.stage===1)j.guide.stage=2;refreshGuide(t);return JSON.stringify(j)!==before;
}
export function reviewJourney(t){const changed=refreshGuide(t);if(t.journey.enabled&&!t.journey.guide.skipped&&t.journey.guide.stage===3){t.journey.guide.stage=4;return true;}return changed;}
export function setJourneyMode(t,enabled){if(t.journey.enabled===enabled)return false;t.journey.enabled=enabled;refreshGuide(t);return true;}
export function chooseVision(t,id){if(!Object.hasOwn(VISIONS,id)||t.journey.vision===id)return false;t.journey.vision=id;return true;}
export function setGuide(t,action){if(action==='skip'){t.journey.guide.skipped=true;return true;}if(action==='restart'){t.journey.guide={stage:0,skipped:false};refreshGuide(t);return true;}return false;}
export function shortGoals(t){return [{id:'observe',title:'認識一位街坊居民',action:'從城市清單打開一位居民的小卡。',wait:'已有居民時不需等待天候或遊戲時間；空城須先迎接住戶。',done:t.journey.observedResident},{id:'home',title:'完成一處民居',action:'安放民居，等工匠完成施工。',wait:'需等約18遊戲秒，不限制現實時間。',done:journeyFacts(t).homes>0}];}
// Journey actions publish only after persistence succeeds; city data stays untouched.
export function commitJourney(t,action,persist){
 const draft={...t,journey:structuredClone(t.journey)};
 if(!action(draft))return false;
 const result=persist({...t.toJSON(),journey:draft.journey});if(!result.ok)return false;
 t.journey=draft.journey;return true;
}
