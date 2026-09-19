import {GOODS_VALUE,managed} from './city-finance.js';
export const TRADE_SEED=90000;
// city.version 1 存檔的舊周轉金基數，驗證舊檔時使用。
export const LEGACY_TRADE_SEED=600;
export const createTrade=()=>({funds:TRADE_SEED,importExpense:0,revenue:0,taxPaid:0,nextBatch:1,ledger:[]});
function record(t,entry){const a=t.city.trade;a.ledger.push({day:Math.floor(t.time/24),...entry,balance:a.funds});if(a.ledger.length>60)a.ledger.shift();}
export function purchaseImports(t,goods){
 if(!managed(t))return goods;
 const a=t.city.trade,accepted=[];let remaining=a.funds;
 for(const good of goods){const cost=GOODS_VALUE[good];if(!cost||remaining<cost)break;remaining-=cost;accepted.push(good);}
 if(!accepted.length)return [];
 const batch=a.nextBatch++;
 for(const good of [...new Set(accepted)]){const quantity=accepted.filter(g=>g===good).length,unitPrice=GOODS_VALUE[good],amount=-quantity*unitPrice;a.funds+=amount;a.importExpense-=amount;record(t,{kind:'import',batch,good,quantity,unitPrice,tax:0,amount});}
 return accepted;
}
export function recordSale(t,good,tax){
 if(!managed(t))return;
 const a=t.city.trade,unitPrice=GOODS_VALUE[good],amount=unitPrice-tax;
 a.funds+=amount;a.revenue+=unitPrice;a.taxPaid+=tax;record(t,{kind:'sale',batch:0,good,quantity:1,unitPrice,tax,amount});
}
