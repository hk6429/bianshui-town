import {ADVENTURE_CONTENT} from './adventure-content.js';
import {LITERARY_QUESTS} from './literary-quests.js';
import {evidenceLines,learningQuest} from './learning.js';
const owns=(o,k)=>Object.hasOwn(o,k);
const valid=id=>owns(ADVENTURE_CONTENT,id);
const fresh=()=>({round:0,visited:[],decision:null,followup:null,history:[],collections:[]});
const state=(t,id)=>t.journey?.adventure?.quests?.[id]||fresh();
const write=(t,id,s)=>{t.journey??={};t.journey.adventure??={version:1,quests:{}};t.journey.adventure.quests[id]=s;return true;};
const primaryResources=s=>({time:6-s.visited.length-(s.decision?(s.decision.choiceId==='aid'?1:3):0),aid:3-(s.decision?(s.decision.choiceId==='aid'?3:1):0)});
const resources=s=>{const r=primaryResources(s);return s.followup?{time:0,aid:0}:r;};
function followupView(id,s){
 if(!s.decision)return {followupNeed:'',followupChoices:[],followupStatus:''};
 const [need,timeAction,aidAction]=ADVENTURE_CONTENT[id].followupNeeds,r=primaryResources(s);
 const action=s.decision.choiceId==='aid'?timeAction:aidAction;
 const [beneficiary,timeProtection,aidProtection,guarantee]=ADVENTURE_CONTENT[id].followupProtection;
 const protection=s.decision.choiceId==='aid'?timeProtection:aidProtection;
 const choices=[{id:'repair',label:action,cost:r,consequence:`${action}完成；${need}的困難獲得回應。本輪剩餘資源已投入，${beneficiary}的${guarantee}尚未另外安排；基本保障不受影響。`},{id:'reserve',label:`${protection}，保障${beneficiary}`,cost:r,consequence:`已投入${r.time}時間、${r.aid}援助完成「${protection}」；${beneficiary}獲得${guarantee}。${need}仍待處理，基本保障不受影響，可重玩改配。`}];
 return {followupNeed:need,followupChoices:choices,followupStatus:s.followup?choices.find(c=>c.id===s.followup.choiceId).consequence:`尚待處理：${need}。`};
}
function requirements(t,id,s){const q=learningQuest(t,id),lines=evidenceLines(id);return [
 {label:'訪查三位居民的不同線索',ok:s.visited.length===3},
 {label:'完成決策（理由可口述或填寫，供人工討論）',ok:!!s.decision},
 {label:'三步作答正確並連結該步原文',ok:[0,1,2].every(step=>q.attempts.some(a=>a.step===step&&a.answer===LITERARY_QUESTS[id].steps[step].answer&&a.correct===true&&a.evidenceMatch===true&&lines[a.evidence]?.step===step)||(q.attempts.length===90&&q.firstLearnedAt>0&&(t.journey?.literary?.[id]?.step||0)>step&&q.attempts.every(a=>a.step>step)&&q.attempts.some(a=>a.correct&&a.evidenceMatch&&a.answer===LITERARY_QUESTS[id].steps[a.step]?.answer&&lines[a.evidence]?.step===a.step)))},
 {label:'保留一份學習作品',ok:q.revisions.some(r=>r.text.trim().length>0)},
 {label:'完成眼前照顧或另一群居民的保障安排',ok:!!s.followup}
 ];}
export function adventureView(t,id){if(!valid(id))return null;const c=ADVENTURE_CONTENT[id],s=state(t,id),req=requirements(t,id,s);return {...c,...structuredClone(s),resources:resources(s),...followupView(id,s),roles:c.roles.map(r=>({...r,visited:s.visited.includes(r.id)})),surprise:s.round===0?c.surprises[0]:c.surprises[s.round%2],requirements:req,claimed:s.collections.includes(c.collection),canClaim:!s.collections.length&&req.every(r=>r.ok)};}
export function visitAdventure(t,id,clueId){if(!valid(id))return false;const s=structuredClone(state(t,id));if(s.decision||s.visited.includes(clueId)||!ADVENTURE_CONTENT[id].roles.some(r=>r.id===clueId)||resources(s).time<1)return false;s.visited.push(clueId);return write(t,id,s);}
export function decideAdventure(t,id,input){if(!valid(id)||!input||typeof (input.reason??'')!=='string'||(input.reason??'').length>400)return false;const s=structuredClone(state(t,id)),choice=ADVENTURE_CONTENT[id].choices.find(c=>c.id===input.choiceId),r=resources(s);if(!choice||s.decision||s.visited.length!==3||r.time<choice.cost.time||r.aid<choice.cost.aid)return false;s.decision={choiceId:choice.id,reason:(input.reason??'').trim()};s.history=[...s.history,{round:s.round,...s.decision,followup:null}].slice(-12);return write(t,id,s);}
export function resolveAdventure(t,id,input){if(!valid(id)||!input||!['repair','reserve'].includes(input.choiceId))return false;const s=structuredClone(state(t,id));if(!s.decision||s.followup)return false;const choice=followupView(id,s).followupChoices.find(c=>c.id===input.choiceId),r=resources(s);if(r.time<choice.cost.time||r.aid<choice.cost.aid)return false;s.followup={choiceId:choice.id};s.history.at(-1).followup={...s.followup};return write(t,id,s);}
export function resetAdventure(t,id){if(!valid(id))return false;const s=structuredClone(state(t,id));if(!s.visited.length&&!s.decision||s.round>=1000000)return false;s.round++;s.visited=[];s.decision=null;s.followup=null;return write(t,id,s);}
export function claimAdventure(t,id){const v=adventureView(t,id);if(!v?.canClaim)return false;const s=structuredClone(state(t,id));s.collections=[ADVENTURE_CONTENT[id].collection];return write(t,id,s);}
export function validateAdventure(input){
 const fail=()=>{throw Error('journey.adventure: 演練紀錄格式、資源或收藏無效');};
 const obj=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!owns(v,k)))fail();};
 const int=(n,max)=>Number.isInteger(n)&&n>=0&&n<=max;
 const followup=f=>{if(f===null)return;obj(f,['choiceId']);if(!['repair','reserve'].includes(f.choiceId))fail();};
 const decision=d=>{obj(d,['choiceId','reason']);if(!['aid','time'].includes(d.choiceId)||typeof d.reason!=='string'||d.reason.length>400)fail();};
 obj(input,['version','quests']);if(input.version!==1||!input.quests||typeof input.quests!=='object'||Array.isArray(input.quests))fail();
 for(const [id,s]of Object.entries(input.quests)){
  if(!valid(id))fail();obj(s,['round','visited','decision','followup','history','collections']);
  if(!int(s.round,1000000)||!Array.isArray(s.visited)||s.visited.length>3||new Set(s.visited).size!==s.visited.length||s.visited.some(r=>!ADVENTURE_CONTENT[id].roles.some(x=>x.id===r))||!Array.isArray(s.history)||s.history.length>12||!Array.isArray(s.collections)||s.collections.length>1||s.collections.some(c=>c!==ADVENTURE_CONTENT[id].collection))fail();
  for(let i=0;i<s.history.length;i++){const h=s.history[i];obj(h,['round','choiceId','reason','followup']);followup(h.followup);decision({choiceId:h.choiceId,reason:h.reason});if(!int(h.round,s.round)||i&&h.round<=s.history[i-1].round)fail();}
  followup(s.followup);if(s.followup&&!s.decision)fail();
  if(s.decision!==null){decision(s.decision);const h=s.history.at(-1);if(s.visited.length!==3||!h||h.round!==s.round||h.choiceId!==s.decision.choiceId||h.reason!==s.decision.reason||h.followup?.choiceId!==s.followup?.choiceId)fail();}
  else if(s.history.at(-1)?.round===s.round)fail();
  if(s.collections.length&&!s.history.length)fail();
 }
 return input;
}
