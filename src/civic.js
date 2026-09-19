import {commuteDistance} from './employment.js';
import {buildingStats} from './building-tiers.js';
import {serviceEfficiency} from './public-services.js';

// 宋代鎮級沒有市政廳：監鎮官帶著商稅務、酒務與遞鋪治事。這裡只放「官署帶來什麼效果」。
const working=b=>b.stage>=3&&!((b?.fireDamage||0)>0);
export const civicBuildings=(t,design)=>t.buildings.filter(b=>b.design===design&&working(b));
export const hasCivic=(t,design)=>civicBuildings(t,design).length>0;

// 過稅二分：商稅務落成後，每筆成交額外抽 2% 入鎮庫。
export const TRANSIT_TAX=2;
export const transitTaxRate=t=>hasCivic(t,'taxOffice')?TRANSIT_TAX:0;

// 榷酤：酒務按鎮上酒樓與食肆數目抽錢，每處每日 2250 文。
export const WINE_EXCISE_PER_SHOP=2250;
export const wineShops=t=>t.buildings.filter(b=>b.type==='shop'&&working(b)&&['wine','food','cakeShop','tea'].includes(b.design)).length;
export const wineExcise=t=>hasCivic(t,'wineOffice')?Math.floor(wineShops(t)*WINE_EXCISE_PER_SHOP*serviceEfficiency(t)):0;

// 河津碼頭：每處讓腳夫每趟多搬一件，四格算兩件，最多加三件。
export const dockBonus=t=>Math.min(3,civicBuildings(t,'dock').reduce((n,b)=>n+(b.footprint?2:1),0));

// 水碾磨：沿路範圍內的作坊加工速度加一成，多座不疊加。
export const MILL_BONUS=.1;
export function millMultiplier(t,b){
 if(b.type!=='work')return 1;
 const mills=civicBuildings(t,'watermill');
 return mills.some(m=>commuteDistance(t,{home:b.id},m)<=buildingStats(m).range)?1+MILL_BONUS:1;
}

// 義倉：每處儲糧可抵銷一次災害，四格算兩次。
export const granaryStores=t=>civicBuildings(t,'granary').reduce((n,b)=>n+(b.footprint?2:1),0);

export const hasGovernment=t=>hasCivic(t,'townOffice');
export const hasPost=t=>hasCivic(t,'postStation');
