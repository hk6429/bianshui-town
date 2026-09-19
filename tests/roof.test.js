import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TownScene} from '../src/scene.js';
import {roofTone} from '../src/roof-colors.js';
test('roof surfaces survive merging with indexed tile ribs',()=>{
 const b={id:1,x:0,z:0,facing:0,variant:0,type:'home',stage:2};
 const model=TownScene.prototype.buildHouse.call({},b);
 const roof=model.children.find(m=>m.material.color.getHex()===roofTone(b));
 assert(roof,'sloped roof geometry must be present');
 roof.geometry.computeBoundingBox();
 assert(roof.geometry.boundingBox.max.y>2.8,'roof ridge must rise above walls');
 assert(roof.geometry.getAttribute('position').count>36,'roof and tile ribs must both survive');
});
