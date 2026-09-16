import {designFor} from './heritage.js';
import {roadReachable} from './road-network.js';
import {escapeHTML as esc} from './content-html.js';
export const SOLUTIONS={tea:'茶坊小聚',garden:'園中歇腳'};
const gardenDesigns=new Set(['garden','scholarGarden','pavilion','pond','orchard']);
export const commissionRecord=(t,id)=>(t.journey.commissions||[]).find(c=>c.resident===id);
export function commissionVenue(t,id,solution){
 const p=t.people.find(p=>p.id===id),home=t.buildings.find(b=>b.id===p?.home);
 if(!home)return null;
 return t.buildings.find(b=>b.stage>=3&&!b.fireDamage&&Math.hypot(b.x-home.x,b.z-home.z)<=6&&roadReachable(t,home.entrance,b.entrance)&&(solution==='tea'?designFor(b)==='tea':solution==='garden'&&b.type==='garden'&&(!b.design||gardenDesigns.has(b.design))))||null;
}
export function respondCommission(t,id,action,solution){
 const p=t.people.find(p=>p.id===id),old=commissionRecord(t,id);
 if(!t.journey.enabled||old?.state==='completed')return false;
 if(action==='accept'){
  if(!p||!Object.hasOwn(SOLUTIONS,solution))return false;
  if(old?.state==='active'&&old.solution===solution)return false;
 }else if(action==='decline'){if(!p||old?.state==='declined'||old?.state==='active')return false;}
 else if(action==='withdraw'){if(old?.state!=='active')return false;}
 else if(action==='complete'){
  if(old?.state!=='active')return false;
  const b=commissionVenue(t,id,old.solution);if(!b)return false;
  Object.assign(old,{state:'completed',venue:b.name,building:b.id,completedAt:t.elapsed});return true;
 }else return false;
 if(!old&&(t.journey.commissions||[]).length>=64)return false;
 const record=old||{resident:id,name:p.name||`居民${id}`,state:'declined',solution:null};
 record.state=action==='accept'?'active':action==='withdraw'?'withdrawn':'declined';record.solution=action==='accept'?solution:null;
 if(!old)(t.journey.commissions??=[]).push(record);return true;
}
export function commissionReply(t,id){
 const c=commissionRecord(t,id);if(!c)return '想找一處離家近、沿路可達的茶坊或園景，與街坊歇腳聊天。';
 if(c.state==='completed')return `謝謝你！我們選了「${SOLUTIONS[c.solution]}」，在${c.venue}有了相聚的地方。`;
 if(c.state==='declined')return '沒關係，等你方便再接取，不扣分，也沒有期限。';
 if(c.state==='withdrawn')return '先放下也無妨，已有建設與收藏都保留，隨時可以重新接取。';
 if(!t.people.some(p=>p.id===id))return '這位居民已離鎮，委託暫停；可放下，沒有懲罰。';
 return commissionVenue(t,id,c.solution)?`「${SOLUTIONS[c.solution]}」已符合條件，可以回覆居民完成。`:`正在等候「${SOLUTIONS[c.solution]}」：住處六格內、道路可達且已落成的場所。`;
}
export function commissionCards(t,focus){
 const records=t.journey.commissions||[],ids=[...new Set([...(focus?[focus]:[]),...records.map(c=>c.resident),...t.people.slice(0,8).map(p=>p.id)])];
 if(!ids.length)return '<p>居民入住後，就會出現具名委託。</p>';
 return ids.map(id=>{
  const c=commissionRecord(t,id),p=t.people.find(p=>p.id===id),state=c?.state||'offered',enabled=t.journey.enabled&&!!p&&(!!c||records.length<64),done=state==='completed';
  return `<article><h4>${esc(p?.name||c?.name)} · 街坊歇腳處</h4><p>${esc(commissionReply(t,id))}</p>${done?`<p>已採解法：${esc(SOLUTIONS[c.solution])} · ${esc(c.venue)}</p>`:`<p>兩案擇一：茶坊供街坊喝茶小聚；園景供散步歇腳。皆須距住處六格內、道路相通且落成；既有場所也可使用，不要求消費或等天候。</p>${Object.entries(SOLUTIONS).map(([key,label])=>`<button data-commission="accept" data-resident-id="${id}" data-solution="${key}" ${!enabled?'disabled':''} aria-pressed="${c?.solution===key}">${state==='active'?'改採':'接取'}${label}</button>`).join('')}${state==='active'?`<button data-commission="complete" data-resident-id="${id}" ${!enabled||!commissionVenue(t,id,c.solution)?'disabled':''}>回覆居民完成</button><button data-commission="withdraw" data-resident-id="${id}" ${!t.journey.enabled?'disabled':''}>先放下委託</button>`:`<button data-commission="decline" data-resident-id="${id}" ${!enabled||state==='declined'?'disabled':''}>婉拒</button>`}`}</article>`;
 }).join('');
}
