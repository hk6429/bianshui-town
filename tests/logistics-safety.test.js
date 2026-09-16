import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town,key} from '../src/simulation.js';
import {GATE,tickLife,rerouteLife} from '../src/life.js';
import {transfer,importCargo,goodsBalance,syncCargo,tickProduction} from '../src/production.js';

function visitorTown(){
 const t=new Town();t.place('shop',[{x:0,z:0}],true);const shop=t.buildings[0];
 const lot=t.economy.lots[0];lot.good='cloth';transfer(t,'boat',`shop:${shop.id}`,1,'cloth');
 t.life.visitors=[{id:2000,kind:'shopper',x:GATE[0],z:GATE[1],route:[],walking:false,wait:0,phase:'choose',speed:1}];
 return {t,shop,a:t.life.visitors[0]};
}

test('isolated visitors cannot buy remotely and resume after roads reconnect',()=>{
 const {t,shop,a}=visitorTown(),roads=t.roads;t.roads=new Set([key(...GATE)]);
 tickLife(t,.01);tickLife(t,.01);
 assert.equal(t.economy.sold.cloth||0,0);assert.equal(a.phase,'choose');assert.equal(shop.stock,1);
 t.roads=roads;tickLife(t,.01);assert.equal(a.phase,'browse');assert(a.walking);assert.equal(t.economy.sold.cloth||0,0);
 for(let i=0;i<200&&!t.economy.sold.cloth;i++)tickLife(t,.5);
 assert.equal(t.economy.sold.cloth,1);assert(Math.hypot(a.x-shop.entrance[0],a.z-shop.entrance[1])<.02);
});

test('interrupted routes wait for reconnection and missing destinations never sell',()=>{
 const {t,shop,a}=visitorTown(),roads=t.roads;tickLife(t,.01);
 t.roads=new Set([key(...GATE)]);rerouteLife(t);tickLife(t,.01);
 assert.equal(t.economy.sold.cloth||0,0);assert.equal(a.phase,'browse');
 t.roads=roads;tickLife(t,.01);assert(a.walking);
 t.place('home',[{x:-2,z:0}],true);t.buildings=t.buildings.filter(b=>b.id!==shop.id);a.walking=false;a.route=[];a.x=shop.entrance[0];a.z=shop.entrance[1];
 tickLife(t,.01);assert.equal(t.economy.sold.cloth||0,0);assert.equal(a.phase,'choose');
});

test('10000 transfers retain source, manufacturing and recent history in bounded storage',()=>{
 const t=new Town();t.place('work',[{x:0,z:0}],true);const work=t.buildings[0],lot=t.economy.lots[0];
 work.variant=0;t.workers=()=>[{outside:false,current:work.id}];
 transfer(t,'boat',`input:${work.id}`,1,'clay');tickProduction(t,20);
 assert.equal(lot.madeAt,work.id);const origin=lot.origin;
 for(let i=0;i<10000;i++){t.time=i;transfer(t,lot.at,i%2?'dock':'cart:999',1,lot.good);}
 assert(lot.trail.length<=32);assert.equal(lot.trailOmitted+lot.trail.length,10003);
 assert.equal(lot.trail[0].at,'boat');assert(lot.trail.some(e=>e.at===`input:${work.id}`));assert(lot.trail.some(e=>e.at===`output:${work.id}`));
 assert.deepEqual(lot.trail.at(-1),{at:'dock',time:9999});assert.equal(lot.origin,origin);assert(JSON.stringify(lot).length<1800);
 assert.equal(goodsBalance(t).imported,goodsBalance(t).accounted);
});

test('95 active lots admit only remaining capacity, then 96 refuses more without count drift',()=>{
 const t=new Town();while(t.economy.lots.length<96)assert(importCargo(t));
 transfer(t,'boat','sold',1);assert.equal(t.economy.lots.filter(l=>l.at!=='sold').length,95);
 assert(importCargo(t));assert.equal(t.economy.lots.filter(l=>l.at!=='sold').length,96);
 const before=JSON.stringify(t.economy);assert.equal(importCargo(t),false);assert.equal(JSON.stringify(t.economy),before);
 syncCargo(t);assert.equal(t.life.boat.cargo,96);assert.equal(t.life.boat.imported,t.economy.imported);
 assert.equal(goodsBalance(t).imported,goodsBalance(t).accounted);
});
