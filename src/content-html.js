import {GOODS} from './production.js';
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const lotIdentity=lot=>`#${escapeHTML(lot.id)} ${escapeHTML(GOODS[lot.good]||lot.good)}`;
export const lotButton=(lot,location)=>`<button class="tag" data-lot="${escapeHTML(lot.id)}">${lotIdentity(lot)} · ${escapeHTML(location)}</button>`;
export const lotFocusButton=lot=>`<button class="primary" data-lot-focus="${escapeHTML(lot.id)}">看這批貨的位置 ↗</button>`;
export const stallListItem=s=>`<article class="writer-card"><h3>${escapeHTML(s.name)}</h3><p>${escapeHTML(s.goods)} · ${escapeHTML(s.venue)}</p><button data-stall-focus="${escapeHTML(s.id)}">到攤前看看 ↗</button></article>`;
export const stallDetails=(s,trades,open)=>`<div class="eyebrow">宋代市井 · 街頭攤販</div><h2>${escapeHTML(s.name)}</h2><p>${escapeHTML(s.goods)}</p><p>${open?'攤主正在招呼來客':'雨天或夜深收攤，待天晴日出再開張'}</p><p>${escapeHTML(s.venue)} · 小鎮累計 ${escapeHTML(trades)} 次攤前選購</p><p class="fine">參考《東京夢華錄》的果子、茶、飲食與紙畫買賣。此處為市井互動演出，未接入工坊貨物帳。</p><a href="https://zh.wikisource.org/zh-hant/東京夢華錄/卷三" target="_blank" rel="noopener noreferrer">閱讀史料出處 ↗</a>`;
