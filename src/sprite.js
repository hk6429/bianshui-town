import {questReport} from './quest.js';
import {wellbeingReport} from './wellbeing.js';

export const SPRITE_NAME='舟童阿汴';
const INTERVAL=1500;

// 汴河上的小舟童：平頭總角、青布短褐、撐一支竹篙。純 SVG，跟場景同一組色。
export const SPRITE_SVG=`<svg viewBox="0 0 64 80" role="img" aria-label="${SPRITE_NAME}">
<ellipse cx="32" cy="75" rx="18" ry="4" fill="#00000010"/>
<path d="M51 6 L19 74" stroke="#b08d5a" stroke-width="2.4" stroke-linecap="round"/>
<path d="M20 40 q12 6 24 0 l4 30 q-16 6 -32 0z" fill="#5c6f4d"/>
<path d="M20 40 q12 6 24 0 l1.6 12 q-13 5 -27 0z" fill="#6d8159"/>
<path d="M22 52 q10 4 20 0 l1 4 q-11 4 -22 0z" fill="#9a5b41"/>
<path d="M24 30 q8 5 16 0 l4 12 q-12 6 -24 0z" fill="#e9e4cd"/>
<circle cx="32" cy="22" r="11" fill="#f0dcc0"/>
<path d="M21 20 q11 -12 22 0 q-6 -4 -11 -4 q-5 0 -11 4z" fill="#3f3a31"/>
<circle cx="24.5" cy="14.5" r="2.6" fill="#3f3a31"/><circle cx="39.5" cy="14.5" r="2.6" fill="#3f3a31"/>
<circle cx="28" cy="23" r="1.5" fill="#3d3a32"/><circle cx="36" cy="23" r="1.5" fill="#3d3a32"/>
<path d="M29 28 q3 2.4 6 0" stroke="#9a6a53" stroke-width="1.4" fill="none" stroke-linecap="round"/>
<circle cx="22.5" cy="26.5" r="2.4" fill="#e3a98d" opacity=".55"/><circle cx="41.5" cy="26.5" r="2.4" fill="#e3a98d" opacity=".55"/>
<path d="M44 44 q6 -6 5 -14" stroke="#f0dcc0" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>`;

export function installSprite({getTown,toast}){
 const $=s=>document.querySelector(s);
 const art=$('#sprite-art'),line=$('#sprite-quest'),card=$('#next-step');
 const goalsEl=$('#quest-goals'),summary=$('#quest-summary'),nextEl=$('#quest-next'),dialog=$('#quest');
 art.innerHTML=SPRITE_SVG;
 let at=0,report=null,lastCleared=null,lastRank=null;

 function detail(){
  if(!report)return;
  summary.textContent=report.done
   ?`功德圓滿：五樁全成，汴水小鎮已是一方望縣。阿汴給您作揖。`
   :`破關＝把草市經營成望縣，再成就五樁功德。目前 ${report.cleared}／${report.total}。`;
  const next=report.milestone;
  nextEl.textContent=next?`下一階「${next.name}」：${next.text}。${next.ok?'條件已足，下次人口評估即升格。':next.note}`:'已是望縣，升格鏈走完了。';
  goalsEl.replaceChildren();
  for(const g of report.goals){
   const li=document.createElement('li');
   li.className=`quest-goal${g.ok?' quest-done':''}`;
   li.innerHTML=`<strong>${g.ok?'已成':'未成'}·${g.name}</strong><span>${g.state}</span><small>${g.hint}</small>`;
   goalsEl.append(li);
  }
 }

 return {update(){
  const now=performance.now();
  if(now-at<INTERVAL)return;
  at=now;
  const t=getTown();
  report=questReport(t,wellbeingReport(t));
  line.textContent=report.done?`功德圓滿 · ${report.rankName}`:`${report.rankName} · 功德 ${report.cleared}／${report.total}`;
  card.classList.toggle('quest-clear',report.done);
  if(lastCleared!==null&&report.cleared>lastCleared){
   const won=report.goals.find(g=>g.ok&&g.key!=='rank');
   toast(report.done?`${SPRITE_NAME}：五樁功德圓滿，汴水小鎮成了一方望縣。`:`${SPRITE_NAME}：又添一樁功德——${won?won.name:'升格'}。`);
  }
  if(lastRank!==null&&report.rank>lastRank)toast(`${SPRITE_NAME}：恭喜升為${report.rankName}，圖錄裡多了新的營造。`);
  lastCleared=report.cleared;lastRank=report.rank;
  if(dialog.open)detail();
 },open(){detail();dialog.showModal();}};
}
