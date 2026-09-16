import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NoticeHistory} from '../src/notices.js';
import {constructionProgress,constructionPercent,lotButton} from '../src/content-html.js';
test('notices retain failure reasons past the toast timeout, in newest-first bounded order',()=>{
 const h=new NoticeHistory(30);h.add('第（3、2）格超出範圍',1000);h.add('金庫不足，需120文',7000);
 assert.equal(h.entries[1].text,'第（3、2）格超出範圍');assert.equal(h.entries[1].at,1000);
 for(let n=0;n<40;n++)h.add(`操作${n}`,10000+n);
 assert.equal(h.entries.length,30);assert.equal(h.entries[0].text,'操作39');assert.equal(h.entries[29].text,'操作10');assert.equal(new Set(h.entries.map(e=>e.id)).size,30);
});
test('construction semantics match the visible percentage and do not create a live announcement stream',()=>{
 const b={name:'<雅居>',born:20};for(const [elapsed,value] of [[19,0],[20,0],[29,50],[37.9,99],[38,100],[60,100]]){
  assert.equal(constructionPercent(b,elapsed),value);const html=constructionProgress(b,elapsed);
  assert(html.includes(`aria-valuenow="${value}"`));assert(html.includes(`施工進度 ${value}%`));assert(html.includes('aria-live="off"'));assert(html.includes('&lt;雅居&gt;'));
 }
});
test('each cargo selector exposes a toggled state and the controlled detail region',()=>{
 const html=lotButton({id:2,good:'cloth'},'店內');assert(html.includes('data-lot="2"'));assert(html.includes('aria-pressed="false"'));assert(html.includes('aria-controls="lot-detail"'));
});
