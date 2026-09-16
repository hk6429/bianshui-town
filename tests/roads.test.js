import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {layRoad,removeRoad} from '../src/urban.js';import {publicAccess,roadReachable,roadAnchor} from '../src/road-network.js';import {setCityPolicy} from '../src/city-finance.js';
import {addResident} from '../src/city-growth.js';import {assignJobs} from '../src/employment.js';import {prepareTraffic} from '../src/traffic.js';import {deliveryPlan,transfer,tickCraftCarts,goodsBalance} from '../src/production.js';import {tickLife} from '../src/life.js';
import {rerouteLiterati,tickLiterati,authorStatus} from '../src/literati.js';import {AUTHORS} from '../src/literati-data.js';import {trafficMotion} from '../src/traffic.js';
const connector=[{x:0,z:1},{x:0,z:2},{x:1,z:2}];
test('starter approach is usable; only player road connects a distant block, removal isolates and rebuilding restores it',()=>{
 const t=new Town({mode:'managed'});assert(roadReachable(t,[8,8],[12,8]));t.place('home',[{x:0,z:0}],true);const b=t.buildings[0];assert(!publicAccess(t,b));
 assert(layRoad(t,'lane',connector));assert(publicAccess(t,b));assert(removeRoad(t,[connector[0]]));assert(!publicAccess(t,b));assert(!publicAccess(Town.restore(t.toJSON()),b));
 assert(layRoad(t,'lane',[connector[0]]));assert(publicAccess(t,b));setCityPolicy(t,{mode:'sandbox'});removeRoad(t,connector);assert(publicAccess(t,b));setCityPolicy(t,{mode:'managed'});assert(!publicAccess(t,b));
});
test('isolated housing cannot attract immigrants and isolated workplaces cannot employ them',()=>{
 const t=new Town({mode:'managed'});t.place('home',[{x:0,z:0}],true);t.place('work',[{x:2,z:0}],true);for(let i=0;i<60;i++)t.tick(1);assert.equal(t.people.length,0);
 layRoad(t,'lane',connector);for(let i=0;i<60;i++)t.tick(1);assert(t.people.length>0);assert(t.people.every(p=>!p.work));
 layRoad(t,'lane',[{x:2,z:1}]);assignJobs(t);assert(t.people.every(p=>p.work===t.buildings[1].id));
});
test('removing a road under a traveller does not snap it across a gap or mark a false arrival',()=>{
 const t=new Town({mode:'managed'});t.place('home',[{x:0,z:0}],true);t.place('shop',[{x:2,z:0}],true);layRoad(t,'lane',[...connector,{x:2,z:1}]);const p=addResident(t,t.buildings[0]);Object.assign(p,{outside:true,current:null,destination:t.buildings[1].id,x:0,z:4,route:[[0,5]]});removeRoad(t,[connector[0]]);
 assert.equal(roadAnchor(t,p.x,p.z),null);assert(!t.travel(p,t.buildings[1].id));t.move(p,1);assert(p.outside);assert.equal(p.current,null);assert.deepEqual([p.x,p.z],[0,4]);
 layRoad(t,'lane',[connector[0]]);assert(t.travel(p,t.buildings[1].id));for(let i=0;i<100;i++)t.move(p,.5);assert.equal(p.current,t.buildings[1].id);
});
test('delivery skips isolated destinations and interruption cannot deliver remotely',()=>{
 const t=new Town({mode:'managed'});t.place('shop',[{x:-5,z:0}],true);t.place('shop',[{x:0,z:0}],true);layRoad(t,'lane',connector);for(const lot of t.economy.lots)lot.good='legacy';transfer(t,'boat','dock',12);const target=t.buildings[1];assert.equal(deliveryPlan(t).building.id,target.id);
 tickLife(t,.05);const ox=t.life.oxen[0];assert(ox.carrying>0);assert.equal(ox.target,target.id);removeRoad(t,[connector[0]]);for(let i=0;i<100;i++)tickLife(t,.05);assert.equal(target.stock,0);assert(ox.carrying>0);
 layRoad(t,'lane',[connector[0]]);for(let i=0;i<3000&&!target.stock;i++)tickLife(t,.05);assert(target.stock>0);assert.equal(goodsBalance(t).imported,goodsBalance(t).accounted);
});
test('loaded workshop cart keeps goods during a failed route and never puts shop inventory into its workshop',()=>{
 const t=new Town({mode:'managed'});t.place('work',[{x:0,z:0}],true);t.place('shop',[{x:2,z:0}],true);layRoad(t,'lane',connector);t.tick(.05);const c=t.carts[0];t.economy.lots[0].good='cloth';transfer(t,'boat',`cart:${c.id}`,1,'cloth');tickCraftCarts(t,.05);assert.equal(c.carrying,1);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
 layRoad(t,'lane',[{x:2,z:1}]);for(let i=0;i<3000&&!t.buildings[1].stock;i++)tickCraftCarts(t,.05);assert.equal(t.buildings[1].stock,1);assert.equal(c.carrying,0);
});
function throughput(type){const t=new Town();layRoad(t,type,[{x:-1,z:0},{x:0,z:0},{x:1,z:0}]);for(let i=0;i<12;i++){const x=-2-i*.15;t.people.push({id:100+i,x,z:0,route:Array.from({length:6-Math.ceil(x)+1},(_,n)=>[Math.ceil(x)+n,0]),outside:true,speed:1,current:null,destination:null});}
 for(let i=0;i<220;i++){prepareTraffic(t);for(const p of t.people)t.move(p,.05);}return t.people.filter(p=>p.x>=6).length;
}
test('avenues carry more same-route traffic through actual movement, without altering building footprints',()=>{
 const narrow=throughput('lane'),wide=throughput('avenue');assert(wide>narrow,`${wide} vs ${narrow}`);console.log(`同11秒、12位行人：小路通過${narrow}人，大路${wide}人`);
 const t=new Town({mode:'managed'});t.place('home',[{x:0,z:0}],true);layRoad(t,'lane',connector);const buildings=JSON.stringify(t.buildings),funds=t.city.treasury;layRoad(t,'avenue',connector);assert.equal(JSON.stringify(t.buildings),buildings);assert.equal(funds-t.city.treasury,75);
});
test('stranded authors neither jump to a remote road nor collect a work before reconnecting',()=>{
 const t=new Town({mode:'managed'});t.place('home',[{x:0,z:0}],true);layRoad(t,'lane',connector);const a={id:90001,author:AUTHORS[0].id,kind:'author',x:0,z:4,route:[[0,5]],goal:[0,8],walking:true,visible:true,phase:'walking',speed:.95,visits:0,progress:0,wait:0,venue:'街坊'};t.literati.actors=[a];t.literati.nextAt=1e6;
 removeRoad(t,[connector[0]]);rerouteLiterati(t);for(let i=0;i<300;i++)tickLiterati(t,.1);assert.deepEqual([a.x,a.z],[0,4]);assert.equal(a.walking,false);assert.equal(t.literati.collected.length,0);assert.equal(authorStatus(t,a),'等候道路連通');
 layRoad(t,'lane',[connector[0]]);for(let i=0;i<1500&&!t.literati.collected.length;i++)tickLiterati(t,.1);assert.equal(t.literati.collected.length,1);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('avenue pedestrian rows remain distinct while passing a vehicle',()=>{
 const t=new Town();layRoad(t,'avenue',[{x:0,z:0}]);const a={id:1,x:0,z:0,route:[[1,0]],outside:true},b={...a,id:2},ox={id:4001,kind:'ox',x:1,z:0,route:[[0,0]],walking:true};t.people=[a,b];t.life.oxen=[ox];prepareTraffic(t);const first=trafficMotion(t,a),second=trafficMotion(t,b);assert(first.scale>0&&second.scale>0);assert(Math.abs(first.offset-second.offset)>=.29);assert(first.offset<=1&&second.offset<=1);
});
