import {recallTask} from './learning-recall.js';
import {LITERARY_QUESTS,answerQuest} from './literary-quests.js';
import {LEARNING_CONTENT,READING_LEVELS} from './learning-content.js';
export const DAY=86400000;
const levels=Object.keys(READING_LEVELS),ids=Object.keys(LITERARY_QUESTS);
export const newLearning=()=>({version:1,level:'guided',zhuyin:false,quests:{}});
export const newLearningQuest=()=>({firstLearnedAt:0,attempts:[],hints:[0,0,0],revisions:[],reviews:[],prediction:null});
export const learningState=t=>t.journey?.learning||newLearning();
export const learningQuest=(t,id)=>learningState(t).quests[id]||newLearningQuest();
export function evidenceLines(id){return LITERARY_QUESTS[id].steps.flatMap((s,step)=>s.text.split('\n').filter(Boolean).map(text=>({step,text})));}
const ensure=(t,id)=>{t.journey.learning??=newLearning();if(id)t.journey.learning.quests[id]??=newLearningQuest();return id?t.journey.learning.quests[id]:t.journey.learning;};
const orderedAt=(s,at)=>Math.max(at,...[s.attempts?.at(-1),s.revisions?.at(-1),s.reviews?.at(-1),s.prediction].filter(Boolean).map(r=>r.at));
const timestamp=at=>Number.isSafeInteger(at)&&at>=0;
export function setReadingSupport(t,level,zhuyin){if(!levels.includes(level)||typeof zhuyin!=='boolean')return false;const old=learningState(t);if(old.level===level&&old.zhuyin===zhuyin)return false;Object.assign(ensure(t),{level,zhuyin});return true;}
export function useLearningHint(t,id,step){if(!ids.includes(id)||!Number.isInteger(step)||step<0||step>2||learningQuest(t,id).hints[step]>=3)return false;ensure(t,id).hints[step]++;return true;}
export function recordLearningAnswer(t,id,{step,answer,evidence,reason,at=Date.now()}){
 const q=LITERARY_QUESTS[id],entry=t.journey?.literary?.[id];if(!q||!q.steps[step]||(entry?.step||0)!==step||!Number.isInteger(answer)||answer<0||answer>=q.steps[step].choices.length||!Number.isInteger(evidence)||!evidenceLines(id)[evidence]||typeof reason!=='string'||!reason.trim()||reason.length>400||!timestamp(at))return false;
 const state=ensure(t,id);at=orderedAt(state,at);const correct=answer===q.steps[step].answer,evidenceMatch=evidenceLines(id)[evidence].step===step;
 state.attempts.push({step,answer,evidence,reason:reason.trim(),correct,evidenceMatch,hints:state.hints[step],level:learningState(t).level,at});state.attempts=state.attempts.slice(-90);
 // The reason is preserved for human review. A matching excerpt is not a quality score.
 if(correct&&evidenceMatch){state.firstLearnedAt ||=state.attempts.find(a=>a.correct&&a.evidenceMatch)?.at||at;answerQuest(t,id,step,answer);}
 return true;
}
export function saveLearningRevision(t,id,{text,feedback='',changes='',at=Date.now()}){
 if(!ids.includes(id)||![text,feedback,changes].every(v=>typeof v==='string'&&v.length<=400)||!text.trim()||!timestamp(at))return false;
 const old=learningQuest(t,id).revisions.at(-1);if(old&&old.text===text.trim()&&old.feedback===feedback.trim()&&old.changes===changes.trim())return false;
 if(old&&(!feedback.trim()||!changes.trim()))return false;
 const state=ensure(t,id);at=orderedAt(state,at);state.revisions.push({text:text.trim(),feedback:feedback.trim(),changes:changes.trim(),at});state.revisions=state.revisions.slice(-12);return true;
}
export function recordPrediction(t,id,{choice,reason,observation='',at=Date.now()}){
 if(id!=='yueyang'||!['care','tower'].includes(choice)||![reason,observation].every(x=>typeof x==='string'&&x.length<=400)||!reason.trim()||!timestamp(at))return false;
 const state=ensure(t,id);at=orderedAt(state,at);const old=state.prediction;
 if(old){if(!observation.trim()||old.observation===observation.trim())return false;state.prediction={...old,observation:observation.trim()};}
 else state.prediction={choice,reason:reason.trim(),observation:observation.trim(),at};return true;
}
export function reviewDue(t,id,now=Date.now()){
 const s=learningQuest(t,id),last=s.reviews.at(-1),first=s.attempts.find(a=>a.correct&&a.evidenceMatch);
 const anchor=s.firstLearnedAt||first?.at;if(!anchor)return false;return now>=Math.max(last?.at||0,anchor)+DAY;
}
export function recordTransfer(t,id,{variant,answer,reason,kind='transfer',at=Date.now()}){
 const task=kind==='recall'?recallTask(id,variant):kind==='transfer'?LEARNING_CONTENT[id]?.transfer[variant]:null,s=learningQuest(t,id);if(!task||!Number.isInteger(variant)||!Number.isInteger(answer)||answer<0||answer>=task.choices.length||typeof reason!=='string'||!reason.trim()||reason.length>400||!timestamp(at))return false;
 at=orderedAt(s,at);const due=reviewDue(t,id,at);ensure(t,id).reviews=[...s.reviews,{kind,variant,answer,reason:reason.trim(),correct:answer===task.answer,delayed:due,at}].slice(-12);return true;
}
export function learningSummary(t,id){
 const s=learningQuest(t,id),passed=s.attempts.filter(a=>a.correct&&a.evidenceMatch),independent=passed.filter(a=>!a.hints),latest=s.reviews.filter(r=>!r.kind||r.kind==='transfer').at(-1);
 return {submitted:new Set(passed.map(a=>a.step)).size,independentEvidence:new Set(independent.map(a=>a.step)).size,hintUses:s.hints.reduce((a,b)=>a+b,0),attempts:s.attempts.length,needsReview:passed.length>0||s.revisions.length>0,revisionCount:s.revisions.length,transferChoiceCorrect:latest?.correct??null,transferReasonNeedsReview:!!latest};
}
// Strict bounded schema used by city imports, cloud saves and teacher record imports.
export function validateLearning(value,path='journey.learning'){
 const fail=message=>{throw Error(`${path}: ${message}`);};
 const object=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k))||keys.some(k=>!Object.hasOwn(v,k)))fail('欄位不完整或有未知欄位');};
 const text=v=>{if(typeof v!=='string'||v.length>400)fail('文字超過400字或格式錯誤');};
 const integer=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max;
 const list=(v,max)=>{if(!Array.isArray(v)||v.length>max)fail('紀錄數量超過上限');};
 object(value,['version','level','zhuyin','quests']);if(value.version!==1||!levels.includes(value.level)||typeof value.zhuyin!=='boolean')fail('閱讀支援格式錯誤');
 if(!value.quests||typeof value.quests!=='object'||Array.isArray(value.quests)||Object.keys(value.quests).some(id=>!ids.includes(id)))fail('未知關卡');
 for(const [id,s]of Object.entries(value.quests)){
  object(s,['attempts','hints','revisions','reviews','prediction',...(Object.hasOwn(s,'firstLearnedAt')?['firstLearnedAt']:[])]);if(Object.hasOwn(s,'firstLearnedAt')&&!timestamp(s.firstLearnedAt))fail('學習起始時間錯誤');list(s.attempts,90);list(s.revisions,12);list(s.reviews,12);list(s.hints,3);if(s.hints.length!==3||s.hints.some(h=>!integer(h,3)))fail('提示層級錯誤');
  for(const a of s.attempts){object(a,['step','answer','evidence','reason','correct','evidenceMatch','hints','level','at']);const q=LITERARY_QUESTS[id].steps[a.step],line=evidenceLines(id)[a.evidence];text(a.reason);if(!integer(a.step,2)||!integer(a.answer,2)||!integer(a.evidence,99)||!q||!line||!a.reason.trim()||!integer(a.hints,3)||a.hints>s.hints[a.step]||!levels.includes(a.level)||!timestamp(a.at)||a.correct!==(q.answer===a.answer)||a.evidenceMatch!==(line.step===a.step))fail('作答與原文或提示紀錄不一致');}
  for(const r of s.revisions){object(r,['text','feedback','changes','at']);[r.text,r.feedback,r.changes].forEach(text);if(!r.text.trim()||!timestamp(r.at))fail('作品版本無效');}
  for(const r of s.reviews){object(r,['variant','answer','reason','correct','delayed','at',...(Object.hasOwn(r,'kind')?['kind']:[])]);text(r.reason);const q=r.kind==='recall'?recallTask(id,r.variant):!r.kind||r.kind==='transfer'?LEARNING_CONTENT[id].transfer[r.variant]:null;if(!integer(r.variant,1)||!integer(r.answer,2)||!q||!r.reason.trim()||r.correct!==(q.answer===r.answer)||typeof r.delayed!=='boolean'||!timestamp(r.at))fail('遷移紀錄無效');}
  for(let i=0;i<s.reviews.length;i++){const r=s.reviews[i],first=s.firstLearnedAt?{at:s.firstLearnedAt}:s.attempts.find(a=>a.correct&&a.evidenceMatch),prev=s.reviews[i-1];if(r.delayed&&(!first||r.at<first.at+DAY||prev&&r.at<prev.at+DAY))fail('隔次複習時間不足');if(prev&&first&&r.delayed!==(r.at>=Math.max(prev.at,first.at)+DAY))fail('複習時間標記不一致');}
  for(const rows of [s.attempts,s.revisions,s.reviews])if(rows.some((r,i)=>i&&r.at<rows[i-1].at))fail('紀錄時間順序錯誤');
  if(s.prediction!==null){const p=s.prediction;object(p,['choice','reason','observation','at']);[p.reason,p.observation].forEach(text);if(id!=='yueyang'||!['care','tower'].includes(p.choice)||!p.reason.trim()||!timestamp(p.at))fail('預測紀錄錯誤');}
 }
 return value;
}
