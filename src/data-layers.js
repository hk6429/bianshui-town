import {bounds} from './grid-rules.js';
import {buildingStats} from './building-tiers.js';
import {isLeisureGarden} from './garden-services.js';
import {pollutionAt} from './pollution.js';
import {wellbeingReport} from './wellbeing.js';
import {isSchool} from './heritage.js';
import {footprint} from './urban.js';

// 資料圖層：把已經在跑的服務模型畫到地面上。覆蓋率以格數 ×4 步估算直線距離，
// 實際服務仍以沿路步程計算，所以圖層是概況，不是精確判定。
const working=b=>b.stage>=3&&!((b?.fireDamage||0)>0);
export const townCells=(t,limit=bounds)=>{const cells=[];for(let x=limit.minX;x<=limit.maxX;x++)for(let z=limit.minZ;z<=limit.maxZ;z++)cells.push({x,z});return cells;};
function coverage(t,match,cells){
 const sources=t.buildings.filter(b=>working(b)&&match(b));
 return cells.map(c=>{
  let best=0;
  for(const b of sources){
   const range=buildingStats(b).range,steps=Math.min(...footprint(b).map(p=>(Math.abs(p.x-c.x)+Math.abs(p.z-c.z))*4));
   if(steps<=range)best=Math.max(best,1-steps/(range+4));
  }
  return {...c,value:best};
 });
}
export const LAYERS={
 pollution:{name:'生產污染',color:[0xb5644c],note:'越紅表示作坊排放越重；污染降低居住環境分數。',
  read:(t,cells)=>cells.map(c=>({...c,value:Math.min(1,pollutionAt(t,c)/60)}))},
 water:{name:'街坊供水',color:[0x4b82a8],note:'水井沿路供水範圍；新住戶要有供水空位才會遷入。',
  read:(t,cells)=>coverage(t,b=>b.design==='well',cells)},
 sanitation:{name:'街道清運',color:[0x6d8b5a],note:'街道司的清運範圍；未清運的髒污會拖低健康。',
  read:(t,cells)=>coverage(t,b=>b.design==='cleaningYard',cells)},
 patrol:{name:'軍巡防火',color:[0xc08a3e],note:'軍巡鋪巡守範圍；範圍外的建築火警機率與損害較高。',
  read:(t,cells)=>coverage(t,b=>b.design==='firePost',cells)},
 education:{name:'文教覆蓋',color:[0x8a6bb0],note:'村塾、鎮學與書院的覆蓋；住宅在範圍內才會累積學力。',
  read:(t,cells)=>coverage(t,isSchool,cells)},
 garden:{name:'園景宜居',color:[0x5aa07a],note:'園景與祠廟的可達範圍；多處效益遞減，上限20。',
  read:(t,cells)=>coverage(t,isLeisureGarden,cells)},
 wellbeing:{name:'民生滿意',color:[0xd2a03c],note:'只標住宅：越亮表示該戶住戶的民生滿意越低，需要處理。',
  read:(t,cells)=>{
   const report=wellbeingReport(t),byCell=new Map();
   for(const b of t.buildings.filter(b=>b.type==='home'&&working(b))){
    const residents=t.people.filter(p=>p.home===b.id);
    if(!residents.length)continue;
    const score=residents.reduce((n,p)=>n+(report.residents.get(p.id)?.score??50),0)/residents.length;
    for(const c of footprint(b))byCell.set(`${c.x},${c.z}`,Math.max(0,Math.min(1,(100-score)/60)));
   }
   return cells.map(c=>({...c,value:byCell.get(`${c.x},${c.z}`)||0}));
  }}
};
export const LAYER_KEYS=Object.keys(LAYERS);
export function layerTiles(t,key,limit=bounds){
 const layer=LAYERS[key];if(!layer)return [];
 return layer.read(t,townCells(t,limit)).filter(c=>c.value>.02).map(c=>({x:c.x,z:c.z,color:layer.color[0],opacity:Math.min(.55,.1+c.value*.45)}));
}
