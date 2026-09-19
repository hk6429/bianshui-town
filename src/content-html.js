import {GOODS} from './production.js';
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const lotIdentity=lot=>`#${escapeHTML(lot.id)} ${escapeHTML(GOODS[lot.good]||lot.good)}`;
export const lotButton=(lot,location)=>`<button class="tag" data-lot="${escapeHTML(lot.id)}" aria-pressed="false" aria-controls="lot-detail">${lotIdentity(lot)} · ${escapeHTML(location)}</button>`;
export const constructionPercent=(building,elapsed)=>Math.max(0,Math.min(100,Math.floor((elapsed-building.born)/18*100)));
export function constructionProgress(building,elapsed){const value=constructionPercent(building,elapsed);return `<div class="progress" role="progressbar" aria-label="${escapeHTML(building.name)}施工進度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}" aria-live="off"><i style="width:${value}%"></i></div><p class="construction-percent">施工進度 ${value}%</p>`;}
export const lotFocusButton=lot=>`<button class="primary" data-lot-focus="${escapeHTML(lot.id)}">看這批貨的位置 ↗</button>`;
export const stallListItem=s=>`<article class="writer-card"><h3>${escapeHTML(s.name)}</h3><p>${escapeHTML(s.goods)} · ${escapeHTML(s.venue)}</p><button data-stall-focus="${escapeHTML(s.id)}">到攤前看看 ↗</button></article>`;
export const stallDetails=(s,trades,open)=>`<div class="eyebrow">宋代市井 · 街頭攤販</div><h2>${escapeHTML(s.name)}</h2><p>${escapeHTML(s.goods)}</p><p>${open?'攤家正在招呼來客':'雨天或夜深收攤，待天晴日出再開張'}</p><p>${escapeHTML(s.venue)} · 小鎮累計 ${escapeHTML(trades)} 次攤前選購</p><p class="fine">參考《東京夢華錄》的果子、茶、飲食與紙畫買賣。此處為市井互動演出，未接入工坊貨物帳。</p><a href="https://zh.wikisource.org/zh-hant/東京夢華錄/卷三" target="_blank" rel="noopener noreferrer">閱讀史料出處 ↗</a>`;
