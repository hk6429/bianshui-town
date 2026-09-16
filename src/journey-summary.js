import {WORKS} from './reading-collection-data.js';
import {VISIONS,visionConditions,milestones} from './journey.js';
import {escapeHTML as esc} from './content-html.js';
export function sessionBaseline(t){return {claimed:new Set(t.journey.claimed),read:new Set((t.journey.reading?.entries||[]).map(e=>e.work)),commissions:new Set((t.journey.commissions||[]).filter(c=>c.state==='completed').map(c=>c.resident))};}
export function sessionSummary(t,baseline){
 const stamps=new Map(milestones(t).map(m=>[m.id,m.name]));
 return {stamps:[...new Set(t.journey.claimed)].filter(id=>!baseline.claimed.has(id)).map(id=>({id,title:stamps.get(id)})),read:[...new Set((t.journey.reading?.entries||[]).map(e=>e.work))].filter(id=>!baseline.read.has(id)).map(id=>({id,title:WORKS[id].title})),commissions:[...new Map((t.journey.commissions||[]).filter(c=>c.state==='completed'&&!baseline.commissions.has(c.resident)).map(c=>[c.resident,{id:c.resident,title:`${c.name} · ${c.venue}`}])).values()],vision:VISIONS[t.journey.vision],achieved:visionConditions(t).every(c=>c.done)};
}
export function sessionSummaryHTML(t,baseline){
 const r=sessionSummary(t,baseline),list=(title,items)=>`<h4>${title} · ${items.length}</h4>${items.length?`<ul>${items.map(i=>`<li>${esc(i.title)}</li>`).join('')}</ul>`:'<p>本次尚無新增紀錄。</p>'}`;
 return `<p>統計本次開啟遊戲後新增的紀錄，各項只列一次。重新整理、重置或讀取另一存檔會開始新的回顧；既有收藏仍保留在存檔內。</p>${list('新獲紀念章',r.stamps)}${list('首次讀訪作品',r.read)}${list('新完成委託',r.commissions)}<p>${esc(r.vision)}願景：${r.achieved?'已達成，可以在此歇一歇。':'尚在營造中，也能隨時休息。'}</p><button data-end-observation>結束本次觀察並暫停</button><p>保留城鎮與旅程進度；之後按「繼續時間」即可接著玩。</p>`;
}
