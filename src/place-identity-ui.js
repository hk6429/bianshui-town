import {cleanPlaceName,townName,renameTown,renameBuilding,saveBookmark,removeBookmark,bookmarkTarget,bookmarksHTML} from './place-identity.js';
export function installPlaceIdentityUI({getTown,change,edit,focus}){
 const $=s=>document.querySelector(s),dialog=$('#place-identity');let selected=null;
 function render(){const t=getTown(),b=t.buildings.find(b=>b.id===selected);$('#identity-town-name').value=townName(t);$('#identity-building').hidden=!b;if(b){$('#identity-building-type').textContent=`建築原型：${b.originalName||b.name}`;$('#identity-building-name').value=b.name;$('#identity-bookmark-name').value=t.journey.bookmarks?.find(s=>s.building===b.id)?.label||b.name;}$('#identity-bookmarks').innerHTML=bookmarksHTML(t);}
 function open(id=null){selected=Number.isSafeInteger(id)?id:null;render();$('#identity-status').textContent='名稱限1–24字，不接受空白名稱；最多收藏16處。';dialog.showModal();}
 function execute(input,action){const value=$(input).value;if(!cleanPlaceName(value)){$('#identity-status').textContent='請輸入1–24字的名稱，不可只有空白或包含控制字元。';return;}
  const ok=action(value);$('#identity-status').textContent=ok?'已儲存。':'未變更：名稱可能相同、書籤已滿，或儲存未成功。';if(ok)render();}
 $('#identity-btn').onclick=()=>open();$('#identity-close').onclick=()=>dialog.close();
 $('#identity-town-save').onclick=()=>execute('#identity-town-name',v=>change(t=>renameTown(t,v)));
 $('#identity-building-save').onclick=()=>execute('#identity-building-name',v=>edit(t=>renameBuilding(t,selected,v)));
 $('#identity-bookmark-save').onclick=()=>execute('#identity-bookmark-name',v=>change(t=>saveBookmark(t,selected,v)));
 $('#identity-bookmarks').onclick=e=>{const remove=e.target.closest('[data-bookmark-remove]'),go=e.target.closest('[data-bookmark-go]');if(remove){if(change(t=>removeBookmark(t,Number(remove.dataset.bookmarkRemove)))){render();$('#identity-status').textContent='已移除此書籤，建物保留。';}}else if(go){const b=bookmarkTarget(getTown(),Number(go.dataset.bookmarkGo));if(b){dialog.close();focus(b);}else{render();$('#identity-status').textContent='地標已失效，無法前往。';}}};
 return {open};
}
