import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {transfer} from '../src/production.js';import {residentPurchase,shopIsOpen,shopStatus} from '../src/commerce.js';import {tickLife} from '../src/life.js';
function setup(mode="managed"){const t=new Town();t.place('home',[{x:0,z:0},{x:1,z:0}],true);t.place('shop',[{x:-3,z:0}],true);t.tick(.05);t.time=12;t.city.mode=mode;const shop=t.buildings.find(b=>b.type==='shop'),[staff,buyer]=t.people;staff.work=shop.id;staff.current=shop.id;staff.outside=false;buyer.work=null;buyer.current=shop.id;buyer.outside=false;const lot=t.economy.lots[0];lot.good='cloth';transfer(t,'boat',`shop:${shop.id}`,1,'cloth');return {t,shop,staff,buyer};}
test('resident at staffed shop buys one available item, records needs and cannot repeat in same tick',()=>{const {t,shop,buyer}=setup(),before=t.life.dock.sold;assert(residentPurchase(t,buyer));assert.equal(shop.stock,0);assert.equal(t.life.dock.sold,before+1);assert.equal(t.economy.sold.cloth,1);assert(buyer.needsSatisfiedUntil>t.elapsed);assert(!residentPurchase(t,buyer));assert.equal(t.life.dock.sold,before+1);assert.doesNotThrow(()=>Town.restore(t.toJSON()));});
test('no remote, off-hours, empty-stock or unattended sales',()=>{
 for(const change of [x=>x.buyer.outside=true,x=>x.t.time=10,x=>transfer(x.t,`shop:${x.shop.id}`,'dock',1),x=>{for(const p of x.t.people)if(p.work===x.shop.id)p.outside=true;}]){const x=setup();change(x);const before=x.t.economy.sold.cloth||0;assert(!residentPurchase(x.t,x.buyer));assert.equal(x.t.economy.sold.cloth||0,before);}
});
test('shop staff may buy at their own counter, so they are not stuck unserved',()=>{const {t,shop,buyer}=setup();buyer.work=shop.id;assert(residentPurchase(t,buyer),'夥計應該能在自己的店裡買到日用品');});

test('visitor obeys the same staffing rule; arrivals reopen and departures close the shop',()=>{const {t,shop}=setup();for(const p of t.people)if(p.work===shop.id)p.outside=true;const a={id:2000,kind:'shopper',x:shop.entrance[0],z:shop.entrance[1],route:[],walking:false,wait:0,phase:'browse',speed:1,target:shop.id};t.life.visitors=[a];assert(!shopIsOpen(t,shop));tickLife(t,.01);assert.equal(shop.stock,1);assert.equal(t.economy.sold.cloth||0,0);
 const worker=t.workers(shop)[0];worker.outside=false;worker.current=shop.id;a.wait=0;assert(shopIsOpen(t,shop));tickLife(t,.01);assert.equal(shop.stock,0);assert.equal(t.economy.sold.cloth,1);worker.outside=true;assert(!shopIsOpen(t,shop));assert(shopStatus(t,shop).includes('暫停營業'));
});

test("sandbox residents do not consume stock or gain new needs state",()=>{const {t,buyer}=setup("sandbox"),before=structuredClone(t.toJSON());assert.equal(residentPurchase(t,buyer),false);assert.deepEqual(t.toJSON(),before);});
