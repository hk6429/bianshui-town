import {escapeHTML as esc} from './content-html.js';
import {adventureView,visitAdventure,decideAdventure,resetAdventure,claimAdventure,resolveAdventure} from './adventure.js';

const action=(id,name,extra='')=>`data-adventure-action="${name}" data-adventure-id="${esc(id)}" ${extra}`;
export function createAdventureUI({getTown,change,rerender}){
 let identity=getTown();
 const drafts=new Map(),messages=new Map();
 function sync(){if(identity!==getTown()){identity=getTown();drafts.clear();messages.clear();}}
 function render(id){
  sync();
  const v=adventureView(getTown(),id);if(!v)return '';
  const visited=v.roles.filter(r=>r.visited).length,ready=visited===v.roles.length;
  const chosen=v.choices.find(c=>c.id===v.decision?.choiceId);
  const history=v.history||[],collection=v.collections||[];
  const followupChoices=v.followupChoices||[],resolved=followupChoices.find(c=>c.id===v.followup?.choiceId);
  const followup=v.decision?`<section class="adventure-followup" aria-label="後續居民需要"><h5>${v.followup?'後續安排的回應':'還有人需要你的安排'}</h5>${v.followup?`<p>${esc(resolved?.consequence||'後續安排已保存，可與老師討論尚未解決的需要。')}</p>`:`<p>${esc(v.followupNeed||'想一想，剩下的資源要留給誰？')}</p><div class="adventure-choices" role="group" aria-label="選擇後續安排">${followupChoices.map(c=>`<button ${action(id,'resolve',`data-adventure-choice="${esc(c.id)}"`)} ${v.resources.time<c.cost.time||v.resources.aid<c.cost.aid?'disabled':''}><strong>${esc(c.label)}</strong><small>耗時 ${esc(c.cost.time)} · 援助 ${esc(c.cost.aid)}</small></button>`).join('')}</div>`}</section>`:'';
  const body=!v.decision?`
   <p class="adventure-next"><strong>${ready?'現在：選一個安排，看看居民的反應。':`現在：聽聽居民的線索（${visited}/${v.roles.length}）。`}</strong></p>
   <div class="adventure-roles">${v.roles.map((r,i)=>`<div class="adventure-role ${r.visited?'is-visited':''}"><button ${action(id,'visit',`data-adventure-role="${esc(r.id)}"`)} ${r.visited?'disabled':''}><span aria-hidden="true">${r.visited?'✓':i+1}</span> ${esc(r.name)}${r.visited?'・已訪查':'・聽線索'}${r.visited?'':'<small>耗時 1</small>'}</button>${r.visited?`<p>${esc(r.clue)}</p>`:''}</div>`).join('')}</div>
   ${ready?`<div class="adventure-choices" role="group" aria-label="選擇本次安排">${v.choices.map(c=>`<button ${action(id,'decide',`data-adventure-choice="${esc(c.id)}"`)} ${v.resources.time<c.cost.time||v.resources.aid<c.cost.aid?'disabled':''}><strong>${esc(c.label)}</strong><span>${esc(c.tradeoff)}</span><small>耗時 ${esc(c.cost.time)} · 援助 ${esc(c.cost.aid)}</small></button>`).join('')}</div><details class="adventure-reason"><summary>想先說說理由？（選填）</summary><label for="adventure-reason-${esc(id)}">我這樣安排，是因為……</label><textarea id="adventure-reason-${esc(id)}" data-adventure-field="reason" data-adventure-id="${esc(id)}" rows="2" maxlength="400" placeholder="也可以先與同學口述討論">${esc(drafts.get(id)||'')}</textarea><p data-adventure-draft>${drafts.has(id)?'草稿保留中；做選擇時一併儲存。':'做選擇時一併儲存；不自動評定理由對錯。'}</p></details>`:''}`:
   `<section class="adventure-outcome" aria-label="本次居民反應"><p class="adventure-next">你的安排：<strong>${esc(chosen?.label||v.decision.choiceId)}</strong></p><h5>居民的回應</h5><p>${esc(chosen?.consequence||'這次安排已保留在歷程中。')}</p>${v.surprise?`<p class="adventure-surprise">${esc(v.surprise)}</p>`:''}${v.decision.reason?`<p>我的理由：${esc(v.decision.reason)}</p>`:''}<p>這是情境推演；理由留給你、同學與老師討論。</p></section>
   ${followup}<section class="adventure-reward" aria-label="收藏與榮譽" ${v.followup?'':'hidden'}><h5>${v.claimed?'本篇紀念已收藏':'把這段冒險帶回文學'}</h5>${v.claimed?'<p>你已完成本篇收藏；再次演練不會重複領獎。</p>':`<p>完成閱讀與作品，讓選擇有原文支持。</p><ul>${v.requirements.map(r=>`<li>${r.ok?'✓':'○'} ${esc(r.label)}</li>`).join('')}</ul>${v.canClaim?`<button ${action(id,'claim')}>領取本篇收藏</button>`:`<div class="adventure-links"><button ${action(id,'reading')}>回原文找證據 ↓</button><button ${action(id,'portfolio')}>留下我的作品 ↓</button></div>`}`}</section>`;
  return `<section class="adventure-panel" data-adventure-panel="${esc(id)}" aria-labelledby="adventure-title-${esc(id)}"><div class="adventure-heading"><p class="adventure-kicker">汴水文學冒險 · 第 ${esc(v.round+1)} 次演練</p><h4 id="adventure-title-${esc(id)}">${esc(v.title)}</h4><p class="adventure-mission">${esc(v.mission)}</p></div><div class="adventure-resources" aria-label="本次演練資源"><span>可用時間 <strong>${esc(v.resources.time)}</strong></span><span>援助物資 <strong>${esc(v.resources.aid)}</strong></span><small>本篇演練專用</small></div>${body}<p class="adventure-status" role="status" tabindex="-1">${esc(messages.get(id)||'')}</p><details class="adventure-history"><summary>我的冒險歷程與收藏（${history.length} 次決策）</summary>${collection.length?`<p>已收藏：${collection.map(esc).join('、')}</p>`:'<p>收藏櫃等待你的第一段故事。</p>'}${history.length?`<ol>${history.map(h=>`<li><strong>第 ${esc(h.round+1)} 次：</strong>${esc(v.choices.find(c=>c.id===h.choiceId)?.label||h.choiceId)}${h.reason?`<p>${esc(h.reason)}</p>`:''}<p>後續：${h.followup? h.followup.choiceId==='repair'?'投入剩餘資源回應需要':'投入另一群居民的保障':'尚未安排'}</p></li>`).join('')}</ol>`:'<p>做出選擇後，就會留下紀錄。</p>'}${v.decision?`<p>再試一次會補足本篇演練資源。保留最近12次決策與已得收藏，重玩超過12次會移除最早一筆。</p><button ${action(id,'reset')}>換個安排再演練</button>`:''}</details><p class="adventure-note">教學改編 · ${esc(v.note)}</p></section>`;
 }
 function input(event){
  const el=event.target;if(el?.dataset?.adventureField!=='reason')return;
  sync();drafts.set(el.dataset.adventureId,el.value.slice(0,400));
  const status=el.closest('[data-adventure-panel]')?.querySelector('[data-adventure-draft]');
  if(status)status.textContent='草稿保留中；切換篇章仍保留，重新整理前請做選擇一併儲存。';
 }
 function refresh(panel,id,message,name){
  messages.set(id,message);
  if(!panel){rerender(message);return;}
  const holder=panel.ownerDocument.createElement('div');holder.innerHTML=render(id);
  const replacement=holder.firstElementChild;panel.replaceWith(replacement);
  const focusTarget=name==='decide'?replacement.querySelector('.adventure-outcome h5'):name==='resolve'?replacement.querySelector('.adventure-followup h5'):name==='claim'?replacement.querySelector('.adventure-reward h5'):replacement.querySelector('[data-adventure-action=visit]:not(:disabled),[data-adventure-action=decide]');
  if(focusTarget){if(focusTarget.tagName!=='BUTTON')focusTarget.tabIndex=-1;focusTarget.focus({preventScroll:true});focusTarget.scrollIntoView({block:['decide','resolve'].includes(name)?'start':'nearest',behavior:'auto'});}else replacement.querySelector('.adventure-status')?.focus({preventScroll:true});
 }
 function click(event){
  const b=event.target.closest?.('[data-adventure-action]');if(!b)return false;
  const id=b.dataset.adventureId,name=b.dataset.adventureAction,panel=b.closest('[data-adventure-panel]');
  if(b.disabled)return true;
  if(name==='reading'||name==='portfolio'){
   const scope=panel?.closest('dialog')||event.currentTarget;
   const target=scope?.querySelector(name==='reading'?'.learning-reading':'.learning-portfolio');
   if(!target){const status=panel?.querySelector('.adventure-status');if(status){status.textContent=name==='reading'?'本篇閱讀已完成，可在下方「已完成的閱讀紀錄」回看原文。':'作品區尚未顯示，請重新開啟本篇再試。';status.focus({preventScroll:true});}return true;}
   for(let el=target;el&&el!==scope;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;
   target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'auto'});return true;
  }
  sync();
  const operations={visit:t=>visitAdventure(t,id,b.dataset.adventureRole),decide:t=>decideAdventure(t,id,{choiceId:b.dataset.adventureChoice,reason:drafts.get(id)||''}),resolve:t=>resolveAdventure(t,id,{choiceId:b.dataset.adventureChoice}),reset:t=>resetAdventure(t,id),claim:t=>claimAdventure(t,id)};
  if(!operations[name])return false;
  const ok=change(operations[name]);
  if(ok&&(name==='decide'||name==='reset'))drafts.delete(id);
  const success={visit:'居民的線索已記錄。',decide:'選擇已儲存，看看居民的回應。理由保留待討論。',resolve:'後續安排已儲存；看看居民的回應與剩餘資源。',reset:'新演練已開始。保留最近12次決策與已得收藏，重玩超過12次會移除最早一筆。',claim:'本篇收藏已儲存。'};
  refresh(panel,id,ok?success[name]:'這次操作尚未儲存。請查看資源、前置條件與存檔通知；草稿仍保留。',ok?name:'failed');return true;
 }
 return {render,input,click};
}
