import {activityState,currentActivity,activityCheck,LITERARY_ACTIVITIES} from './literary-activities.js';
import {escapeHTML as esc} from './content-html.js';
export function activityHTML(t,id,left=null,practice=false){
 const s=activityState(t,id),task=currentActivity(t,id),total=LITERARY_ACTIVITIES[id].length;
 if(!task)return `<section class="literary-activity"><h4>場景操作 ${total}/${total} 已完成</h4><p>操作成果已保存。${practice?'這次為練習，不重複領獎。':''}</p><button data-activity-replay>再練習這條任務</button><details><summary>我的場景紀錄</summary>${LITERARY_ACTIVITIES[id].map(a=>`<h5>${esc(a.title)}</h5><p>${esc(a.result)}</p>`).join('')}</details>${practice?'<button data-practice-exit>回到已儲存進度</button>':''}</section>`;
 const selected=s.selection;let board='';
 if(task.kind==='sequence'||task.kind==='allocation'){
  // Stable shuffled order prevents the initial layout from revealing a sequence solution.
  const items=task.items.filter((_,i)=>i%2===1).reverse().concat(task.items.filter((_,i)=>i%2===0));
  board=`<div class="activity-cards">${items.map(([key,label,cost])=>`<button data-activity-pick="${key}" ${selected.includes(key)?'disabled':''}>${esc(label)}${cost?`（${cost}份）`:''}</button>`).join('')}</div><ol>${selected.map(key=>`<li>${esc(task.items.find(i=>i[0]===key)[1])}</li>`).join('')}</ol>`;
  if(task.kind==='allocation')board+=`<p>物資 ${task.items.filter(i=>selected.includes(i[0])).reduce((n,i)=>n+i[2],0)}/${task.budget} 份；安置、供糧與修路缺一不可。</p>`;
 }else if(task.kind==='pairs'){
  board=`<p>先點左欄，再點右欄。${left?`正在配對：${esc(task.pairs.find(p=>p[0]===left)?.[1]||'')}`:''}</p><div class="activity-pairs"><div>${task.pairs.map(p=>`<button data-pair-left="${p[0]}" aria-pressed="${left===p[0]}">${esc(p[1])}</button>`).join('')}</div><div>${[...task.pairs].reverse().map(p=>`<button data-pair-right="${p[2]}">${esc(p[3])}</button>`).join('')}</div></div><ul>${selected.map(v=>{const [a,b]=v.split('=');return `<li>${esc(task.pairs.find(p=>p[0]===a)[1])} → ${esc(task.pairs.find(p=>p[2]===b)[3])}</li>`;}).join('')}</ul>`;
 }else if(task.kind==='witnesses'){
  board=task.items.map(([key,name,text])=>`<article><button data-activity-visit="${key}" ${s.visited.includes(key)?'disabled':''}>${s.visited.includes(key)?'已訪查':'拜訪'} ${esc(name)}</button>${s.visited.includes(key)?`<blockquote>${esc(text)}</blockquote>`:''}</article>`).join('');
 }else if(task.kind==='route'){
  const at=selected.length?Number(selected.at(-1)):task.start;
  board=`<p>目前第 ${at+1} 格。起點 → ${task.waypoints.map(w=>esc(w[1])).join(' → ')} → 終點</p><div class="activity-route" aria-label="點選相鄰格移動的場景地圖">${Array.from({length:task.width*task.height},(_,i)=>{const landmark=task.waypoints.find(w=>w[0]===i)?.[1],blocked=task.blocked.includes(i),name=landmark||(i===task.end?'終點':i===task.start?'起點':'通路');return `<button data-activity-move="${i}" ${blocked?'disabled':''} aria-label="第${i+1}格 ${blocked?'障礙':name}${i===at?' 目前位置':''}" class="${i===at?'at-location':selected.includes(String(i))?'visited-location':''}">${blocked?'石':i===at?'●':i+1}<small>${blocked?'不可通行':esc(name)}</small></button>`;}).join('')}</div>`;
 }
 return `<section class="literary-activity"><h4>${practice?'練習 · ':''}場景操作 ${s.stage+1}/${total}：${esc(task.title)}</h4><p>${esc(task.prompt)}</p>${board}<div class="activity-controls"><button data-activity-submit>檢查這段操作</button><button data-activity-clear ${selected.length?'':'disabled'}>清空重做</button>${practice?'<button data-practice-exit>結束練習</button>':''}</div><details><summary>操作說明</summary><p>${esc(activityCheck(task,{...s,selection:[],visited:[]}).message)}</p></details></section>`;
}
