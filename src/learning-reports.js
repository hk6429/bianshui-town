import {validateLearning,learningState,learningSummary} from './learning.js';
import {LITERARY_QUESTS} from './literary-quests.js';
const MAX=750000;
const own=(x,k)=>Object.hasOwn(x,k);
const exact=(v,fields)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!fields.includes(k))||fields.some(k=>!own(v,k)))throw Error('紀錄欄位不完整或含未知資料');};
const label=v=>typeof v==='string'&&v.trim().length>0&&v.length<=48&&!/[\u0000-\u001f\u007f]/.test(v);
const stamp=v=>Number.isSafeInteger(v)&&v>=0;
export function validateReport(r){
 exact(r,['format','student','exportedAt','learning']);if(r.format!=='bianshui-learning-v1'||!stamp(r.exportedAt))throw Error('不支援的學習紀錄版本');exact(r.student,['id','name']);if(!label(r.student.name)||typeof r.student.id!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(r.student.id))throw Error('學習代號或稱呼無效');validateLearning(r.learning);
 for(const q of Object.values(r.learning.quests))for(const row of [...q.attempts,...q.reviews,...q.revisions,...(q.prediction?[q.prediction]:[])])if(row.at>r.exportedAt)throw Error('紀錄晚於匯出時間');return r;
}
export function parseReport(text){if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX)throw Error('學習紀錄超過750 KB');return validateReport(JSON.parse(text));}
export function createReport(t,student,at=Date.now()){const learning=structuredClone(learningState(t));const latest=Math.max(at,...Object.values(learning.quests).flatMap(q=>[q.firstLearnedAt||0,...q.attempts.map(r=>r.at),...q.reviews.map(r=>r.at),...q.revisions.map(r=>r.at),q.prediction?.at||0]));return validateReport({format:'bianshui-learning-v1',student,exportedAt:latest,learning});}
export function mergeReports(current,incoming){const next=new Map(current.map(r=>[r.student.id,r]));for(const r of incoming){validateReport(r);const old=next.get(r.student.id);if(!old||r.exportedAt>old.exportedAt)next.set(r.student.id,r);}if(next.size>40)throw Error('本機看板一次最多40位學生，請另存班級紀錄後再整理');return [...next.values()];}
export function reportSummary(r,quest){return learningSummary({journey:{learning:r.learning}},quest);}
export function commonDifficulties(reports,quest){const counts=[0,0,0];for(const r of reports){const rows=r.learning.quests[quest]?.attempts||[];for(let i=0;i<3;i++)if(rows.some(a=>a.step===i&&(!a.correct||!a.evidenceMatch||a.hints>0)))counts[i]++;}return counts.map((count,i)=>({step:i,title:LITERARY_QUESTS[quest].steps[i].title,students:count}));}
export const REVIEW_JUDGEMENTS={discuss:'需要一起討論',supported:'提示後能說明',independent:'能獨立解釋',transfer:'能換情境應用'};
export function createFeedback(report,quest,revisionAt,teacher,comment,judgement,at=Date.now()){
 validateReport(report);const revision=report.learning.quests[quest]?.revisions.find(r=>r.at===revisionAt);if(!revision)throw Error('請選擇有提交作品的版本');const f={format:'bianshui-feedback-v1',studentId:report.student.id,quest,revisionAt,sourceText:revision.text,teacher,comment,judgement,at};return validateFeedback(f);
}
export function validateFeedback(f){exact(f,['format','studentId','quest','revisionAt','sourceText','teacher','comment','judgement','at']);if(f.format!=='bianshui-feedback-v1'||typeof f.studentId!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(f.studentId)||!own(LITERARY_QUESTS,f.quest)||!stamp(f.revisionAt)||!stamp(f.at)||f.at<f.revisionAt||!label(f.teacher)||!own(REVIEW_JUDGEMENTS,f.judgement))throw Error('回饋格式錯誤');for(const key of ['sourceText','comment'])if(typeof f[key]!=='string'||!f[key].trim()||f[key].length>400)throw Error('回饋文字需1–400字');return f;}
export function feedbackMatches(f,studentId,t){validateFeedback(f);return f.studentId===studentId&&!!learningState(t).quests[f.quest]?.revisions.some(r=>r.at===f.revisionAt&&r.text===f.sourceText);}
export const FEEDBACK_KEY='bianshui-learning-feedback-v1';
export function readStoredFeedback(storage,t,studentId,quest){try{const data=JSON.parse(storage.getItem(FEEDBACK_KEY)||'[]');if(!Array.isArray(data)||data.length>30)return null;return data.filter(f=>{try{return (!quest||f.quest===quest)&&feedbackMatches(f,studentId,t);}catch{return false;}}).sort((a,b)=>b.at-a.at)[0]||null;}catch{return null;}}
export function storeFeedback(storage,f){validateFeedback(f);let old=[];try{const parsed=JSON.parse(storage.getItem(FEEDBACK_KEY)||'[]');if(Array.isArray(parsed))old=parsed.filter(x=>{try{validateFeedback(x);return true;}catch{return false;}});}catch{}const next=old.filter(x=>!(x.studentId===f.studentId&&x.quest===f.quest&&x.revisionAt===f.revisionAt));next.push(f);storage.setItem(FEEDBACK_KEY,JSON.stringify(next.slice(-30)));}
