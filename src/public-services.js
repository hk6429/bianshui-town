import {managed} from './city-finance.js';

// Debt cuts operating capacity gradually; solvency restores service immediately.
export const serviceEfficiency=t=>managed(t)&&t.city.treasury<0?Math.max(.25,1-.25*Math.max(1,t.city.deficitDays)):1;
// 只服務、不供人遊憩的設施：不計園景宜居，也不列入火警風險名單。
export const UTILITY_DESIGNS=['well','cleaningYard','firePost','townOffice','taxOffice','wineOffice','postStation','dock','granary','watermill'];
export const isUtility=b=>UTILITY_DESIGNS.includes(b.design);
