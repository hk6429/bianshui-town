import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TownScene} from '../src/scene.js';
import {Town} from '../src/simulation.js';
test('follow camera tracks a moving resident and holds the actual house when indoors',()=>{
 const t=new Town();t.demo();const p=t.people[0],s=Object.create(TownScene.prototype);
 s.camera=new THREE.OrthographicCamera();s.camera.position.set(10,20,30);s.camera.zoom=2;
 s.controls={target:new THREE.Vector3()};const model=new THREE.Group();model.position.set(5,0,7);s.personModels=new Map([[p.id,model]]);
 s.follow(p.id);for(let i=0;i<60;i++)s.updateFollow(t,1/60);assert(s.controls.target.distanceTo(new THREE.Vector3(5,0,7))<.02);
 model.position.set(9,0,12);for(let i=0;i<60;i++)s.updateFollow(t,1/60);assert(s.controls.target.distanceTo(new THREE.Vector3(9,0,12))<.02);assert.equal(s.camera.zoom,2);
 model.visible=false;const home=t.building(p.home);home.x=0;home.z=0;p.current=home.id;p.x=99;p.z=99;
 for(let i=0;i<120;i++)s.updateFollow(t,1/60);assert(s.controls.target.length()<.01);
 const before=s.camera.position.clone();s.follow(null);model.position.x=22;s.updateFollow(t,1);assert(s.camera.position.equals(before));
});
test('street focus cancels following and centers the exact event venue while preserving view angle',()=>{
 const s=Object.create(TownScene.prototype);s.camera=new THREE.OrthographicCamera();s.camera.position.set(10,20,30);s.controls={target:new THREE.Vector3(-2,0,4)};s.follow(9);
 const offset=s.camera.position.clone().sub(s.controls.target);s.focusAt([0,-16]);assert.equal(s.followId,null);assert.deepEqual(s.controls.target.toArray(),[0,0,-16]);assert(s.camera.position.clone().sub(s.controls.target).equals(offset));assert.equal(s.camera.zoom,2.2);
});
test('courtyard view looks down without moving the camera into the far fog',()=>{
 const s=Object.create(TownScene.prototype);s.camera=new THREE.OrthographicCamera();s.camera.position.set(41,53,65);s.controls={target:new THREE.Vector3(-7,0,0)};const distance=s.camera.position.distanceTo(s.controls.target);
 s.focusAt([-14,0],3,true);assert(Math.abs(s.camera.position.distanceTo(s.controls.target)-distance)<1e-8);assert.equal(s.camera.zoom,3);
});
