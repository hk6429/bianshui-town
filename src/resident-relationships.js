import {escapeHTML as esc} from './content-html.js';
import {DAILY_ACTIVITIES} from './resident-relationships-data.js';
export {DAILY_ACTIVITIES} from './resident-relationships-data.js';
export function residentActivity(t,p){
 const event=t.stories.active;if(event?.phase==='active'&&event.type==='story'&&event.participants.includes(p.id)&&p.eventSlot&&Math.hypot(p.x-p.eventSlot[0],p.z-p.eventSlot[1])<.1)return 'story';
 if((p.socialUntil||0)>t.elapsed)return 'social';if(p.shelter)return 'rain';if(p.outside)return p.route.length?'travel':'street';
 const b=t.buildings.find(b=>b.id===p.current);if(!b)return 'street';
 if(b.type==='home')return t.time%24>=21||t.time%24<6?'rest':'home';
 if(b.type==='work'||b.type==='shop'&&p.work===b.id)return 'work';if(b.type==='shop')return 'shopping';
 return b.design==='academy'?'study':'garden';
}
export const residentRecord=(t,id)=>(t.journey.residents||[]).find(r=>r.resident===id);
function ensure(t,p){let r=residentRecord(t,p.id);if(r)return r;if((t.journey.residents||[]).length>=128)return null;r={resident:p.id,name:p.name||`居民${p.id}`,seen:[],watched:false,lastAction:p.action||'停留中',lastAt:t.elapsed};(t.journey.residents??=[]).push(r);return r;}
export function observeResident(t,id){const p=t.people.find(p=>p.id===id);if(!p)return false;const r=ensure(t,p);if(!r)return false;const key=residentActivity(t,p),fresh=!r.seen.includes(key),action=p.action||'停留中';if(!fresh&&r.lastAction===action&&r.name===(p.name||`居民${p.id}`))return false;if(fresh)r.seen.push(key);r.lastAction=action;r.name=p.name||`居民${p.id}`;r.lastAt=t.elapsed;return true;}
export function watchResident(t,id,enabled){
 const old=residentRecord(t,id);if(!enabled){if(!old?.watched)return false;old.watched=false;return true;}
 const p=t.people.find(p=>p.id===id);if(!p||old?.watched||(t.journey.residents||[]).filter(r=>r.watched).length>=16)return false;const r=ensure(t,p);if(!r)return false;r.watched=true;return true;
}
export function familiarity(t,id){const r=residentRecord(t,id),seen=r?.seen||[],commission=t.journey.commissions?.some(c=>c.resident===id&&c.state==='completed')||false,score=seen.length+Number(commission);return {seen,commission,score,label:score>=5?'熟識':score>=3?'相識':score>=1?'眼熟':'初見'};}
export function familiarityText(t,id){const f=familiarity(t,id);return `${f.label} · 已主動觀察 ${f.seen.length} 種日常${f.commission?'，另完成一份委託':''}。${f.seen.length?'見過：'+f.seen.map(s=>DAILY_ACTIVITIES[s]).join('、')+'。':''}同一活動不重複累積，離線不衰退。`;}
export const watchedResident=(t,id)=>residentRecord(t,id)?.watched?t.people.find(p=>p.id===id)||null:null;
export function residentWatchHTML(t){const list=(t.journey.residents||[]).filter(r=>r.watched);return list.length?list.map(r=>{const p=watchedResident(t,r.resident);return `<article><h3>${esc(p?.name||r.name)}</h3><p>${esc(familiarityText(t,r.resident))}</p><p>${p?'目前行程：'+esc(p.traffic||p.action):'已離鎮；最近已知行程：'+esc(r.lastAction)+`（記錄於第${Math.floor(r.lastAt)}遊戲秒）`}</p><button data-watch-open="${r.resident}" ${p?'':'disabled'}>查看${esc(r.name)}</button><button data-watch-follow="${r.resident}" ${p?'':'disabled'}>跟隨${esc(r.name)}</button><button data-watch-remove="${r.resident}">取消關注${esc(r.name)}</button></article>`;}).join(''):'<p>尚未關注居民。從居民資訊卡按「加入關注名冊」。</p>';}
