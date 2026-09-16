export const VIEW_KEY='bianshui-view-preferences-v1';
export const reducedMotion=(mode,systemReduced)=>mode==='reduce'||(mode!=='full'&&systemReduced);
export function readViewPreferences(storage){
 try{const value=JSON.parse(storage.getItem(VIEW_KEY));return {motion:['auto','reduce','full'].includes(value?.motion)?value.motion:'auto',labels:value?.labels===true};}catch{return {motion:'auto',labels:false};}
}
export function writeViewPreferences(storage,value){try{storage.setItem(VIEW_KEY,JSON.stringify(value));return true;}catch{return false;}}
export const BUILDING_CATEGORIES={home:{mark:'居',name:'民居'},shop:{mark:'商',name:'商鋪'},work:{mark:'工',name:'作坊'},garden:{mark:'園',name:'園景／公設'}};
export function categoryFor(building){return BUILDING_CATEGORIES[building.type]||{mark:'建',name:'建築'};}
