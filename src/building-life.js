import {townName} from './place-identity.js';
import {commissionSolution} from './commissions.js';
import {DESIGNS,gardenActivity} from './heritage.js';
import {managed} from './city-finance.js';
import {presentWorkers} from './employment.js';
import {waterReport} from './water-service.js';
import {fireCoverage} from './fire-service.js';
import {sanitationReport} from './sanitation.js';
import {educationReport} from './education.js';
import {escapeHTML as esc} from './content-html.js';
export function residentBuildingAction(b,p,h){
 if(b?.type==='garden')return gardenActivity(b);
 if(b?.type==='home')return h>=21||h<6?'安睡中':h>=8&&h<18?'在院裡整理花草':'在家歇息';
 if(b?.type==='shop')return p.work===b.id?'招呼客人':'喝茶、採買';
 return ['燒製陶器','打磨木器','整理織物'][b?.variant||0];
}
export function upgradeUse(t,b){
 if(!t.journey?.enabled||!managed(t))return {allowed:true,text:'自由升級：使用條件僅在城市經營＋引導挑戰同時開啟時適用。'};
 let value=0,condition='至少一位居民正在園中停留';
 if(b.type==='home'){value=t.people.filter(p=>p.home===b.id).length;condition='至少一位居民已入住';}
 else if(b.type==='work'||b.type==='shop'){value=presentWorkers(t,b).length;condition='至少一位可工作的店員或工匠實際到場';}
 else if(b.design==='well'){value=waterReport(t).wells.find(w=>w.id===b.id)?.used||0;condition='實際供水給至少一位住戶';}
 else if(b.design==='firePost'){value=fireCoverage(t).posts.find(w=>w.id===b.id)?.used||0;condition='實際巡守覆蓋至少一處建築';}
 else if(b.design==='cleaningYard'){value=sanitationReport(t).sites.filter(s=>s.residents>0&&s.reachable.includes(b.id)).length;condition='清運範圍沿路涵蓋至少一處有人居住的住宅';}
 else if(b.design==='academy'){value=educationReport(t).academies.find(w=>w.id===b.id)?.learners||0;condition='目前為至少一位住戶提供街坊教育';}
 else value=t.people.filter(p=>!p.outside&&p.current===b.id).length;
 return {allowed:value>0&&!b.fireDamage,text:`升級使用條件：${condition}（目前 ${value}）${b.fireDamage?'；請先修復建築':''}。`};
}
export function blueprintLife(id){
 const d=DESIGNS[id],b={...d,id:-1,design:id},activity=residentBuildingAction(b,{work:null},12);
 const utility={well:'提供沿路住宅供水；不安排居民進井內停留。',cleaningYard:'沿路收集住宅與作坊廢棄物；每日結算清運。',firePost:'沿路巡守周邊建物，降低火災風險。'}[id];
 const behavior=utility||(id==='academy'?`${activity}；城市經營時，沿路住戶可持續累積學力，服務涵蓋不等於本人到場。`:d.type==='home'?`${activity}；早晚歇息，夜間安睡。`:d.type==='work'?`${activity}；須有工匠到場及配方原料，才能生產。`:d.type==='shop'?`${activity}；店員到場會招呼客人，商品交易仍須有庫存。`:`${activity}；居民會在午間或傍晚選擇可達場所，不保證每次選中。`);
 return {activity:utility?'公共服務':activity,behavior,commission:commissionSolution(b)==='tea'?'可解「茶坊小聚」：住處六格內、沿路可達且落成。':commissionSolution(b)==='garden'?'可解「園中歇腳」：住處六格內、沿路可達且落成。':'目前沒有對應的居民委託。'};
}
export const blueprintLifeHTML=id=>{const p=blueprintLife(id);return `<dl class="life-preview"><dt>活動</dt><dd>${esc(p.activity)}</dd><dt>居民行為</dt><dd>${esc(p.behavior)}</dd><dt>相關委託</dt><dd>${esc(p.commission)}</dd></dl>`;};
export function useSnapshot(t,ids=null){
 const buildings=t.buildings.filter(b=>!ids||ids.includes(b.id)),people=t.people.filter(p=>!p.outside&&buildings.some(b=>b.id===p.current)),counts=new Map();for(const p of people)counts.set(p.action||'停留中',(counts.get(p.action||'停留中')||0)+1);
 return {buildings:buildings.length,users:people.length,activities:[...counts].sort((a,b)=>b[1]-a[1]).slice(0,32).map(([name,count])=>({name,count}))};
}
const structure=t=>JSON.stringify(t.buildings.map(b=>[b.id,b.x,b.z,b.type,b.design,b.tier,b.footprint]));
export function recordConstruction(before,after){if(structure(before)===structure(after))return false;const old=new Map(before.buildings.map(b=>[b.id,b])),changed=after.buildings.filter(b=>!old.has(b.id)||structure({buildings:[old.get(b.id)]})!==structure({buildings:[b]}));const targets=[...new Set([...changed.map(b=>b.id),...before.buildings.filter(b=>!after.buildings.some(a=>a.id===b.id)).map(b=>b.id)])];after.journey.construction={targets,at:after.elapsed,label:changed.slice(0,4).map(b=>b.name).join('、')||'拆除建築',before:useSnapshot(before,targets)};return true;}
export function constructionHTML(t){
 const c=t.journey.construction;if(!c)return `<p>${esc(townName(t))} · 完成一次新建、搬移、擴建、升級或拆除後，這裡會留下最近一次營造的對照。</p>`;
 const now=useSnapshot(t,c.targets),describe=s=>s.activities.length?s.activities.map(a=>`${esc(a.name)} ${a.count}人`).join('、'):'此刻尚無居民到場使用';
 return `<p>${esc(townName(t))} · 最近營造：${esc(c.label)}；距今 ${Math.max(0,Math.floor(t.elapsed-c.at))} 遊戲秒。</p><table><caption>本次變動建物的快照對照</caption><tr><th>指標</th><th>營造前</th><th>目前</th></tr><tr><th>建築園景</th><td>${c.before.buildings}</td><td>${now.buildings}</td></tr><tr><th>在建物內居民</th><td>${c.before.users}</td><td>${now.users}</td></tr><tr><th>實際活動（最多32類）</th><td>${describe(c.before)}</td><td>${describe(now)}</td></tr></table><p>這是本次變動建物在兩個時間點的觀察，可能同時受時段、天候、道路及其他事件影響，不能全部歸因於這次營造；此刻無人在場不代表過去從未使用。</p>`;
}
