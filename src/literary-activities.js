import {LITERARY_ACTIVITIES} from './literary-activity-data.js';
export {LITERARY_ACTIVITIES};
export const activityState=(t,id)=>t.journey?.literary?.[id]?.activity||{stage:0,selection:[],visited:[]};
export const activitiesDone=(t,id)=>activityState(t,id).stage===LITERARY_ACTIVITIES[id]?.length;
export function currentActivity(t,id){return Object.hasOwn(LITERARY_ACTIVITIES,id)?LITERARY_ACTIVITIES[id][activityState(t,id).stage]:null;}
function write(t,id,state){t.journey.literary??={};const entry=t.journey.literary[id]||{step:0,note:''};t.journey.literary[id]={...entry,activity:state};return true;}
export function activityAction(t,id,action,value){
 const task=currentActivity(t,id);if(!task)return false;const old=activityState(t,id),s=structuredClone(old);
 if(action==='clear'){if(!s.selection.length)return false;s.selection=[];return write(t,id,s);}
 if(action==='visit'){
  if(task.kind!=='witnesses'||!task.items.some(i=>i[0]===value)||s.visited.includes(value))return false;
  s.visited.push(value);return write(t,id,s);
 }
 if(action==='pick'){
  if(!['sequence','allocation'].includes(task.kind)||!task.items.some(i=>i[0]===value)||s.selection.includes(value))return false;
  if(task.kind==='allocation'&&task.items.filter(i=>s.selection.includes(i[0])||i[0]===value).reduce((n,i)=>n+i[2],0)>task.budget)return false;
  s.selection.push(value);return write(t,id,s);
 }
 if(action==='pair'){
  if(task.kind!=='pairs'||typeof value!=='string')return false;const [left,right]=value.split('=');
  if(!task.pairs.some(p=>p[0]===left)||!task.pairs.some(p=>p[2]===right)||s.selection.includes(value))return false;
  s.selection=s.selection.filter(v=>v.split('=')[0]!==left&&v.split('=')[1]!==right);s.selection.push(value);return write(t,id,s);
 }
 if(action==='move'){
  if(task.kind!=='route'||!Number.isInteger(value)||value<0||value>=task.width*task.height||task.blocked.includes(value))return false;
  const from=s.selection.length?Number(s.selection.at(-1)):task.start;
  const distance=Math.abs(from%task.width-value%task.width)+Math.abs(Math.floor(from/task.width)-Math.floor(value/task.width));
  if(distance!==1||s.selection.length>=40)return false;s.selection.push(String(value));return write(t,id,s);
 }
 if(action==='submit'){
  if(!activityCheck(task,s).ok)return false;
  return write(t,id,{stage:s.stage+1,selection:[],visited:[]});
 }
 return false;
}
export function activityCheck(task,state){
 if(!task)return {ok:false,message:'這條任務的操作已完成。'};const picked=state.selection;
 let ok=false,message='';
 if(task.kind==='sequence'){ok=picked.length===task.solution.length&&picked.every((id,i)=>id===task.solution[i]);message='請依原文與步驟排列全部卡片；可清空重排。';}
 if(task.kind==='allocation'){ok=task.required.every(id=>picked.includes(id))&&picked.length===task.required.length;message='先滿足安置、供糧與道路，物資不足時可清空重配。';}
 if(task.kind==='pairs'){ok=task.pairs.every(p=>picked.includes(`${p[0]}=${p[2]}`))&&picked.length===task.pairs.length;message='還有未完成或不符合原文的配對；先點左欄再點右欄，可重新配對。';}
 if(task.kind==='witnesses'){ok=task.items.every(i=>state.visited.includes(i[0]));message='請先訪查每一位角色，不能跳過證詞。';}
 if(task.kind==='route'){let after=-1;ok=task.waypoints.every(([pos])=>{const at=picked.indexOf(String(pos),after+1);after=at;return at>=0;})&&Number(picked.at(-1))===task.end;message='沿相鄰格行進，依序經過所有站點，再抵達終點。';}
 return {ok,message:ok?task.result:message};
}
// Save imports validate against the scene, not merely broad primitive types.
export function validActivityState(id,s){
 const tasks=LITERARY_ACTIVITIES[id];if(!tasks||!Number.isInteger(s.stage)||s.stage<0||s.stage>tasks.length||!Array.isArray(s.selection)||!Array.isArray(s.visited))return false;
 if(s.stage===tasks.length)return s.selection.length===0&&s.visited.length===0;
 const task=tasks[s.stage],selection=s.selection,visited=s.visited;
 if(new Set(visited).size!==visited.length)return false;
 if(task.kind!=='witnesses'&&visited.length)return false;
 if(task.kind==='witnesses')return !selection.length&&visited.every(v=>task.items.some(i=>i[0]===v));
 if(task.kind==='route'){
  if(selection.length>40)return false;let from=task.start;
  for(const raw of selection){const v=Number(raw);if(String(v)!==raw||!Number.isInteger(v)||v<0||v>=task.width*task.height||task.blocked.includes(v)||Math.abs(from%task.width-v%task.width)+Math.abs(Math.floor(from/task.width)-Math.floor(v/task.width))!==1)return false;from=v;}return true;
 }
 if(new Set(selection).size!==selection.length)return false;
 if(task.kind==='pairs')return selection.every(v=>{const parts=v.split('=');return parts.length===2&&task.pairs.some(p=>p[0]===parts[0])&&task.pairs.some(p=>p[2]===parts[1]);})&&new Set(selection.map(v=>v.split('=')[0])).size===selection.length&&new Set(selection.map(v=>v.split('=')[1])).size===selection.length;
 if(!selection.every(v=>task.items.some(i=>i[0]===v)))return false;
 return task.kind!=='allocation'||task.items.filter(i=>selection.includes(i[0])).reduce((n,i)=>n+i[2],0)<=task.budget;
}
