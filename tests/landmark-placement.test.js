import test from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {squareCells} from '../src/heritage.js';
import {LANDMARK_QUEST} from '../src/literary-quests.js';
import {previewPlan} from '../src/plan-preview.js';
import {layRoad,moveBuilding} from '../src/urban.js';
import {landmarkPlacementIssue} from '../src/landmark-placement.js';
const square=(x,z)=>squareCells({x,z});
function town(mode='sandbox'){const t=new Town({mode});t.city.treasury=10000000;t.journey.literary=Object.fromEntries(Object.values(LANDMARK_QUEST).map(id=>[id,{step:4,note:''}]));return t;}
test('all ten landmarks share preview/build/move roads; sandbox automatically connects',()=>{
 for(const design of Object.keys(LANDMARK_QUEST))for(const mode of ['managed','sandbox']){
  const t=town(mode),cells=square(1,-5);t.roads.clear();const before=JSON.stringify(t.toJSON());
  assert.equal(previewPlan(t,{mode:'garden',design},cells).valid,mode==='sandbox');
  if(mode==='managed'){assert.equal(t.place('garden',cells,true,design),null);assert.equal(JSON.stringify(t.toJSON()),before);assert(layRoad(t,'lane',[{x:0,z:-5}]));}
  assert(previewPlan(t,{mode:'garden',design},cells).valid);assert(t.place('garden',cells,true,design));const b=t.buildings.at(-1),editing={kind:'move',id:b.id},target=square(1,4);
  t.roads.clear();const saved=JSON.stringify(t.toJSON());assert.equal(previewPlan(t,{editing},target).valid,mode==='sandbox');
  if(mode==='managed'){assert.equal(moveBuilding(t,b.id,{x:1,z:4}),false);assert.equal(JSON.stringify(t.toJSON()),saved);assert(layRoad(t,'lane',[{x:0,z:4}]));}
  assert(previewPlan(t,{editing},target).valid);assert(moveBuilding(t,b.id,{x:1,z:4}));
 }
});
test('Yueyang requires easternmost plots or edge-adjacent completed water; no diagonal or unfinished substitute',()=>{
 const cells=square(-5,0),t=town();
 assert(landmarkPlacementIssue(t,'yueyangTower',cells));assert(landmarkPlacementIssue(t,'yueyangTower',square(0,0)));assert.equal(landmarkPlacementIssue(t,'yueyangTower',square(1,0)),null);
 for(const design of ['pond','virtueLotus','redcliffBoat','creekLotus']){
  const water={design,stage:3,x:-3,z:0,...(design==='pond'?{}:{footprint:square(-3,0)})};t.buildings=[water];assert.equal(landmarkPlacementIssue(t,'yueyangTower',cells),null);
  water.stage=2;assert(landmarkPlacementIssue(t,'yueyangTower',cells));
 }
 t.buildings=[{design:'pond',stage:3,x:-3,z:2}];assert(landmarkPlacementIssue(t,'yueyangTower',cells));
 t.buildings=[{design:'granary',stage:4,x:-3,z:0}];assert(landmarkPlacementIssue(t,'yueyangTower',cells));
});
test('water rejection is atomic and legacy inland buildings retain tier on restore',()=>{
 const t=town();assert(t.place('garden',square(-5,0),true,'moonTerrace'));const b=t.buildings[0];b.design='yueyangTower';b.tier=5;
 const restored=Town.restore(t.toJSON());assert.equal(restored.buildings[0].tier,5);assert.equal(restored.buildings[0].design,'yueyangTower');
 restored.city.mode='managed';const cells=square(-2,3);assert(layRoad(restored,'lane',[{x:-3,z:3}]));const before=JSON.stringify(restored.toJSON());
 assert.match(previewPlan(restored,{mode:'garden',design:'yueyangTower'},cells).reason,/臨河/);assert.equal(restored.place('garden',cells,true,'yueyangTower'),null);
 assert.equal(previewPlan(restored,{editing:{kind:'move',id:b.id}},cells).valid,false);assert.equal(moveBuilding(restored,b.id,{x:-2,z:3}),false);assert.equal(JSON.stringify(restored.toJSON()),before);
 assert(restored.place('garden',[{x:0,z:3}],true,'pond'));assert(previewPlan(restored,{editing:{kind:'move',id:b.id}},cells).valid);assert(moveBuilding(restored,b.id,{x:-2,z:3}));assert.equal(restored.building(b.id).tier,5);
});
