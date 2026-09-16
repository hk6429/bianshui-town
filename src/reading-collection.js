import {SOURCES,DESIGNS,designFor} from './heritage.js';
import {escapeHTML as esc} from './content-html.js';
import {WORKS} from './reading-collection-data.js';
export {WORKS,SOURCE_WORK} from './reading-collection-data.js';
export const readEntry=(t,id)=>t.journey.reading?.entries.find(e=>e.work===id);
const collection=t=>(t.journey.reading??={entries:[],anthology:null});
export function markRead(t,id){if(!Object.hasOwn(WORKS,id)||readEntry(t,id))return false;collection(t).entries.push({work:id,openedAt:t.elapsed,note:'',landscape:null,matched:null});return true;}
export function saveReadingNote(t,id,note,building){
 const e=readEntry(t,id);if(!e||typeof note!=='string'||note.length>400)return false;
 const b=t.buildings.find(b=>b.id===building);if(building!==null&&!b&&e.landscape?.building!==building)return false;
 const landscape=b?{building:b.id,name:b.name}:building===null?null:e.landscape;
 if(e.note===note&&JSON.stringify(e.landscape)===JSON.stringify(landscape))return false;e.note=note;e.landscape=landscape;return true;
}
export function landscapeMatch(t,id,building){
 const work=WORKS[id],b=t.buildings.find(b=>b.id===building);
 if(!readEntry(t,id))return {ok:false,message:'請先開啟這篇作品，留下讀訪印記。'};
 if(!work?.source)return {ok:false,message:'此篇目前沒有設定來源配對；仍可自由選景寫心得。'};
 if(!b||b.stage<3)return {ok:false,message:'請選擇城內一處已落成的地景。'};
 if(DESIGNS[designFor(b)]?.source!==work.source)return {ok:false,message:`此建物的來源不是${work.title}。請找與${SOURCES[work.source].quote}相關的地景，可重新選擇。`};
 return {ok:true,message:`配對通過：${SOURCES[work.source].note} 這是文學意象配對，不是史實原址。`};
}
export function recordMatch(t,id,building){if(!landscapeMatch(t,id,building).ok)return false;const b=t.buildings.find(b=>b.id===building);readEntry(t,id).matched={building:b.id,name:b.name};return true;}
export function curateAnthology(t,title,works){
 if(typeof title!=='string'||!title.trim()||title.trim().length>48||/[\u0000-\u001f\u007f]/.test(title)||!Array.isArray(works)||works.length!==3||new Set(works).size!==3||works.some(id=>!readEntry(t,id)))return false;
 collection(t).anthology={title:title.trim(),works:[...works]};return true;
}
export function landscapeName(t,place){if(!place)return '尚未選景';const b=t.buildings.find(b=>b.id===place.building);return b?b.name:`${place.name}（地標已拆除或合併，保留原選景）`;}
export function anthologyHTML(t){const a=t.journey.reading?.anthology;if(!a)return '<p>尚未編選。開啟三篇不同作品後，可以自由編成一冊。</p>';return `<article><h3>${esc(a.title)}</h3><p>玩家自編選集 · 不代表作品的原創作地點</p>${a.works.map(id=>{const w=WORKS[id],e=readEntry(t,id);return `<section><h4>${esc(w.author)} · ${esc(w.title)}</h4><p>我的地景：${esc(landscapeName(t,e.landscape))}</p><p>玩家心得：${esc(e.note||'尚未留下短箋')}</p></section>`;}).join('')}</article>`;}
