import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TownScene} from '../src/scene.js';
import {WeatherScene} from '../src/weather-scene.js';
import {VIEW_KEY,reducedMotion,readViewPreferences,writeViewPreferences,categoryFor} from '../src/view-preferences.js';

test('system preference is followed unless the player explicitly overrides it; invalid settings recover',()=>{
 for(const system of [true,false]){assert.equal(reducedMotion('auto',system),system);assert.equal(reducedMotion('reduce',system),true);assert.equal(reducedMotion('full',system),false);}
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 assert.deepEqual(readViewPreferences(storage),{motion:'auto',labels:false});
 writeViewPreferences(storage,{motion:'reduce',labels:true});assert.deepEqual(readViewPreferences(storage),{motion:'reduce',labels:true});
 values.set(VIEW_KEY,'not json');assert.deepEqual(readViewPreferences(storage),{motion:'auto',labels:false});
 assert.equal(writeViewPreferences({setItem(){throw Error('quota');}},{motion:'reduce'}),false);
 assert.deepEqual([...values.keys()],[VIEW_KEY]);
});
test('reduced-motion following locates once without easing and then leaves the camera stationary',()=>{
 const view={camera:{position:new THREE.Vector3(10,20,30)},controls:{target:new THREE.Vector3(),enableDamping:true},personModels:new Map([[7,{visible:true,position:new THREE.Vector3(12,0,8)}]])};
 const town={people:[{id:7}],building:()=>null};
 TownScene.prototype.setReducedMotion.call(view,true);TownScene.prototype.follow.call(view,7);
 TownScene.prototype.updateFollow.call(view,town,.016);assert.deepEqual(view.controls.target.toArray(),[12,0,8]);assert.equal(view.controls.enableDamping,false);
 view.personModels.get(7).position.set(20,0,10);TownScene.prototype.updateFollow.call(view,town,1);assert.deepEqual(view.controls.target.toArray(),[12,0,8]);
 TownScene.prototype.setReducedMotion.call(view,false);TownScene.prototype.updateFollow.call(view,town,.016);assert(view.controls.target.x>12&&view.controls.target.x<20);assert.equal(view.controls.enableDamping,true);
});
test('rain visuals stop updating while rain state and simulation data are preserved',()=>{
 const owner={scene:new THREE.Scene(),personModels:new Map(),lifeScene:{actors:new Map()},reducedMotion:false};
 const visual=new WeatherScene(owner),town={elapsed:1,weather:{raining:true},people:[],life:{visitors:[],porters:[]}};
 visual.update(town);assert.equal(visual.rain.visible,true);const positions=Array.from(visual.positions);
 owner.reducedMotion=true;town.elapsed=2;const before=JSON.stringify(town);visual.update(town);assert.equal(visual.rain.visible,false);assert.deepEqual(Array.from(visual.positions),positions);assert.equal(JSON.stringify(town),before);
 owner.reducedMotion=false;visual.update(town);assert.equal(visual.rain.visible,true);assert.notDeepEqual(Array.from(visual.positions),positions);
 visual.rain.geometry.dispose();visual.rain.material.dispose();
});
test('mixed neighborhoods have distinct text categories independent of color',()=>{
 assert.deepEqual(['home','shop','work','garden'].map(type=>categoryFor({type}).name),['民居','商鋪','作坊','園景／公設']);
 assert.equal(new Set(['home','shop','work','garden'].map(type=>categoryFor({type}).mark)).size,4);
});
