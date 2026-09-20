import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {stageEntries} from '../src/stage-select.js';

test('ten selectable stages count actual reading, scenes and completed landmark; five tiers are optional',()=>{const t=new Town();let rows=stageEntries(t);assert.equal(rows.length,10);assert.equal(rows.filter(x=>x.complete).length,0);t.journey.literary={yueyang:{step:4,note:'',activity:{stage:3,selection:[],visited:[]}}};assert.equal(stageEntries(t)[0].complete,false);t.buildings.push({design:'yueyangTower',stage:2,tier:1});assert.equal(stageEntries(t)[0].complete,false);t.buildings[0].stage=3;rows=stageEntries(t);assert.equal(rows[0].complete,true);assert.equal(rows[0].progress,7);assert.equal(rows[0].tier,1);});
