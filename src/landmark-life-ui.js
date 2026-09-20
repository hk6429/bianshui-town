import {LANDMARK_LIFE,landmarkState,scheduleLandmark,cancelLandmark} from './landmark-life.js';
import {LANDMARK_TEXT,landmarkUpgrade,landmarkReflection,reflectLandmark,connectLandmarks} from './landmark-upgrades.js';
import {escapeHTML as esc} from './content-html.js';
const drafts=new Map();
const draftKey=(id,other)=>`${id}:${other}`;
export function captureLandmarkDraft(event){
 const el=event.target.closest('[data-landmark-draft]');if(!el)return;
 const k=draftKey(el.dataset.building,el.dataset.other),d=drafts.get(k)||{};d[el.dataset.landmarkDraft]=el.type==='checkbox'?el.checked:el.value;drafts.set(k,d);
}
export function resetLandmarkDrafts(){drafts.clear();}
export function landmarkLifeHTML(t,b){
 const spec=LANDMARK_LIFE[b.design];if(!spec||b.stage<3)return '';
 const s=landmarkState(t),e=s?.active,v=s?.visits[b.design],r=landmarkReflection(b);
 const button=(action,label,extra='')=>`<button data-landmark-action="${action}" data-building="${b.id}" ${extra}>${esc(label)}</button>`;
 const status=e?`${LANDMARK_LIFE[e.design].name}：${{scheduled:'已排程',gathering:'居民沿路集合中',active:'到場共讀中'}[e.phase]}，第${Math.floor(e.at/24)+1}日 ${Math.floor(e.at%24)}時；已到場 ${e.attendees.length}人`:'目前沒有排程活動';
 const others=Object.entries(LANDMARK_LIFE).filter(([design,q])=>design!==b.design&&s?.visits[design]?.count&&t.journey.literary?.[q.quest]?.activity?.stage===3);
 const readings=t.journey.landmarkReflections?.[b.design]?'<p>延伸閱讀已完成。</p>':`<p>${esc(r[0])}</p>${[1,2].map((i)=>button('reflect',r[i],`data-choice="${i-1}"`)).join('')}`;
 const connection=t.journey.landmarkConnections?.[b.design];
 const comparison=connection?`<p>已連結${esc(LANDMARK_TEXT[connection.other][0])}。</p><blockquote>${esc(connection.quote)}<br>${esc(connection.otherQuote)}</blockquote><p>${esc(connection.note)}</p>`:others.map(([design])=>{
  const d=drafts.get(draftKey(b.id,design))||{},attrs=`data-building="${b.id}" data-other="${design}"`;
  return `<fieldset><legend>${esc(LANDMARK_TEXT[b.design][0])} × ${esc(LANDMARK_TEXT[design][0])}</legend><blockquote>${esc(LANDMARK_TEXT[b.design][1])}</blockquote><label><input type="checkbox" data-landmark-draft="quote" ${attrs} ${d.quote?'checked':''}>採用第一篇引文</label><blockquote>${esc(LANDMARK_TEXT[design][1])}</blockquote><label><input type="checkbox" data-landmark-draft="otherQuote" ${attrs} ${d.otherQuote?'checked':''}>採用第二篇引文</label><label>比較短箋（20–400字）：兩段文字如何各自面對人、景物或行動？說明一個相同點與一個不同點。<textarea data-landmark-draft="note" ${attrs} maxlength="400" rows="4">${esc(d.note||'')}</textarea></label><p>選擇比較原則後儲存引文及短箋：</p>${button('connect','依兩篇線索比較，保留各自情境',`data-other="${design}" data-choice="0"`)}${button('connect','同為宋代背景，作者與情境完全相同',`data-other="${design}" data-choice="1"`)}</fieldset>`;
 }).join('')||'<p>尚無另一座完成操作且舉行過活動的地標。</p>';
 return `<section class="landmark-life"><h3>${esc(spec.name)}與五級營造</h3><p>${esc(spec.action)}。居民會沿實際道路前往場地，至少一人全程停留18遊戲秒才完成。夜航與荷塘為內置文學意象，不表示可駛入真實河道。</p><p>${esc(status)}</p>${!e?button('schedule',`排程下一場（${spec.night?'19':'12'}時）`)+button('tomorrow','排程明日同時'):e.phase==='scheduled'?button('cancel','取消排程'):''}<p>重訪完成 ${v?.count||0}次；公共服務 ${v?.served||0}人次。每位居民每遊戲日最多增加2點學力，最高100；不發放金錢、不產生商品。</p><p>${esc(landmarkUpgrade(t,b).text)}</p><details><summary>三級：延伸閱讀</summary>${b.design==='kaifengCourt'&&v?.count?`<section><h4>落成後支線：街坊借罐糾紛</h4><p>遊戲虛構案；與鍘美案人物無關。點開三方資料，再決定查證順序。</p><details><summary>借出者的陳述</summary><p>我借出一口陶罐，收回時罐底有裂痕，所以請對方賠償。</p></details><details><summary>借用者的陳述</summary><p>借到時底部已經有一道細紋；我沒有摔落。</p></details><details><summary>搬運者留下的紀錄</summary><p>交接只清點數量，沒有記錄器物狀況。目前不能證明裂痕何時發生。</p></details><p>兩方主張互相衝突；先查交接狀況、舊照片與其他見證，不能只憑任何一方身分判賠。下題記錄查證原則；可到宋韻任務的判案摘要寫下待查事項。</p></section>`:''}${readings}</details><div class="landmark-comparison"><h4>五級：跨作品比較</h4><p>先完成兩篇作品的閱讀、三段操作與實際居民活動，再引用兩篇文字撰寫比較。這裡記錄閱讀思考，不自動判定短箋的文學解釋正誤。</p>${comparison}</div><details><summary>最近活動紀錄</summary>${(s?.history||[]).filter(h=>h.design===b.design).slice(0,5).map(h=>`<p>${h.success?'完成':'未完成'}：${esc(h.summary)}</p>`).join('')||'<p>尚無紀錄。</p>'}</details></section>`;
}
export function handleLandmarkAction(event,{change,toast,render}){
 const button=event.target.closest('[data-landmark-action]');if(!button)return false;
 const {landmarkAction:a,building,choice,other}=button.dataset,id=Number(building),draft=drafts.get(draftKey(id,other))||{};
 const ok=change(t=>a==='schedule'||a==='tomorrow'?scheduleLandmark(t,id,a==='tomorrow'?'tomorrow':'next'):a==='cancel'?cancelLandmark(t):a==='reflect'?reflectLandmark(t,id,Number(choice)):a==='connect'?connectLandmarks(t,id,other,Number(choice),draft.note,draft.quote?LANDMARK_TEXT[t.buildings.find(b=>b.id===id)?.design]?.[1]:null,draft.otherQuote?LANDMARK_TEXT[other]?.[1]:null):false);
 if(ok&&a==='connect')drafts.delete(draftKey(id,other));
 toast(ok?'活動／閱讀進度已儲存':choice==='1'?'再想一想：回到作品線索，避免把觀點或人物一概而論。':a==='connect'?'請選用兩篇引文、寫下20–400字比較短箋；需完成兩篇操作與到場活動，且儲存成功。':'條件尚未達成、已記錄，或儲存未成功');render();return true;
}
