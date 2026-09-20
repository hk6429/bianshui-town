import {escapeHTML as esc} from './content-html.js';
export const JOURNAL_PROMPTS={
 yueyang:['登樓遊記','各引用一處晴景、雨景，說明感受如何改變，再寫你如何理解先憂後樂。'],
 kaifeng:['判案摘要','分別寫下主張、可查證的證據與仍待查之處，再說明不受權勢影響的理由。'],
 printing:['印書工序手記','用自己的話解釋兩版如何分工，以及大量印刷為何更有效率。'],
 zuiweng:['四季遊園記','選兩個季節，各引用一處景物；說明遊園與眾人同樂的關係。'],
 lotus:['觀蓮小札','選一種植物特徵，引用原句，說明它如何寄託人格理想。'],
 redcliff:['夜航遊記','分別寫下客與蘇子的觀點，再用變與不變回應一次自身的煩惱。'],
 oil:['學徒觀摩記','記錄注油的步驟，引用手熟的句子，連結一項自己反覆練習的技能。'],
 creek:['荷塘回憶圖文頁','依下圖回想晚歸、誤入、爭渡與驚鳥；引用動詞，寫出這段回憶的情緒轉折。'],
 lantern:['燈市尋訪記','對照熱鬧燈市與燈火闌珊處，各引用一個線索，寫下尋人的發現。'],
 moon:['寄給遠方的書信','以一位遠方親友為收信人，引用詞中的一句祝福，說明相隔仍能共享的事物。']
};
export function journalPrompt(id){return JOURNAL_PROMPTS[id]||['我的理由與短箋','引用作品線索，寫下自己的想法。'];}
export function journalIllustration(id){
 if(id!=='creek')return '';
 return `<figure class="literary-recollection"><svg viewBox="0 0 400 165" role="img" aria-label="作品回憶示意圖：晚歸小舟誤入荷塘，划槳爭渡，鷗鷺受驚飛起"><rect width="400" height="165" rx="14" fill="#c4d6c0"/><path d="M0 102Q90 53 170 103T400 82V165H0" fill="#94b8ae"/><path d="M42 116Q104 65 162 111T330 73" fill="none" stroke="#fff4d2" stroke-width="3" stroke-dasharray="6 7"/><path d="M115 105H181L169 120H132Z" fill="#8d6347"/><path d="M155 95L191 130" stroke="#684e39" stroke-width="4"/><circle cx="149" cy="91" r="7" fill="#cfaa7b"/><path d="M148 98V109" stroke="#5c6d52" stroke-width="10"/><g fill="#75935e"><ellipse cx="223" cy="121" rx="23" ry="7"/><ellipse cx="275" cy="108" rx="20" ry="8"/><ellipse cx="314" cy="140" rx="23" ry="7"/></g><g fill="#e3b4ab"><path d="M213 117Q207 91 224 103Q240 91 232 117Z"/><path d="M269 104Q261 83 275 90Q290 83 283 104Z"/></g><g fill="none" stroke="#f8f4df" stroke-width="4"><path d="M285 48Q299 35 309 49Q319 33 333 43"/><path d="M330 27Q343 18 351 30Q363 15 375 22"/></g><g fill="#3e5146" font-size="14" font-family="serif"><text x="14" y="35">興盡晚回舟</text><text x="108" y="57">誤入藕花深處</text><text x="235" y="157">爭渡、驚起鷗鷺</text></g></svg><figcaption>作品意象示意；非真實河道或玩家航跡。搭配下方自己的回憶短箋。</figcaption></figure>`;
}
export function journalSaved(id,note){return note?`<section class="literary-journal-page"><h4>${esc(journalPrompt(id)[0])}・已儲存</h4>${journalIllustration(id)}<p style="white-space:pre-wrap">${esc(note)}</p></section>`:'';}
