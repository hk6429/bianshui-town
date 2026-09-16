import {test} from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {TownScene} from '../src/scene.js';import {Town} from '../src/simulation.js';import {upgradeBuilding,layRoad,moveBuilding,demolishBuilding} from '../src/urban.js';
function scene(){const s=Object.create(TownScene.prototype);Object.assign(s,{scene:new THREE.Scene(),roads:new THREE.Group(),meadow:new THREE.Group(),decorations:[],buildingModels:new Map(),personModels:new Map(),cartModels:new Map(),lastRevision:-1});return s;}
function town(){const t=new Town();for(let x=-6;x<=0;x+=2)t.place('home',[{x,z:0}],true,'bambooHome');return t;}
test('single upgrade and stage transition preserve unrelated models, roads and meadow across restored town identities',()=>{
 let t=town();const s=scene();s.sync(t);const models=new Map(s.buildingModels),road=s.roads.children[0],meadow=s.meadow.children[0],id=t.buildings[0].id;
 t=Town.restore(t.toJSON());assert(upgradeBuilding(t,id));s.sync(t);assert.notEqual(s.buildingModels.get(id),models.get(id));for(const [other,m] of models)if(other!==id)assert.equal(s.buildingModels.get(other),m);assert.equal(s.roads.children[0],road);assert.equal(s.meadow.children[0],meadow);
 const id2=t.buildings[1].id;t.building(id2).stage=2;t.revision++;s.sync(t);assert.notEqual(s.buildingModels.get(id2),models.get(id2));assert.equal(s.roads.children[0],road);assert.equal(s.meadow.children[0],meadow);
 const prior=s.buildingModels.get(id2),copy=Town.restore(t.toJSON());copy.revision=t.revision;copy.building(id2).variant=2;s.sync(copy);assert.notEqual(s.buildingModels.get(id2),prior);assert.equal(s.roads.children[0],road);
});
test('road changes rebuild roads; move and demolish synchronize without rebuilding unchanged houses',()=>{
 const t=town(),s=scene();s.sync(t);const id=t.buildings[0].id,other=t.buildings[3].id,otherModel=s.buildingModels.get(other),road=s.roads.children[0];assert(layRoad(t,'avenue',[{x:1,z:1}]));s.sync(t);assert.notEqual(s.roads.children[0],road);assert.equal(s.buildingModels.get(other),otherModel);
 assert(moveBuilding(t,id,{x:-6,z:2}));s.sync(t);assert.equal(s.buildingModels.get(other),otherModel);assert(demolishBuilding(t,id));s.sync(t);assert(!s.buildingModels.has(id));assert.equal(s.buildingModels.get(other),otherModel);
});
test('model construction failure keeps existing model and allows rollback synchronization',()=>{
 const t=town(),s=scene();s.sync(t);const id=t.buildings[0].id,old=s.buildingModels.get(id),draft=Town.restore(t.toJSON());upgradeBuilding(draft,id);const build=s.buildHouse;s.buildHouse=()=>{throw Error('injected');};assert.throws(()=>s.sync(draft),/injected/);assert.equal(s.buildingModels.get(id),old);assert(old.children.length>0);s.buildHouse=build;s.sync(t);assert.equal(s.buildingModels.get(id),old);
});
