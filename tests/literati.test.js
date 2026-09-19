import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town,key} from '../src/simulation.js';
import {AUTHORS} from '../src/literati-data.js';
import {setWeather} from '../src/weather.js';
const run=(t,s)=>{for(let i=0;i<s*4;i++)t.tick(.25);};
test('five named authors arrive, walk real roads, stop to write and collect unique originals',()=>{
 const t=new Town();t.demo();setWeather(t,'clear');run(t,180);assert.equal(t.literati.actors.length,5);assert.equal(t.literati.collected.length,5);assert.equal(new Set(t.literati.collected.map(x=>x.author)).size,5);
 for(const a of t.literati.actors){assert(a.visits>=2);for(const p of a.route)assert(t.roads.has(key(...p)));assert(!t.people.some(p=>p.id===a.id));}
 run(t,180);assert.equal(t.literati.collected.length,5);
});
test('rain pauses writing, zero dt pauses everything, and night hides the visitors',()=>{
 const t=new Town();t.demo();setWeather(t,'clear');for(let i=0;i<800&&!t.literati.actors.some(a=>a.phase==='writing');i++)t.tick(.25);const a=t.literati.actors.find(a=>a.phase==='writing');assert(a);setWeather(t,'rain');const before=a.progress;run(t,2);assert.equal(a.progress,before);const snapshot=JSON.stringify(t);t.tick(0);assert.equal(JSON.stringify(t),snapshot);t.time=23.1;t.tick(.25);assert(t.literati.actors.every(a=>!a.visible));
});
test('v5 migration and v6 reload preserve freight, literature and road changes do not strand authors',()=>{
 const t=new Town();t.demo();run(t,80);const old=JSON.parse(JSON.stringify(t));old.version=5;delete old.literati;const r=Town.restore(old);assert.equal(r.literati.actors.length,0);assert.deepEqual(r.economy,old.economy);
 setWeather(t,'clear');run(t,180);const data=JSON.parse(JSON.stringify(t)),restored=Town.restore(data);assert.equal(restored.toJSON().version,10);assert.deepEqual(restored.literati.collected,t.literati.collected);restored.place('home',[{x:-8,z:6}],true);run(restored,100);for(const a of restored.literati.actors)for(const p of a.route)assert(restored.roads.has(key(...p)));
});
test('all five entries have attributed original texts, form labels and HTTPS source links',()=>{assert.equal(AUTHORS.length,5);assert.equal(new Set(AUTHORS.map(a=>a.id)).size,5);for(const a of AUTHORS){assert(a.text.length>60);assert(a.url.startsWith('https://zh.wikisource.org/'));assert(a.form.includes('全文')||a.form.includes('節錄'));assert(a.text.replace(/[。，；、！？」『「』\s]/g,'').includes(a.quote.replace(/[。，；、！？」『「』\s]/g,'')));}});
