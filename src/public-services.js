import {managed} from './city-finance.js';

// Debt cuts operating capacity gradually; solvency restores service immediately.
export const serviceEfficiency=t=>managed(t)&&t.city.treasury<0?Math.max(.25,1-.25*Math.max(1,t.city.deficitDays)):1;
export const isUtility=b=>['well','cleaningYard','firePost'].includes(b.design);
