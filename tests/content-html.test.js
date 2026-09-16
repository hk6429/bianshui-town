import {test} from 'node:test';import assert from 'node:assert/strict';
import {lotIdentity,lotButton,lotFocusButton,stallListItem,stallDetails} from '../src/content-html.js';
const payload='"><img src=x onerror="alert(1)"><script>alert(2)</script>';
test('unvalidated cargo and market values are escaped in text and quoted attributes',()=>{
 const lot={id:payload,good:payload},stall={id:payload,name:payload,goods:payload,venue:payload};
 for(const html of [lotIdentity(lot),lotButton(lot,payload),lotFocusButton(lot),stallListItem(stall),stallDetails(stall,payload,true)]){
  assert(!html.includes('<img'));assert(!html.includes('<script>'));assert(html.includes('&lt;img'));assert(html.includes('&quot;'));
 }
});
test('ordinary cargo labels and market counters keep readable content',()=>{
 assert.equal(lotIdentity({id:12,good:'cloth'}),'#12 布匹');assert(lotButton({id:12,good:'cloth'},'茶坊').includes('data-lot="12"'));
 assert(stallDetails({name:'茶攤',goods:'茶湯',venue:'橋頭'},3,true).includes('小鎮累計 3 次攤前選購'));
});
