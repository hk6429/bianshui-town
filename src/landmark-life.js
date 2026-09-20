import {roadAnchor,roadReachable} from './road-network.js';
import {LANDMARK_LIFE} from './landmark-life-data.js';
export {LANDMARK_LIFE} from './landmark-life-data.js';
export const landmarkState=t=>t.journey?.landmarks;
const initial=()=>({sequence:0,active:null,visits:{},history:[],benefitDay:-1,beneficiaries:[]});
const state=t=>(t.journey.landmarks??=initial());
const usable=b=>b&&b.stage>=3&&!b.fireDamage;
export function landmarkSupport(t,b){
 const s=LANDMARK_LIFE[b?.design];if(!s)return null;
 return t.buildings.find(a=>a.id!==b.id&&usable(a)&&(s.companion==='school'?['villageSchool','townSchool','academy','countySchool'].includes(a.design):a.design===s.companion||a.type===s.companion)&&roadReachable(t,a.entrance,b.entrance))||null;
}
export function scheduleLandmark(t,id,when='next'){
 const b=t.buildings.find(b=>b.id===id),spec=LANDMARK_LIFE[b?.design];
 if(!spec||!usable(b)||!['next','tomorrow'].includes(when)||landmarkState(t)?.active)return false;
 const h=spec.night?19:12,day=Math.floor(t.time/24),at=when==='tomorrow'?(day+1)*24+h:t.time%24<h?day*24+h:(day+1)*24+h;
 const s=state(t);s.active={id:++s.sequence,building:id,design:b.design,phase:'scheduled',at,deadline:0,until:0,participants:[],attendees:[]};return true;
}
function release(t,e){for(const id of e.participants){const p=t.people.find(p=>p.id===id);if(p?.destination===e.building&&p.outside){p.route=[];p.destination=null;}if(p){p.socialUntil=0;p.action='活動散場，繼續今日行程';}}}
function finish(t,success,reason){
 const s=state(t),e=s.active;if(!e)return;
 const spec=LANDMARK_LIFE[e.design],people=e.attendees.map(id=>t.people.find(p=>p.id===id)).filter(Boolean);
 if(success){
  const v=s.visits[e.design]??={count:0,lastAt:0,days:[],served:0};v.count=Math.min(1000000,v.count+1);v.lastAt=t.elapsed;
  const day=Math.floor(t.time/24);if(!v.days.includes(day))v.days=[...v.days,day].slice(-8);
  if(s.benefitDay!==day){s.benefitDay=day;s.beneficiaries=[];}
  for(const p of people)if(!s.beneficiaries.includes(p.id)){p.education=Math.min(100,(p.education||0)+2);s.beneficiaries.push(p.id);v.served=Math.min(1000000,v.served+1);}
 }
 s.history.unshift({id:e.id,design:e.design,building:e.building,at:t.elapsed,success,participants:success?[...e.attendees]:[],summary:reason});s.history=s.history.slice(0,30);
 release(t,e);s.active=null;t.log?.(`${spec.name}：${reason}`);
}
export function cancelLandmark(t){const s=landmarkState(t);if(!s?.active||s.active.phase!=='scheduled')return false;s.active=null;return true;}
// Called before resident movement. Invitations use the same road/travel implementation as everyday trips.
export function tickLandmarkLife(t){
 const e=landmarkState(t)?.active;if(!e)return;
 const b=t.buildings.find(b=>b.id===e.building),spec=LANDMARK_LIFE[e.design];
 if(!usable(b)||b.design!==e.design){finish(t,false,'場地已拆除或受損，本次取消');return;}
 if(e.phase==='scheduled'){
  if(t.time<e.at)return;
  e.phase='gathering';e.deadline=t.elapsed+90;
  for(const p of t.people){
   if(e.participants.length>=4)break;
   if(p.streetEvent||(p.health??100)<40||!p.home||p.socialUntil>t.elapsed)continue;
   const anchor=p.outside?roadAnchor(t,p.x,p.z):null;
   const origin=p.outside?(anchor?anchor.split(',').map(Number):null):t.building(p.current)?.entrance||t.building(p.home)?.entrance;
   if(!roadReachable(t,origin,b.entrance)||!t.travel(p,b.id))continue;p.socialUntil=t.elapsed+110;e.participants.push(p.id);
  }
  if(!e.participants.length){finish(t,false,'沒有沿路可達的居民，活動未舉行');return;}
 }
 for(const id of e.participants){const p=t.people.find(p=>p.id===id);if(p)p.socialUntil=t.elapsed+30;}
 const arrived=e.participants.filter(id=>{const p=t.people.find(p=>p.id===id);return p&&!p.outside&&p.current===b.id&&(p.health??100)>=40;});
 if(e.phase==='gathering'){
  if(arrived.length===e.participants.length||t.elapsed>=e.deadline){
   if(!arrived.length){finish(t,false,'居民未到場，活動未舉行');return;}
   e.attendees=arrived;e.phase='active';e.until=t.elapsed+18;
  }
 }else if(e.phase==='active'){
  if(!arrived.length){finish(t,false,'到場居民已離開，活動中止');return;}
  // Only residents who remain for the full activity receive a record or benefit.
  e.attendees=e.attendees.filter(id=>arrived.includes(id));
  if(!e.attendees.length){finish(t,false,'居民未全程參與，活動未完成');return;}
  if(t.elapsed>=e.until){finish(t,e.attendees.length>0,e.attendees.length?`${spec.action}；${e.attendees.length}位居民完成18秒共讀`:'居民未全程參與，活動未完成');}
 }
}
export function landmarkResidentAction(t,p){
 const e=landmarkState(t)?.active;if(!e||e.phase==='scheduled'||!e.participants.includes(p.id)||(p.health??100)<40)return false;
 const b=t.building(e.building);if(!usable(b))return false;
 if(p.destination!==b.id&&p.current!==b.id&&!t.travel(p,b.id))return false;
 p.action=p.outside?`沿路前往${LANDMARK_LIFE[e.design].name}`:e.phase==='active'?LANDMARK_LIFE[e.design].action:'已到場，等街坊集合';return true;
}
