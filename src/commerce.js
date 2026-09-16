import {at,transfer} from './production.js';
import {presentWorkers,jobCapacity} from './employment.js';
export const shopIsOpen=(t,b)=>!!b&&b.type==='shop'&&b.stage>=3&&t.time%24>=7&&t.time%24<20&&presentWorkers(t,b).length>0;
export const shopStatus=(t,b)=>`${shopIsOpen(t,b)?'營業中':'暫停營業'} · 到場店員 ${presentWorkers(t,b).length}／${jobCapacity(b)} 人 · 招工 ${Math.max(0,jobCapacity(b)-t.workers(b).length)} 人`;
export function residentPurchase(t,p){
 const hour=t.time%24;if(!((hour>=11.5&&hour<13)||(hour>=17&&hour<20))||p.outside||(p.buyAfter||0)>t.elapsed)return false;
 const shop=t.building(p.current);if(p.work===shop?.id||!shopIsOpen(t,shop))return false;
 const lot=at(t,`shop:${shop.id}`).find(l=>['cloth','ceramics','furniture','legacy'].includes(l.good));if(!lot)return false;
 if(!transfer(t,`shop:${shop.id}`,'sold',1,lot.good))return false;
 t.life.dock.sold++;p.buyAfter=t.elapsed+120;p.needsSatisfiedUntil=t.elapsed+180;p.action='已買妥日用品';return true;
}
