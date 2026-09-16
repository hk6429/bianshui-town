import {WORKS,readEntry,markRead,saveReadingNote,landscapeMatch,recordMatch,curateAnthology,landscapeName,anthologyHTML} from './reading-collection.js';
import {escapeHTML as esc} from './content-html.js';
export function installReadingCollectionUI({getTown,change,openWork}){
 const $=s=>document.querySelector(s),dialog=$('#reading-collection');
 function renderLibrary(){const t=getTown(),data=t.journey.reading;$('#reading-library').innerHTML=Object.entries(WORKS).map(([id,w])=>`<article><h3>${esc(w.author)} · ${esc(w.title)}</h3><p>${readEntry(t,id)?'已有主動讀訪印記':'尚未讀訪'}</p><button data-read-work="${id}">開啟${esc(w.title)}</button></article>`).join('');
  const options='<option value="">請選一篇已讀作品</option>'+(data?.entries||[]).map(e=>`<option value="${e.work}">${esc(WORKS[e.work].title)}</option>`).join('');
  for(let i=0;i<3;i++){const s=$(`#anthology-work-${i}`);s.innerHTML=options;s.value=data?.anthology?.works[i]||'';}$('#anthology-title').value=data?.anthology?.title||'';$('#anthology-result').innerHTML=anthologyHTML(t);
 }
 $('#reading-collection-btn').onclick=()=>{renderLibrary();$('#anthology-status').textContent='選三篇不同已讀作品，可隨時重編。';dialog.showModal();};$('#reading-collection-close').onclick=()=>dialog.close();
 $('#reading-library').onclick=e=>{const b=e.target.closest('[data-read-work]');if(b){dialog.close();openWork(b.dataset.readWork);}};
 $('#anthology-save').onclick=()=>{const title=$('#anthology-title').value,works=[0,1,2].map(i=>$(`#anthology-work-${i}`).value),ok=change(t=>curateAnthology(t,title,works));$('#anthology-status').textContent=ok?'選集已儲存，可隨時重編。':'未儲存：請填1–48字標題並選三篇不同已讀作品；若皆符合，請查看存檔通知。';if(ok)renderLibrary();};
 function visit(root,id){
  change(t=>markRead(t,id));const t=getTown(),entry=readEntry(t,id),section=document.createElement('section');section.className='reading-editor';root.querySelector('.reading-editor')?.remove();root.append(section);
  const options='<option value="">不指定地景</option>'+t.buildings.map(b=>`<option value="${b.id}">${esc(b.name)}${b.stage<3?'（施工中）':''}</option>`).join(''),prefix=root.id;
  section.innerHTML=`<h3>我的讀訪與短箋</h3><p>${entry?'已記錄這篇的主動讀訪；重開不重複計數。':'讀訪尚未儲存，請先處理存檔問題後重新開啟作品。'}</p><p>印記只代表開啟過此處提供的全文或節錄，不表示已讀完整原作。</p><label for="${prefix}-note">玩家心得（最多400字）</label><textarea id="${prefix}-note" maxlength="400" rows="4" data-reading-note></textarea><label for="${prefix}-place">我的自選地景</label><select id="${prefix}-place" data-note-place>${options}</select><button data-note-save ${entry?'':'disabled'}>儲存我的短箋</button><p data-note-status role="status"></p>${WORKS[id].source?`<h4>可選挑戰：作品與地景配對</h4><p>依建物原有作品來源判定，不是史實原址考證，也不扣分。</p><label for="${prefix}-match">配對地景</label><select id="${prefix}-match" data-match-place>${options}</select><button data-match-save ${entry?'':'disabled'}>檢查地景配對</button><p data-match-status role="status">${entry?.matched?`曾配對成功：${esc(landscapeName(t,entry.matched))}`:'尚未完成配對'}</p>`:''}`;
  section.querySelector('[data-reading-note]').value=entry?.note||'';const select=section.querySelector('[data-note-place]');if(entry?.landscape&&!t.buildings.some(b=>b.id===entry.landscape.building)){const opt=document.createElement('option');opt.value=String(entry.landscape.building);opt.textContent=landscapeName(t,entry.landscape);select.append(opt);}select.value=entry?.landscape?String(entry.landscape.building):'';
  section.onclick=e=>{if(e.target.closest('[data-note-save]')){const note=section.querySelector('[data-reading-note]').value,b=select.value?Number(select.value):null,ok=change(t=>saveReadingNote(t,id,note,b));section.querySelector('[data-note-status]').textContent=ok?'已儲存玩家心得與自選地景。':'未變更：內容相同、超出400字、地點已移除，或儲存未成功。';}
   else if(e.target.closest('[data-match-save]')){const raw=section.querySelector('[data-match-place]').value,b=raw?Number(raw):null,result=landscapeMatch(getTown(),id,b);const saved=result.ok&&change(t=>recordMatch(t,id,b));section.querySelector('[data-match-status]').textContent=result.ok&&!saved?'配對符合，但尚未儲存；請查看存檔通知。':result.message;}};
 }
 return {visit};
}
