import {placementIssue,constructionPlan} from './construction-plan.js';
import {DESIGNS,gardenMergeGroups,designCategory} from './heritage.js';
import {CATEGORIES} from './categories.js';
import {lockedReason} from './milestones.js';
import {buildCost,moveCost,roadCost,affordable,managed} from './city-finance.js';
import {ROAD_TYPES,publicSquares} from './urban.js';
import {touchesRoad} from './road-network.js';
import {formatMoney} from './money.js';
export function previewPlan(t,{mode,design=null,editing=null},cells){
 let reason=null,cost=0,result='';
 if(editing?.kind==='move'){
  const b=t.building(editing.id);cost=b?moveCost(b):0;
  reason=!b?'原建築已不存在':b.stage<3?'建築尚未落成，不能搬移':placementIssue(t,cells,{ignore:b.id});
  result=b?`搬移「${b.name}」 · 占地${cells.length}格 · 1棟`:'';
 }else if(editing?.kind==='road'){
  reason=placementIssue(t,cells,{max:24,connected:false,allowRoad:true});
  if(editing.type==='erase'){const count=t.publicWorks.filter(p=>cells.some(c=>c.x===p.x&&c.z===p.z)).length;result=`移除${count}格自建道路`;if(!count)reason='所選格點沒有可移除的自建道路';}
  else{cost=roadCost(t,editing.type,cells);const roads=t.publicWorks.filter(p=>!cells.some(c=>c.x===p.x&&c.z===p.z)).concat(cells.map(c=>({...c,type:editing.type}))),added=publicSquares({...t,publicWorks:roads}).length-publicSquares(t).length;result=`${ROAD_TYPES[editing.type]} · 占地${cells.length}格${added>0?` · 新成${added}處街坊市心`:''}`;}
 }else{
  reason=placementIssue(t,cells);const plan=constructionPlan(mode,cells,design,t.nextId);reason=reason||plan.reason||lockedReason(t,plan.design);
  // 先有路才有街：沒有臨街的建築，人和貨都到不了。
  if(!reason&&!touchesRoad(t,cells))reason='旁邊沒有路：先鋪一條路連過來，人和車才走得到';cost=buildCost(mode,cells,plan.design);
  if(!plan.reason){const newIds=new Set(plan.buildings.map(b=>b.id)),merges=gardenMergeGroups([...t.buildings,...plan.buildings]).filter(parts=>parts.some(b=>newIds.has(b.id))),mergedIds=new Set(merges.flat().map(b=>b.id)),names=plan.buildings.filter(b=>!mergedIds.has(b.id)).map(b=>b.name).concat(merges.map(()=>DESIGNS.scholarGarden.name)),existing=merges.flat().filter(b=>!newIds.has(b.id)).length;
   result=`${[...new Set(names)].join('、')} · 占地${cells.length}格 · ${names.length}${mode==='garden'?'處'+(CATEGORIES[designCategory(plan.design)]||'園景'):'棟'}${existing?`（另合併既有${existing}格花園）`:''}`;
  }
 }
 if(!affordable(t,cost))reason=reason||`鎮庫不足：需要 ${formatMoney(cost)}，目前 ${formatMoney(t.city.treasury)}`;
 const price=managed(t)?`本次 ${formatMoney(cost)} · 鎮庫 ${formatMoney(t.city.treasury)}`:'自由營造 · 本次不扣款';
 return {valid:!reason,reason,cost,result,text:`${reason?'✕ 不可營造：'+reason:'✓ 可營造'}${result?' · '+result:''} · ${price}`};
}
