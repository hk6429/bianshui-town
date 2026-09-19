import {buildingStats} from './building-tiers.js';
import {managed} from './city-finance.js';
import {damaged} from './fire-service.js';
import {at,transfer} from './production.js';
import {presentWorkers,jobCapacity,onSickLeave} from './employment.js';
export const shopIsOpen=(t,b)=>!!b&&b.type==='shop'&&b.stage>=3&&!damaged(b)&&t.time%24>=7&&t.time%24<20&&presentWorkers(t,b).length>0;
export const shopStatus=(t,b)=>`${shopIsOpen(t,b)?'營業中':'暫停營業'} · 到場過賣 ${presentWorkers(t,b).length}／${jobCapacity(b)} 人 · 病假 ${t.workers(b).filter(p=>onSickLeave(t,p)).length} 人 · 招工 ${Math.max(0,jobCapacity(b)-t.workers(b).length)} 人${managed(t)?` · 每件交易間隔 ${presentWorkers(t,b).length?(buildingStats(b).saleSeconds/presentWorkers(t,b).length).toFixed(1):'—'} 秒`:""}`;
export function sellAtShop(t,shop,good){
 if(!shopIsOpen(t,shop)||managed(t)&&(shop.nextSaleAt||0)>t.elapsed)return 0;
 const n=transfer(t,`shop:${shop.id}`,'sold',1,good);
 if(n&&managed(t))shop.nextSaleAt=t.elapsed+buildingStats(shop).saleSeconds/presentWorkers(t,shop).length;
 return n;
}
export function residentPurchase(t,p){
 if(!managed(t))return false;
 const hour=t.time%24;if(!((hour>=11.5&&hour<13)||(hour>=17&&hour<20))||p.outside||(p.buyAfter||0)>t.elapsed)return false;
 // 夥計也要吃飯：在自己店裡也算買得到，否則商鋪員工永遠處於「買不到日用品」。
 const shop=t.building(p.current);if(!shopIsOpen(t,shop))return false;
 const lot=at(t,`shop:${shop.id}`).find(l=>['cloth','ceramics','furniture','legacy'].includes(l.good));if(!lot)return false;
 if(!sellAtShop(t,shop,lot.good))return false;
 t.life.dock.sold++;p.buyAfter=t.elapsed+120;p.needsSatisfiedUntil=t.elapsed+180;p.action='已買妥日用品';return true;
}
