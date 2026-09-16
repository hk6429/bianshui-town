import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sceneCommand,stepCursor} from '../src/scene-keyboard.js';
import {TownScene} from '../src/scene.js';
import * as THREE from 'three';
const scene={},event=(key,extra={})=>({key,code:key===' '?'Space':key,target:scene,...extra});
test('native controls, shortcuts with modifiers, and IME never change the scene',()=>{
 for(const tag of ['BUTTON','A','INPUT','TEXTAREA','SELECT','SUMMARY'])for(const key of [' ','Enter','ArrowLeft','2','q'])assert.equal(sceneCommand(event(key,{target:{tagName:tag}}),scene),null);
 for(const flag of ['isComposing','ctrlKey','altKey','metaKey'])assert.equal(sceneCommand(event(' ',{[flag]:true}),scene),null);
 assert.equal(sceneCommand(event('Enter',{repeat:true}),scene),null);assert.equal(sceneCommand(event(' ',{repeat:true}),scene),null);
 assert.deepEqual(sceneCommand(event(' '),scene),{type:'pause'});assert.deepEqual(sceneCommand(event('Enter'),scene),{type:'submit'});
});
test('keyboard cursor traverses all four axes and stays inside the buildable map',()=>{
 const bounds={minX:-9,maxX:3,minZ:-5,maxZ:5};let c={x:0,z:0};
 for(const key of ['ArrowRight','d'])c=stepCursor(c,sceneCommand(event(key),scene).direction,bounds);
 assert.deepEqual(c,{x:2,z:0});
 for(const key of ['ArrowLeft','a','ArrowUp','w','ArrowDown','s'])c=stepCursor(c,sceneCommand(event(key),scene).direction,bounds);
 assert.deepEqual(c,{x:0,z:0});
 for(let i=0;i<100;i++)c=stepCursor(c,[-1,1],bounds);assert.deepEqual(c,{x:-9,z:5});
 for(let i=0;i<100;i++)c=stepCursor(c,[1,-1],bounds);assert.deepEqual(c,{x:3,z:-5});
});
test('camera pan preserves viewing offset, clamps edges and leaves city state untouched',()=>{
 const target=new THREE.Vector3(-7,0,0),position=new THREE.Vector3(40,50,60),initialOffset=position.clone().sub(target),scene={camera:{position},controls:{target,update(){}}};
 for(const [x,z] of [[1,0],[-1,0],[0,1],[0,-1]]){TownScene.prototype.pan.call(scene,x,z);assert.deepEqual(position.clone().sub(target),initialOffset);}
 assert.deepEqual(target.toArray(),[-7,0,0]);for(let i=0;i<100;i++)TownScene.prototype.pan.call(scene,1,-1);assert.deepEqual(target.toArray(),[40,0,-45]);assert.deepEqual(position.clone().sub(target),initialOffset);
});
