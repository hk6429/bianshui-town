import {test} from 'node:test';import assert from 'node:assert/strict';
import {appearanceKey,tierAppearance,TIER_APPEARANCES} from '../src/tier-appearance.js';
import {NEW_DESIGNS} from '../src/variety.js';
import {TownScene} from '../src/scene.js';import {squareCells} from '../src/heritage.js';import {createHash} from 'node:crypto';
test('all ten signature designs retain distinct upgrade routes at every level',()=>{
 for(let tier=2;tier<=5;tier++){const labels=new Set(),hashes=new Set();for(const [design,d]of Object.entries(NEW_DESIGNS)){const b={id:1,design,type:d.type,variant:d.variant,stage:4,tier,x:0,z:0,facing:0,footprint:squareCells({x:0,z:0})};labels.add(tierAppearance(b));const m=TownScene.prototype.buildHouse.call({},b),h=createHash('sha256');m.traverse(o=>{if(o.geometry?.attributes.position)h.update(Buffer.from(o.geometry.attributes.position.array.buffer));});hashes.add(h.digest('hex'));assert.equal(m.userData.upgradeProfile,design);}assert.equal(labels.size,10);assert.equal(hashes.size,10);}
});
test('each route adds four different features; utilities and landscapes keep their own purpose',()=>{
 for(const p of Object.values(TIER_APPEARANCES)){assert.equal(p.features.length,4);assert.equal(new Set(p.features).size,4);assert.equal(new Set(p.labels).size,4);}
 assert.equal(appearanceKey({type:'work',variant:2}),'dyeHouse');assert.match(tierAppearance({design:'pond'},5),/荷心亭/);assert.match(tierAppearance({design:'well'},5),/轆轤/);assert.match(tierAppearance({design:'firePost'},5),/望火/);
});
