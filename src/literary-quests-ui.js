import {LITERARY_QUESTS,LANDMARK_QUEST,questEntry,requirements,answerQuest,saveQuestNote,unlockQuest} from './literary-quests.js';
import {escapeHTML as esc} from './content-html.js';
export function installLiteraryQuestsUI({getTown,change,build}){
 const dialog=document.createElement('dialog');dialog.id='literary-quests';dialog.setAttribute('aria-labelledby','literary-title');document.body.append(dialog);
 let current='yueyang';
 function render(message=''){
  const t=getTown(),q=LITERARY_QUESTS[current],e=questEntry(t,current),step=q.steps[e.step],unlocked=e.step>q.steps.length;
  dialog.innerHTML=`<header><h2 id="literary-title">宋韻文學營造</h2><button data-close aria-label="關閉宋韻任務">關閉</button></header><nav aria-label="文學任務">${Object.entries(LITERARY_QUESTS).map(([id,v])=>`<button data-quest="${id}" aria-pressed="${id===current}">${esc(v.name)} · ${Math.min(questEntry(t,id).step,3)}/3</button>`).join('')}</nav><h3>${esc(q.name)}｜${esc(q.title)}</h3><p>${esc(q.author)}</p><p class="literary-history">${esc(q.note)} <a href="${q.source}" target="_blank" rel="noopener noreferrer">來源 ↗</a></p><p>營造前置：${requirements(t,current).map(r=>`${r.ok?'✓':'○'} ${r.name}`).join('、')}。圖樣解鎖後仍需四格空地與建造費。</p>${step?`<h4>${esc(step.title)}</h4><blockquote style="white-space:pre-line">${esc(step.text)}</blockquote><p>${esc(step.prompt)}</p><div class="literary-choices">${step.choices.map((c,i)=>`<button data-answer="${i}" data-step="${e.step}">${esc(c)}</button>`).join('')}</div><details><summary>閱讀提示</summary><p>${esc(step.hint)}</p></details>`:`<p>${unlocked?'圖樣已解鎖，可進入四格營造。':'閱讀挑戰已完成。完成上述城鎮前置後即可領取圖樣。'}</p><button data-unlock ${unlocked?'hidden':''}>檢查前置並領取圖樣</button><button data-build ${unlocked?'':'hidden'}>營造${esc(q.name)}</button>`}<p role="status" id="literary-status">${esc(message)}</p><details><summary>已完成的閱讀紀錄</summary>${q.steps.slice(0,Math.min(e.step,3)).map(s=>`<h4>${esc(s.title)}</h4><blockquote>${esc(s.text)}</blockquote><p>${esc(s.result)}</p>`).join('')||'<p>尚未完成閱讀挑戰。</p>'}</details><label for="literary-note">我的理由與短箋（選填，最多400字；不以自動評分鎖住進度）</label><textarea id="literary-note" maxlength="400" rows="3">${esc(e.note)}</textarea><button data-note>儲存短箋</button><p>這一批先提供三條閱讀與營造任務；其他七座地標後續加入。</p>`;
 }
 document.querySelector('#literary-quests-btn').onclick=()=>{render();dialog.showModal();};
 dialog.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-close'))return dialog.close();
  if(b.dataset.quest){current=b.dataset.quest;render();return;}
  if(b.hasAttribute('data-answer')){const s=Number(b.dataset.step),a=Number(b.dataset.answer),q=LITERARY_QUESTS[current];if(q.steps[s]?.answer!==a){document.querySelector('#literary-status').textContent=`再讀一次：${q.steps[s].hint} 不扣錢，可重試。`;return;}const ok=change(t=>answerQuest(t,current,s,a));render(ok?q.steps[s].result:'進度未儲存，請檢查存檔通知。');}
  else if(b.hasAttribute('data-unlock')){const ok=change(t=>unlockQuest(t,current));render(ok?'圖樣已儲存並解鎖。':'尚缺營造前置，或存檔未成功；完成後可再試。');}
  else if(b.hasAttribute('data-note')){const note=dialog.querySelector('textarea').value,ok=change(t=>saveQuestNote(t,current,note));dialog.querySelector('[role=status]').textContent=ok?'短箋已儲存。':'內容未變更或存檔未成功。';}
  else if(b.hasAttribute('data-build')){dialog.close();build(Object.keys(LANDMARK_QUEST).find(id=>LANDMARK_QUEST[id]===current));}
 });
}
