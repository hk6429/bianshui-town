import {escapeHTML as esc} from './content-html.js';
export const MAX_NAME=24;
export const cleanPlaceName=value=>typeof value==='string'&&value.trim().length>0&&value.trim().length<=MAX_NAME&&!/[\u0000-\u001f\u007f]/.test(value)?value.trim():null;
export const townName=t=>t.journey.townName||'汴水小鎮';
export function renameTown(t,value){const name=cleanPlaceName(value);if(!name||name===townName(t))return false;t.journey.townName=name;return true;}
export function renameBuilding(t,id,value){
 const b=t.buildings.find(b=>b.id===id),name=cleanPlaceName(value);if(!b||!name||b.name===name)return false;
 const old=b.name;b.originalName??=old;b.name=name;
 for(const p of [...t.people,...t.carts,...t.life.visitors,...t.life.oxen,...t.life.porters])if((p.destination===id||p.target===id)&&p.action?.startsWith(`前往${old}`))p.action=p.action.replace(`前往${old}`,`前往${name}`);
 return true;
}
export function saveBookmark(t,id,value){
 const b=t.buildings.find(b=>b.id===id),label=cleanPlaceName(value);if(!b||!label)return false;
 const list=t.journey.bookmarks||[],existing=list.find(s=>s.building===id);if(existing){if(existing.label===label)return false;existing.label=label;return true;}
 if(list.length>=16)return false;(t.journey.bookmarks??=[]).push({building:id,label});return true;
}
export function removeBookmark(t,id){const list=t.journey.bookmarks||[];if(!list.some(s=>s.building===id))return false;t.journey.bookmarks=list.filter(s=>s.building!==id);return true;}
export const bookmarkTarget=(t,id)=>(t.journey.bookmarks||[]).some(s=>s.building===id)?t.buildings.find(b=>b.id===id)||null:null;
export function bookmarksHTML(t){const list=t.journey.bookmarks||[];return list.length?list.map(s=>{const b=bookmarkTarget(t,s.building);return `<article><h3>${esc(s.label)}</h3><p>${b?`${esc(b.name)} · X ${b.x}、Z ${b.z}`:'地標已拆除或合併，這個書籤已失效。'}</p><button data-bookmark-go="${s.building}" ${b?'':'disabled'}>前往${esc(s.label)}</button><button data-bookmark-remove="${s.building}">移除${esc(s.label)}書籤</button></article>`;}).join(''):'<p>尚無書籤。從建築資訊卡選「命名與收藏」，即可收藏地點。</p>';}
