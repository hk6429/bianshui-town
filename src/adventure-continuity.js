import {ADVENTURE_CONTENT} from './adventure-content.js';
import {evidenceLines} from './learning.js';

export const CONTINUITY_RESIDENTS=[
 {name:'林安',role:'安置居民（教學虛構）'},
 {name:'周禾',role:'糧倉管事（教學虛構）'},
 {name:'許木',role:'修樓工匠（教學虛構）'}
];
const branches={
 'aid-repair':{title:'陪同之後，下一批如何接應？',clue:'上一輪集中物資安置，再陪同晚到居民辨認位置；下一批的接應輪班尚未另外安排。本輪請找出能接續照顧不同居民的方法。',prompt:'若原先認為「把眼前居民安頓好就完成先憂後樂」，現在會如何修正？選一段原文，說明下一批居民的需要，以及原文不能直接決定的資源安排。',evidence:[0,6]},
 'aid-reserve':{title:'輪班已排定，眼前仍有人迷路',clue:'上一輪集中物資安置，再排定下一批的接應輪班；已到居民仍不知道安置位置。本輪需同時看見已有保障與尚未回應的需要。',prompt:'若原先認為「安排未來就等於照顧所有人」，現在會如何修正？選一段原文，說明如何回應已到居民，並保留下一批的接應。',evidence:[5,6]},
 'time-repair':{title:'圖卡補發後，用品如何備妥？',clue:'上一輪分批安置與修繕，再補發安置圖卡；下一批的引導用品尚未另外安排。本輪請思考分批施工與接續照顧的關係。',prompt:'若原先認為「分批施工且補發圖卡就已周全」，現在會如何修正？選一段原文，說明誰仍需照顧，以及治理情境與文章原句的界線。',evidence:[0,5]},
 'time-reserve':{title:'用品備妥，晚到居民仍待引導',clue:'上一輪分批安置與修繕，再備妥下一批的安置圖卡與用品；已晚到的居民仍不知道安置位置。本輪請重新檢查誰獲得保障、誰仍需協助。',prompt:'若原先認為「物資備齊就代表大家都受照顧」，現在會如何修正？選一段原文，說明如何補足引導，以及不能僅憑選擇判定品德的原因。',evidence:[0,6]}
};
function previous(s){
 if(!Number.isInteger(s?.round)||s.round<1||!Array.isArray(s.history))return null;
 const h=s.history.filter(h=>Number.isInteger(h.round)&&h.round<s.round).sort((a,b)=>b.round-a.round)[0];
 return h&&['aid','time'].includes(h.choiceId)&&['repair','reserve'].includes(h.followup?.choiceId)?h:null;
}
const branchOf=h=>`${h.choiceId}-${h.followup.choiceId}`;
const options=branch=>branches[branch].evidence.map(index=>({id:`evidence-${index}`,text:evidenceLines('yueyang')[index].text}));
export function continuityView(t,id){
 if(id!=='yueyang')return null;
 const s=t.journey?.adventure?.quests?.[id],h=previous(s);if(!h)return null;
 const branchId=branchOf(h),branch=branches[branchId],c=ADVENTURE_CONTENT.yueyang;
 const primary=c.choices.find(choice=>choice.id===h.choiceId);
 const followup=h.followup.choiceId==='repair'?c.followupNeeds[h.choiceId==='aid'?1:2]:c.followupProtection[h.choiceId==='aid'?1:2];
 const memory=[
  `我記得第${h.round+1}輪的「${primary.label}」。${primary.consequence}`,
  `那輪接著選了「${followup}」，剩餘時間與援助已投入。${h.followup.choiceId==='repair'?'下一批的接應保障尚未另外安排。':'晚到居民不知道安置位置的需要仍待處理。'}`,
  `我記得${h.choiceId==='aid'?'物資集中用於安置，修樓隊保留協調時間':'分批安置與修繕，協調時間用滿'}；接著完成「${followup}」。這些是教學情境，原文沒有記載我們三人的遭遇。`
 ];
 return {residents:CONTINUITY_RESIDENTS.map((r,i)=>({...r,memory:memory[i]})),branchId,title:branch.title,clue:branch.clue,prompt:`${branch.prompt} 理由保留供人工討論，不自動評理解分數。`,evidenceOptions:options(branchId),record:s.reflection?structuredClone(s.reflection):null};
}
export function validateContinuityReflection(value,s,id){
 const fail=()=>{throw Error('journey.adventure: 跨輪修正紀錄或前輪來源無效');};
 const keys=['round','branchId','evidenceId','reason'];
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)))fail();
 const h=id==='yueyang'?previous(s):null;
 if(!h||value.round!==s.round||value.branchId!==branchOf(h)||!options(branchOf(h)).some(e=>e.id===value.evidenceId)||typeof value.reason!=='string'||!value.reason.trim()||value.reason.length>600)fail();
 return value;
}
export function recordContinuity(t,id,input){
 const view=continuityView(t,id);if(!view||!input)return false;
 const s=t.journey.adventure.quests[id],value={round:s.round,branchId:view.branchId,evidenceId:input.evidenceId,reason:input.reason};
 try{validateContinuityReflection(value,s,id);}catch{return false;}
 s.reflection={...value,reason:value.reason.trim()};return true;
}
