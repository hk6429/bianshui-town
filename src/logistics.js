import {charge,LOGISTICS_UPKEEP} from './city-finance.js';
import {dockBonus} from './civic.js';
export const MAX_LOGISTICS_LEVEL=3;
export function logistics(t){const level=t.city.logisticsLevel||1;return {level,porters:level+1,oxen:level,porterLoad:level+dockBonus(t),oxLoad:level*2+1,upkeep:(level-1)*LOGISTICS_UPKEEP,upgradeCost:level<MAX_LOGISTICS_LEVEL?level*45000:0};}
export function upgradeLogistics(t){const q=logistics(t);if(q.level>=MAX_LOGISTICS_LEVEL||!charge(t,q.upgradeCost,'貨棧物流升級'))return false;t.city.logisticsLevel=q.level+1;t.log(`貨棧物流升至 ${q.level+1} 級`);return true;}
