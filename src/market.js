import {publicSquares} from './urban.js';
import {point,key} from './simulation.js';
const cache=new WeakMap();
export const STALLS=[{id:'fruit',name:'果子小攤',goods:'梨、栗子與乾果',mark:'果',color:0xa8845b},{id:'tea',name:'提瓶茶攤',goods:'茶湯與茶碗',mark:'茶',color:0x729586},{id:'snack',name:'米食蒸攤',goods:'糕餅與糰子',mark:'食',color:0xb9876d},{id:'paper',name:'紙畫小攤',goods:'紙畫與小幅卷軸',mark:'畫',color:0x8a8a9d}];
// 早市要有邸店留宿的客商撐場，夜市要有瓦子或正店點燈。
export const hasMorningMarket=t=>t.buildings.some(b=>b.stage>=3&&b.design==='inn');
export const hasNightMarket=t=>t.buildings.some(b=>b.stage>=3&&(b.design==='wazi'||b.design==='zhengdian'));
export const marketHours=t=>({open:hasMorningMarket(t)?5:7,close:hasNightMarket(t)?23:21});
export const marketOpen=t=>{const {open,close}=marketHours(t),h=t.time%24;return h>=open&&h<close&&!t.weather.raining;};
export function marketNote(t){
 const {open,close}=marketHours(t);
 return `市集 ${String(open).padStart(2,'0')}:00–${String(close).padStart(2,'0')}:00${hasMorningMarket(t)?'，邸店客商撐起早市':''}${hasNightMarket(t)?'，瓦子與正店點燈續夜市':''}。`;
}
export function marketStalls(t){const old=cache.get(t);if(old?.revision===t.revision)return old.stalls;const squares=publicSquares(t),shops=t.buildings.filter(b=>b.stage>=3&&(b.type==='shop'||b.design==='wazi'));if(!shops.length&&!squares.length)return [];const used=new Set(),stalls=STALLS.map((s,i)=>{const q=squares[i%squares.length],b=shops[i%shops.length],center=q?[q.x*4+2+(i%2?2:-2),q.z*4+2+(i<2?-2:2)]:b.entrance;const nodes=[...t.roads].filter(k=>!used.has(k)).map(point).sort((a,b)=>Math.hypot(a[0]-center[0],a[1]-center[1])-Math.hypot(b[0]-center[0],b[1]-center[1]));const p=nodes[q?0:i*2]||nodes[0];if(!p)return null;used.add(key(...p));return {...s,x:p[0],z:p[1],venue:q?'四格街坊市心':b.name+'前'};}).filter(Boolean);cache.set(t,{revision:t.revision,stalls});return stalls;}
