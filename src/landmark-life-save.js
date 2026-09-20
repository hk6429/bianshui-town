import {LANDMARK_TEXT,LANDMARK_LIFE} from './landmark-life-data.js';
const designs=Object.keys(LANDMARK_LIFE);
const bad=p=>{throw new Error(`存檔 ${p}：地標活動紀錄無效`);};
const integer=(v,min=0,max=1e12)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const number=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1e12;
const ids=v=>Array.isArray(v)&&v.length<=1144&&v.every(id=>integer(id,1,Number.MAX_SAFE_INTEGER-1000))&&new Set(v).size===v.length;
function fields(v,keys,p){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k))||keys.some(k=>!Object.hasOwn(v,k)))bad(p);}
function mapping(v,check,p){if(!v||typeof v!=='object'||Array.isArray(v))bad(p);for(const [k,x]of Object.entries(v))if(!designs.includes(k)||!check(x,k))bad(`${p}.${k}`);}
export function landmarkReflectionsSchema(v,p){mapping(v,x=>x===true,p);}
export function landmarkConnectionsSchema(v,p){mapping(v,(x,k)=>{fields(x,['other','quote','otherQuote','note'],p);return designs.includes(x.other)&&x.other!==k&&x.quote===LANDMARK_TEXT[k][1]&&x.otherQuote===LANDMARK_TEXT[x.other][1]&&typeof x.note==='string'&&x.note.trim()===x.note&&x.note.length>=20&&x.note.length<=400;},p);}
export function landmarkLifeSchema(s,p='journey.landmarks'){
 fields(s,['sequence','active','visits','history','benefitDay','beneficiaries'],p);
 if(!integer(s.sequence)||!integer(s.benefitDay,-1)||!ids(s.beneficiaries))bad(p);
 mapping(s.visits,v=>{fields(v,['count','lastAt','days','served'],p);return integer(v.count,1,1000000)&&number(v.lastAt)&&Array.isArray(v.days)&&v.days.length>=1&&v.days.length<=Math.min(8,v.count)&&v.days.every(x=>integer(x))&&new Set(v.days).size===v.days.length&&integer(v.served,0,Math.min(1000000,v.count*4));},p);
 if(s.active!==null){const e=s.active;fields(e,['id','building','design','phase','at','deadline','until','participants','attendees'],p);
  if(!integer(e.id,1,s.sequence)||!integer(e.building,1,Number.MAX_SAFE_INTEGER-1000)||!designs.includes(e.design)||!['scheduled','gathering','active'].includes(e.phase)||![e.at,e.deadline,e.until].every(number)||!ids(e.participants)||e.participants.length>4||!ids(e.attendees)||e.attendees.some(id=>!e.participants.includes(id)))bad(p);
  if(e.phase==='scheduled'&&(e.participants.length||e.attendees.length)||e.phase==='active'&&!e.attendees.length)bad(p);
 }
 if(!Array.isArray(s.history)||s.history.length>30)bad(p);
 const seen=new Set();for(const h of s.history){fields(h,['id','design','building','at','success','participants','summary'],p);
  if(!integer(h.id,1,s.sequence)||seen.has(h.id)||h.id===s.active?.id||!integer(h.building,1,Number.MAX_SAFE_INTEGER-1000)||!designs.includes(h.design)||!number(h.at)||typeof h.success!=='boolean'||!ids(h.participants)||h.participants.length>4||typeof h.summary!=='string'||h.summary.length>400||h.success!==!!h.participants.length)bad(p);seen.add(h.id);
 }
}
export function validateLandmarkChronology(d){
 const s=d.journey?.landmarks;
 for(const design of Object.keys(d.journey?.landmarkReflections||{}))if(d.journey.literary?.[LANDMARK_LIFE[design].quest]?.activity?.stage!==3)bad('journey.landmarkReflections');
 if(!s){if(Object.keys(d.journey?.landmarkConnections||{}).length)bad('journey.landmarkConnections');return;}
 const day=Math.floor(d.time/24);if(s.benefitDay>day||s.history.some(h=>h.at>d.elapsed)||Object.values(s.visits).some(v=>v.lastAt>d.elapsed||v.days.some(day=>day>Math.floor(d.time/24))))bad('journey.landmarks');
 for(const [design,other]of Object.entries(d.journey?.landmarkConnections||{}))if(!s.visits[design]?.count||!s.visits[other.other]?.count||[design,other.other].some(k=>{const q=d.journey.literary?.[LANDMARK_LIFE[k].quest];return q?.step!==4||q?.activity?.stage!==3;}))bad('journey.landmarkConnections');
}
