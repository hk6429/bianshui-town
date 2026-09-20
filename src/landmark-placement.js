import {LANDMARK_QUEST} from './literary-quests.js';
import {bounds} from './grid-rules.js';
import {managed} from './city-finance.js';
import {touchesRoad} from './road-network.js';

const waterGardens=new Set(['virtueLotus','redcliffBoat','creekLotus']);
// 東緣建地 x=2，隔河岸引道面向汴河；河水西緣為世界 x=14+sin(z*.045)*3。
// 採城鎮東側臨河地帶，而非要求建築占地伸進不可營造的河面。
export function landmarkPlacementIssue(t,design,cells){
 if(!LANDMARK_QUEST[design])return null;
 if(design==='yueyangTower'&&!cells.some(c=>c.x===bounds.maxX)){
  const waters=t.buildings.filter(b=>b.stage>=3&&(b.design==='pond'||waterGardens.has(b.design)&&b.footprint?.length===4));
  if(!waters.some(b=>(b.footprint||[{x:b.x,z:b.z}]).some(w=>cells.some(c=>Math.abs(c.x-w.x)+Math.abs(c.z-w.z)===1))))return '岳陽樓須位於城鎮東側臨河地帶，或緊鄰已落成的池塘、愛蓮池、赤壁文舟、溪亭荷塘';
 }
 // 自由營造由 rebuildRoads 自動接路；經營模式須先有路。僅於新建／搬移驗證。
 if(managed(t)&&!touchesRoad(t,cells))return '旁邊沒有路：先鋪一條路連過來，人和車才走得到';
 return null;
}
