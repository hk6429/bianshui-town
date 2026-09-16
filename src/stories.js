import {key,point,pathfind} from './simulation.js';
import {STORY_TYPES,STORY_BRANCHES,storyBranch} from './story-data.js';
export {STORY_TYPES} from './story-data.js';
export const storyVenues=t=>t.buildings.filter(b=>(b.type==='shop'||b.design==='wazi')&&b.stage>=3);
export const storyDay=t=>t.time%24>=8&&t.time%24<19&&!t.weather.raining;
export const createStories=()=>({nextAt:24,sequence:0,completed:0,active:null});
export function remember(t,p,text){
 const day=Math.floor(t.time/24);if(p.diaryDay!==day){p.diary=[];p.diaryDay=day;}p.diary??=[];
 if(p.diary[0]?.text!==text){p.diary.unshift({time:t.time,text});p.diary=p.diary.slice(0,12);}
}
function routeToSlot(t,p,slot){
 const origin=p.outside?[p.x,p.z]:t.building(p.current)?.entrance||t.building(p.home)?.entrance;
 if(!origin)return false;const route=pathfind(t.roads,t.nearestRoad(...origin),key(...slot));if(!route.length)return false;
 [p.x,p.z]=origin;p.route=route;p.current=null;p.destination=null;p.outside=true;p.eventSlot=[...slot];return true;
}
export function rerouteStories(t){
 const e=t.stories.active;if(!e)return;
 for(const id of e.participants){const p=t.people.find(p=>p.id===id);if(p?.eventSlot)routeToSlot(t,p,p.eventSlot);}
}
const arrivedPeople=(t,e)=>e.participants.map(id=>t.people.find(p=>p.id===id)).filter(p=>p?.eventSlot&&Math.hypot(p.x-p.eventSlot[0],p.z-p.eventSlot[1])<.1);
function recordAttendees(t,e){
 e.attendees??=[];for(const p of arrivedPeople(t,e))if(!e.attendees.some(a=>a.id===p.id))e.attendees.push({id:p.id,name:p.name||'街坊'});
}
function finish(t){
 const e=t.stories.active;if(!e)return;
 if(e.phase==='active')recordAttendees(t,e);
 for(const id of e.participants){const p=t.people.find(p=>p.id===id);if(!p)continue;p.streetEvent=null;p.eventSlot=null;p.route=[];p.outside=true;p.destination=null;p.chatCooldown=t.elapsed+25;remember(t,p,e.phase==='active'?'街頭相聚散場，繼續今日行程':'街坊散去，繼續今日行程');}
 if(e.phase==='active'){t.stories.completed++;t.log(e.end);}else t.log(`${e.title}暫歇，街坊回到各自行程`);
 const happened=e.phase==='active';
 t.stories.history??=[];t.stories.history.unshift({id:e.id,type:e.type,title:e.title,venue:e.venue,center:[...e.center],at:t.elapsed,happened,branch:e.branch||null,reason:e.branch?STORY_BRANCHES[e.branch].reason:'依活動輪次安排本次相聚。',summary:happened?e.activity:'集合未完成，活動取消。',participants:happened?(e.attendees||[]):[]});t.stories.history=t.stories.history.slice(0,24);
 t.stories.last={id:e.id,title:e.title,venue:e.venue,center:[...e.center]};
 t.stories.active=null;t.stories.nextAt=t.elapsed+35;
}
export function tickStories(t){
 const s=t.stories,day=storyDay(t);
 if(s.active){
  const e=s.active;if(e.phase==='active')recordAttendees(t,e);if(!day){finish(t);return;}
  const arrived=e.participants.filter(id=>{const p=t.people.find(p=>p.id===id);return p&&Math.hypot(p.x-p.eventSlot[0],p.z-p.eventSlot[1])<.1;});
  if(e.phase==='gathering'&&(arrived.length===e.participants.length||t.elapsed>=e.deadline)){
   if(!arrived.length){finish(t);return;}e.phase='active';recordAttendees(t,e);e.until=t.elapsed+(e.branch==='stage'?28:e.branch==='street'?12:18);t.log(`${e.title}，街坊停步相聚`);
  }
  if(e.phase==='active'&&t.elapsed>=e.until){finish(t);return;}
  return;
 }
 if(!day||t.elapsed<s.nextAt||t.people.length<3)return;
 const shops=storyVenues(t);if(!shops.length)return;
 const spec=STORY_TYPES[s.sequence%STORY_TYPES.length];
 const regular=shops.filter(b=>b.type==='shop'),pool=regular.length?regular:shops;const shop=(spec.type==='story'?shops.find(b=>b.design==='wazi'):null)||(spec.type==='tea'?regular.find(b=>b.variant===0):null)||pool[s.sequence%pool.length];
 const center=shop.entrance;
 // Distinct, connected roadside positions make gathering visible without stacking people.
 const slots=[...t.roads].map(point).filter(([x,z])=>Math.abs(x-center[0])+Math.abs(z-center[1])<=4).sort((a,b)=>Math.hypot(a[0]-center[0],a[1]-center[1])-Math.hypot(b[0]-center[0],b[1]-center[1]));
 const candidates=t.people.filter(p=>!p.streetEvent&&!(p.socialUntil>t.elapsed)).sort((a,b)=>Math.hypot(a.x-center[0],a.z-center[1])-Math.hypot(b.x-center[0],b.z-center[1]));
 const branch=storyBranch(spec.type,shop),branchData=branch?{title:STORY_BRANCHES[branch].title,activity:STORY_BRANCHES[branch].activity}:{};
 const e={...spec,...branchData,branch,attendees:[],id:++s.sequence,center:[...center],venue:shop.name,phase:'gathering',deadline:t.elapsed+30,participants:[]};
 for(const p of candidates){const slot=slots[e.participants.length+1];if(!slot||e.participants.length>=4)break;if(!routeToSlot(t,p,slot))continue;p.streetEvent=e.id;p.socialUntil=0;p.action=spec.gather;e.participants.push(p.id);remember(t,p,p.action);}
 if(e.participants.length){s.active=e;t.log(`${e.title}：${shop.name}前傳來招呼聲`);}else s.nextAt=t.elapsed+35;
}
export function eventAction(t,p){
 const e=t.stories.active;if(!e||p.streetEvent!==e.id)return false;
 p.outside=true;p.action=p.route.length?e.gather:e.phase==='active'?e.activity:'已到街口，等街坊聚齊';
 if(!p.route.length)p.angle=Math.atan2(e.center[0]-p.x,e.center[1]-p.z);
 return true;
}
