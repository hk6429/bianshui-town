import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {editTown} from '../src/town-edit.js';import {layRoad,moveBuilding,demolishBuilding,upgradeBuilding} from '../src/urban.js';
const edits={place:t=>t.place('home',[{x:1,z:5}],true),road:t=>layRoad(t,'lane',[{x:1,z:5}]),move:t=>moveBuilding(t,t.buildings[0].id,{x:1,z:5}),upgrade:t=>upgradeBuilding(t,t.buildings[0].id),demolish:t=>demolishBuilding(t,t.buildings[0].id)};
for(const [name,edit] of Object.entries(edits))for(const failure of ['refresh','render','storage'])test(`${name}: ${failure} failure preserves complete town and disk`,()=>{
 const town=new Town();town.demo();for(let i=0;i<30;i++)town.tick(.05);const before=JSON.stringify(town),roads=[...town.roads];let disk=before,writes=0;
 const result=editTown(town,draft=>{if(failure==='refresh')draft.rebuildRoads=()=>{throw Error('refresh failed');};return edit(draft);},{prepare:()=>{if(failure==='render')throw Error('render failed');},persist:data=>{writes++;if(failure==='storage')return {ok:false};disk=JSON.stringify(data);return {ok:true};}});
 assert(!result.ok);assert(result.error);assert.strictEqual(result.town,town);assert.equal(JSON.stringify(town),before);assert.deepEqual([...town.roads],roads);assert.equal(disk,before);assert.equal(writes,failure==='storage'?1:0);
});
test('successful edit publishes once with detached undo and original residents/cargo untouched',()=>{
 const town=new Town();town.demo();let writes=0;const before=town.toJSON();const result=editTown(town,t=>demolishBuilding(t,t.buildings[0].id),{persist:data=>{writes++;assert.doesNotThrow(()=>Town.restore(data));return {ok:true};}});
 assert(result.ok);assert.equal(writes,1);assert.equal(result.town.buildings.length,town.buildings.length-1);assert.deepEqual(town.toJSON(),before);assert.deepEqual(result.before,before);result.town.people[0].name='new';assert.notEqual(result.before.people[0].name,'new');
});
test('rejected placement does not call prepare or persist',()=>{const t=new Town();t.demo();const result=editTown(t,d=>d.place('home',[{x:99,z:99}]),{prepare:()=>assert.fail(),persist:()=>assert.fail()});assert(!result.ok);assert(!result.error);assert.strictEqual(result.town,t);});
test('whole-town undo after 60 simulated seconds restores exactly the disclosed pre-edit point',()=>{
 const town=new Town();town.demo();const edited=editTown(town,t=>moveBuilding(t,t.buildings[0].id,{x:1,z:5}));assert(edited.ok);
 const target=edited.before;for(let i=0;i<1200;i++)edited.town.tick(.05);assert(edited.town.elapsed-target.elapsed>59.9);
 const undone=editTown(edited.town,draft=>{Object.assign(draft,Town.restore(target));return true;});assert(undone.ok);assert.deepEqual(undone.town.toJSON(),target);
});
