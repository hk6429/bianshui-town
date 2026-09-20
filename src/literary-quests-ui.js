import {guideHTML,guideClick} from './learning-guide.js';
import {createLearningUI} from './learning-ui.js';
import {journalPrompt,journalIllustration,journalSaved} from './literary-journal.js';
import {activityHTML} from './literary-activity-ui.js';
import {activityState,currentActivity,activityCheck,activityAction,activitiesDone} from './literary-activities.js';
import {LITERARY_QUESTS,LANDMARK_QUEST,questEntry,requirements,saveQuestNote,unlockQuest} from './literary-quests.js';
import {escapeHTML as esc} from './content-html.js';
export function installLiteraryQuestsUI({getTown,change,build}){
 const dialog=document.createElement('dialog');dialog.id='literary-quests';dialog.setAttribute('aria-labelledby','literary-title');document.body.append(dialog);
 let current='yueyang',left=null,practice=null,draftTown=getTown();
 let drafts={};
 const learning=createLearningUI({getTown,change,rerender:message=>render(message)});
 dialog.addEventListener('input',learning.input);
 dialog.addEventListener('change',learning.changed);
 dialog.addEventListener('close',learning.stop);
 const activityTown=()=>practice||getTown();
 function render(message=''){
  const t=getTown(),q=LITERARY_QUESTS[current],e=questEntry(t,current),step=q.steps[e.step],unlocked=e.step>q.steps.length;
  const scroll=dialog.scrollTop;
  dialog.innerHTML=`<header><h2 id="literary-title">宋韻文學營造</h2><button data-close aria-label="關閉宋韻任務">關閉</button></header><nav aria-label="文學任務">${Object.entries(LITERARY_QUESTS).map(([id,v])=>`<button data-quest="${id}" aria-pressed="${id===current}">${esc(v.name)} · ${Math.min(questEntry(t,id).step,v.steps.length)}/${v.steps.length}</button>`).join('')}</nav><h3>${esc(q.name)}｜${esc(q.title)}</h3><p>${esc(q.author)}</p>${guideHTML(t,current)}<p role="status" id="literary-status">${esc(message)}</p><p class="literary-history">${esc(q.note)} <a href="${q.source}" target="_blank" rel="noopener noreferrer">來源 ↗</a></p><p>營造前置：${requirements(t,current).map(r=>`${r.ok?'✓':'○'} ${r.name}`).join('、')}。圖樣解鎖後仍需四格空地與建造費。經營模式須先鋪路；自由營造自動接路。${current==='yueyang'?'岳陽樓須臨東側河岸，或緊鄰已落成池塘／四格文學水景。':''}${['lotus','redcliff','creek'].includes(current)?'水面包含在四格內，屬文學意象景觀，不是連接汴河的航道。':''}</p>${step?learning.reading(current,e.step):`<p>${unlocked?'圖樣已解鎖，可進入四格營造。舊版已解鎖圖樣保留，可補玩新增場景操作。':'閱讀挑戰已完成。完成下方場景操作與上述城鎮前置後，即可領取圖樣。'}</p><button data-unlock ${unlocked?'hidden':''} ${activitiesDone(t,current)?'':'disabled'}>檢查前置並領取圖樣</button><button data-build ${unlocked?'':'hidden'}>營造${esc(q.name)}</button>`}${!step?learning.reading(current,e.step):''}${activityHTML(activityTown(),current,left,!!practice)}<details><summary>已完成的閱讀紀錄</summary>${q.steps.slice(0,Math.min(e.step,q.steps.length)).map(s=>`<h4>${esc(s.title)}</h4><blockquote>${esc(s.text)}</blockquote><p>${esc(s.result)}</p>`).join('')||'<p>尚未完成閱讀挑戰。</p>'}</details>${journalIllustration(current)}<h4>${esc(journalPrompt(current)[0])}</h4><p>${esc(journalPrompt(current)[1])}</p><label for="literary-note">我的理由與短箋（選填，最多400字；不以自動評分鎖住進度）</label><textarea id="literary-note" maxlength="400" rows="3">${esc(drafts[current]??e.note)}</textarea><button data-note>儲存短箋</button><span id="note-draft-status">${drafts[current]!==undefined&&drafts[current]!==e.note?'有尚未儲存的短箋；切換任務仍保留，重新整理前請儲存。':''}</span>${journalSaved(current,e.note)}${learning.extra(current)}<p>十條文學任務可依興趣選擇。各篇提供節錄與來源；城鎮前置不需其他任務地標，避免互相卡住。</p>`;
   dialog.scrollTop=scroll;
 }
 dialog.addEventListener('input',event=>{if(event.target.id==='literary-note'){drafts[current]=event.target.value;dialog.querySelector('#note-draft-status').textContent='尚未儲存；切換任務仍保留，重新整理前請儲存。';}});
 const open=(id)=>{if(id&&Object.hasOwn(LITERARY_QUESTS,id)){current=id;left=null;practice=null;}if(draftTown!==getTown()){draftTown=getTown();drafts={};practice=null;}render();if(!dialog.open)dialog.showModal();};
 document.querySelector('#literary-quests-btn').onclick=()=>open();
 dialog.addEventListener('click',event=>{
  if(guideClick(event,dialog)||learning.click(event))return;
  const b=event.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-close'))return dialog.close();
  if(b.dataset.quest){current=b.dataset.quest;left=null;practice=null;render();return;}
  if(b.hasAttribute('data-activity-replay')){practice={journey:{literary:{[current]:{step:4,note:'',activity:{stage:0,selection:[],visited:[]}}}}};left=null;render('練習不會清除原有紀錄或重複領獎。');return;}
  if(b.hasAttribute('data-practice-exit')){practice=null;left=null;render();return;}
  if(b.dataset.pairLeft){left=b.dataset.pairLeft;render();return;}
  const actions=[['activityPick','pick'],['activityVisit','visit'],['activityMove','move'],['pairRight','pair']];
  const field=actions.find(([key])=>b.dataset[key]!==undefined);
  if(field||b.hasAttribute('data-activity-submit')||b.hasAttribute('data-activity-clear')){
   const action=field?.[1]||(b.hasAttribute('data-activity-submit')?'submit':'clear');let value=field?b.dataset[field[0]]:undefined;
   if(action==='pair'){if(!left){dialog.querySelector('#literary-status').textContent='先選左欄要配對的文字。';return;}value=`${left}=${value}`;}
   if(action==='move')value=Number(value);
   const task=currentActivity(activityTown(),current),check=action==='submit'?activityCheck(task,activityState(activityTown(),current)):null;
   if(check&&!check.ok){dialog.querySelector('#literary-status').textContent=check.message+' 不扣錢，可重試。';return;}
   const ok=practice?activityAction(practice,current,action,value):change(t=>activityAction(t,current,action,value));
   if(ok)left=null;render(ok?(check?.message||'操作進度已記錄。'):'操作未完成：請確認相鄰路格、物資餘額或存檔通知。');return;
  }
  if(b.hasAttribute('data-unlock')){const ok=change(t=>unlockQuest(t,current));render(ok?'圖樣已儲存並解鎖。':'尚缺營造前置，或存檔未成功；完成後可再試。');}
  else if(b.hasAttribute('data-note')){const note=dialog.querySelector('#literary-note').value,ok=change(t=>saveQuestNote(t,current,note));if(ok){delete drafts[current];dialog.querySelector('#note-draft-status').textContent='';}render(ok?'短箋已儲存。':'內容未變更或存檔未成功。');}
  else if(b.hasAttribute('data-build')){dialog.close();build(Object.keys(LANDMARK_QUEST).find(id=>LANDMARK_QUEST[id]===current));}
 });
 return {open};
}
