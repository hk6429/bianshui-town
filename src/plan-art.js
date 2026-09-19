import {DESIGNS} from './heritage.js';
import {designCategory} from './heritage.js';
// 沒有手繪縮圖的圖樣，依設計代號生成專屬立面：同一款永遠同一張，不同款一眼看得出差別。
const PALETTE={
 home:{wall:'#e6dcc4',trim:'#a47d52',roof:'#5c6f6c',accent:'#9b7d55'},
 shop:{wall:'#efe1c3',trim:'#8a6b45',roof:'#4f6468',accent:'#9b4c38'},
 work:{wall:'#dccfae',trim:'#7a5233',roof:'#55605a',accent:'#a07357'},
 garden:{wall:'#dfe6cf',trim:'#7d8a5c',roof:'#5b7168',accent:'#8c9c69'},
 school:{wall:'#e8ddc2',trim:'#7a6540',roof:'#4a5f63',accent:'#80a49a'},
 civic:{wall:'#e4d8bc',trim:'#6f5a41',roof:'#47585c',accent:'#b3ab90'},
 shrine:{wall:'#efd9c6',trim:'#8c4a38',roof:'#6a4a44',accent:'#9b4c38'},
 water:{wall:'#dfe2d2',trim:'#6b5a45',roof:'#4f6a6b',accent:'#5f8a84'}
};
const hash=id=>{let x=0x811c9dc5;for(let i=0;i<id.length;i++){x^=id.charCodeAt(i);x=Math.imul(x,0x01000193);}return x>>>0;};
const gableRoof=(x,y,w,c)=>`<path d="M${x} ${y+15}L${x+10} ${y+4}L${x+w-10} ${y+4}L${x+w} ${y+15}Z" fill="${c}"/>`;
const hipRoof=(x,y,w,c)=>`<path d="M${x} ${y+16}Q${x+w/2} ${y-4} ${x+w} ${y+16}Z" fill="${c}"/>`;
const tentRoof=(x,y,w,c)=>`<path d="M${x} ${y+16}L${x+w/2} ${y+1}L${x+w} ${y+16}Z" fill="${c}"/>`;
const ROOFS=[gableRoof,hipRoof,tentRoof];
export function genericArt(id){
 const spec=DESIGNS[id];
 if(!spec)return '';
 const p=PALETTE[designCategory(id)]||PALETTE.home,h=hash(id);
 const bays=2+h%3,roofStyle=ROOFS[(h>>>3)%ROOFS.length],storeys=spec.sizes.includes(4)&&(h>>>5)%2?2:1;
 const width=96+(h>>>7)%34,x=(160-width)/2,top=storeys>1?12:26;
 const bodyTop=top+18,bodyBottom=80;
 let art=roofStyle(x-8,top,width+16,p.roof);
 art+=`<path d="M${x} ${bodyTop}H${x+width}V${bodyBottom}H${x}Z" fill="${p.wall}"/>`;
 if(storeys>1){
  art+=roofStyle(x-4,bodyTop+14,width+8,p.roof);
  art+=`<path d="M${x+8} ${bodyTop+30}H${x+width-8}V${bodyBottom}H${x+8}Z" fill="${p.wall}"/>`;
 }
 const step=width/(bays+1);
 for(let i=1;i<=bays;i++){
  const cx=x+step*i;
  art+=`<path d="M${cx.toFixed(1)} ${storeys>1?bodyTop+30:bodyTop}V${bodyBottom}" stroke="${p.trim}" stroke-width="3"/>`;
 }
 // 一扇門、兩扇窗，位置與款式隨設計而異。
 const doorW=16+(h>>>11)%10,doorX=x+width/2-doorW/2;
 art+=`<path d="M${doorX.toFixed(1)} ${bodyBottom-22}H${(doorX+doorW).toFixed(1)}V${bodyBottom}H${doorX.toFixed(1)}Z" fill="${p.trim}"/>`;
 if((h>>>13)%2)art+=`<path d="M${x+10} ${bodyBottom-30}H${x+28}V${bodyBottom-18}H${x+10}Z M${x+width-28} ${bodyBottom-30}H${x+width-10}V${bodyBottom-18}H${x+width-28}Z" fill="${p.accent}" opacity=".75"/>`;
 // 招牌、幌子或旗杆：讓商鋪、公設與祠廟一眼分得開。
 const sign=(h>>>17)%3;
 if(sign===0)art+=`<path d="M${x+width-6} ${top+2}V${bodyBottom}" stroke="${p.trim}" stroke-width="4"/><path d="M${x+width-6} ${top+6}h22v16h-22Z" fill="${p.accent}"/>`;
 else if(sign===1)art+=`<path d="M${x+width/2-18} ${bodyTop-12}h36v14h-36Z" fill="${p.accent}"/>`;
 else art+=`<path d="M${x-12} ${top+4}V${bodyBottom}" stroke="${p.trim}" stroke-width="4"/><circle cx="${x-12}" cy="${top+10}" r="6" fill="${p.accent}"/>`;
 if(designCategory(id)==='garden'||designCategory(id)==='water')art+=`<circle cx="${(h>>>19)%2?26:136}" cy="64" r="13" fill="${p.accent}" opacity=".85"/>`;
 art+=`<text x="14" y="26" font-size="17" fill="${p.trim}" opacity=".85">${spec.mark||''}</text>`;
 return art;
}
