export const TYPES={home:'民居',shop:'商鋪',work:'作坊',garden:'園景'};
export const bounds={minX:-8,maxX:2,minZ:-6,maxZ:6};
// 買地擴城：每買一區，西側加兩列、南北各加一列（東側是汴河，不能再往外推）。
export const MAX_EXPANSION=3;
export const EXPANSION_COST=120000;
export const expansionOf=t=>Math.max(0,Math.min(MAX_EXPANSION,Math.trunc(t?.city?.expansion||0)));
export const townBounds=t=>{const n=expansionOf(t);return {minX:bounds.minX-n*2,maxX:bounds.maxX,minZ:bounds.minZ-n,maxZ:bounds.maxZ+n};};
export const MAX_BOUNDS=townBounds({city:{expansion:MAX_EXPANSION}});
export const boundsCells=b=>(b.maxX-b.minX+1)*(b.maxZ-b.minZ+1);
export const MAX_CELLS=boundsCells(MAX_BOUNDS);
export const landCost=t=>EXPANSION_COST*(expansionOf(t)+1);
