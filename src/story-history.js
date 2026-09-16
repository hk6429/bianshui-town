import {escapeHTML as esc} from './content-html.js';
export function storyHistoryHTML(t){
 const history=t.stories.history||[];
 return '<p>保留最近24場摘要；以下均已散場或取消。補訪只帶你回到當時地點，不重演活動，也不計入親眼見過。</p>'+(history.length?history.map(e=>`<article><h3>${esc(e.title)} · ${e.happened?'已散場':'已取消'}</h3><svg viewBox="0 0 180 48" width="180" height="48" role="img" aria-label="${esc(e.venue)}的歷史地點示意"><path d="M0 34H180" stroke="currentColor"/><path d="M65 30V15L90 3L115 15V30Z" fill="none" stroke="currentColor"/><circle cx="90" cy="36" r="4" fill="currentColor"/></svg><p>地點：${esc(e.venue)}</p><p>${esc(e.summary)}</p><p>發生原因：${esc(e.reason)}</p><p>實際到場：${e.participants.length?e.participants.map(p=>esc(p.name)).join('、'):'無到場活動紀錄'}</p><button data-history-visit="${e.id}">補訪當時地點（已散場）</button></article>`).join(''):'<p>尚無散場摘要；舊存檔只有最後地點時，不補造過往參與者。</p>');
}
export function installStoryHistoryUI({getTown,visit}){
 const dialog=document.createElement('dialog');dialog.id='story-history';dialog.setAttribute('aria-labelledby','story-history-heading');dialog.innerHTML='<div class="dialog-head"><h2 id="story-history-heading">街頭往事</h2><button data-history-close>關閉街頭往事</button></div><div id="story-history-content"></div>';document.body.append(dialog);
 dialog.onclick=e=>{if(e.target.closest('[data-history-close]'))dialog.close();const button=e.target.closest('[data-history-visit]');if(button){const record=getTown().stories.history?.find(r=>r.id===Number(button.dataset.historyVisit));if(record){dialog.close();visit(record);}}};
 return {open(){dialog.querySelector('#story-history-content').innerHTML=storyHistoryHTML(getTown());dialog.showModal();}};
}
