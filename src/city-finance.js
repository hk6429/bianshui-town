import {createTrade} from './trade.js';
import {tierRule,buildingStats,BUILDING_UPKEEP} from './building-tiers.js';
// 宋代物價尺度：工匠日薪約百文，瓦屋數十貫。1 貫＝1000 文。
export const BUILD_COST={home:18000,shop:27000,work:36000,garden:15000};
export const ROAD_COST={lane:3000,avenue:6750};
export const LOGISTICS_UPKEEP=900;
export const UPKEEP={...BUILDING_UPKEEP,lane:150,avenue:300};
export const GOODS_VALUE={clay:1500,timber:1800,fiber:1500,ceramics:6750,furniture:9000,cloth:6000,legacy:3000};
export const createCity=(mode='sandbox',time=8)=>({version:2,mode,logisticsLevel:1,trade:createTrade(),treasury:300000,taxRate:10,day:Math.floor(time/24),sanitationDay:Math.floor(time/24),fireDay:Math.floor(time/24),ledger:[],taxIncome:0,spent:0,maintenancePaid:0,deficitDays:0});
export const managed=t=>t.city?.mode==='managed';
export const buildCost=(type,cells)=>BUILD_COST[type]*cells.length;
export const moveCost=b=>4500*(b.footprint?.length||1);
export const upgradeCost=(b,expand=false)=>expand?BUILD_COST[b.type]*3:Math.ceil(BUILD_COST[b.type]*(b.footprint?.length||1)*tierRule(b).upgradeFactor);
export const roadCost=(t,type,cells)=>cells.reduce((sum,c)=>sum+Math.max(0,(ROAD_COST[type]||0)-(ROAD_COST[t.publicWorks.find(p=>p.x===c.x&&p.z===c.z)?.type]||0)),0);
export const affordable=(t,cost)=>!managed(t)||(Number.isSafeInteger(cost)&&cost>=0&&(cost===0||t.city.treasury>=cost));
function record(t,label,amount){t.city.ledger.push({day:Math.floor(t.time/24),label,amount,balance:t.city.treasury});if(t.city.ledger.length>60)t.city.ledger.shift();}
export function charge(t,cost,label){if(!affordable(t,cost))return false;if(managed(t)&&cost){t.city.treasury-=cost;t.city.spent+=cost;record(t,label,-cost);}return true;}
export function refundBuilding(t,b){if(!managed(t))return;const amount=Math.floor(BUILD_COST[b.type]*(b.footprint?.length||1)/4);t.city.treasury+=amount;record(t,'拆除回收建材',amount);}
export function dailyUpkeep(t){return t.buildings.filter(b=>b.stage>=3).reduce((n,b)=>n+buildingStats(b).upkeep,0)+t.publicWorks.reduce((n,r)=>n+UPKEEP[r.type],0)+((t.city.logisticsLevel||1)-1)*LOGISTICS_UPKEEP;}
export const householdTax=t=>Math.floor(t.people.filter(p=>p.home&&t.building(p.home)).length*3000*t.city.taxRate/100);
export const taxDemand=t=>managed(t)?Math.max(0,100+(10-t.city.taxRate)*5):100;
export function saleTax(t,good){if(!managed(t))return 0;const tax=Math.floor((GOODS_VALUE[good]||0)*t.city.taxRate/100);if(tax){t.city.treasury+=tax;t.city.taxIncome+=tax;record(t,'商品成交稅',tax);}return tax;}
export function settleBudget(t){const c=t.city,day=Math.floor(t.time/24);if(day<=c.day)return;if(!managed(t)){c.day=day;return;}const days=day-c.day,income=householdTax(t)*days,expense=dailyUpkeep(t)*days,before=c.treasury,net=(income-expense)/days;c.day=day;c.treasury+=income-expense;c.taxIncome+=income;c.maintenancePaid+=expense;c.deficitDays=c.treasury>=0?0:before<0?c.deficitDays+days:days-Math.floor(before/-net);record(t,`${days} 日住稅／維護費`,income-expense);}
export function setCityPolicy(t,{mode=t.city.mode,taxRate=t.city.taxRate}){if(!['managed','sandbox'].includes(mode)||!Number.isInteger(taxRate)||taxRate<0||taxRate>20)return false;const changed=t.city.mode!==mode;t.city.mode=mode;t.city.taxRate=taxRate;t.city.day=Math.floor(t.time/24);if(changed){t.city.fireDay=Math.floor(t.time/24);t.city.sanitationDay=Math.floor(t.time/24);for(const b of t.buildings)delete b.pendingWaste;}if(changed){t.rebuildRoads();t.revision++;}return true;}
