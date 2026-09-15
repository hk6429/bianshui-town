import {at,transfer,deliveryPlan,importCargo,GOODS,goodsBalance} from './production.js';
import {applyTraffic} from './traffic.js';
import {key,point,pathfind} from './simulation.js';
export const DOCK=[12,8], BERTH=[16,8], GATE=[33,-16], MARKET=[26,-8];
export const riverX=z=>19+Math.sin(z*.045)*3;
export function streetHeight(x,z){
 if(Math.abs(z+16)<1.2&&x>=12&&x<=24)return .5+Math.sin((x-12)/12*Math.PI)*1.35+.09;
 if(Math.abs(z+16)<1.2&&x>10&&x<12)return (x-10)*.25;
 if(Math.abs(z+16)<1.2&&x>24&&x<26)return (26-x)*.25;
 if(Math.abs(z-8)<1&&x>=12&&x<=16.4)return .37;
 return .04;
}
export function publicRoads(){
 const road=new Set();for(let z=-16;z<=20;z++)road.add(key(12,z));
 for(let x=10;x<=33;x++)road.add(key(x,-16));
 for(let x=12;x<=16;x++)road.add(key(x,8));
 for(let z=-16;z<=-8;z++)road.add(key(26,z));
 for(let x=24;x<=29;x++)road.add(key(x,-8));
 return road;
}
export function createLife(){return {version:1,visitors:[],porters:[],oxen:[],dock:{stock:0,received:0,delivered:0,sold:0},boat:{x:riverX(-29),z:-29,state:'approach',cargo:12,imported:12,mast:1,trips:0,wait:0,announced:false},socialCount:0,bridgePasses:0};}
const names=['顧行舟','杜望春','孟青山','姚阿蘭','許長安','江雲','丁禾','彭小橋','朱常順','余小溪'];
function actor(id,kind,x,z){return {id,kind,x,z,angle:0,route:[],walking:false,visible:true,wait:0,phase:'outbound',speed:kind==='ox'?.68:.95,name:names[id%names.length],action:'停留片刻',carrying:0};}
export function send(t,a,target,action){
 const start=t.nearestRoad(a.x,a.z),path=pathfind(t.roads,start,key(...target));
 if(!path.length){a.action='等候道路連通';a.walking=false;return false;}
 a.route=path;if(Math.hypot(a.x-path[0][0],a.z-path[0][1])<.02)a.route.shift();
 a.goal=[...target];a.walking=a.route.length>0;a.action=action;return true;
}
export function advance(a,dt,t){
 let budget=a.speed*dt*(t?applyTraffic(t,a):1);
 while(a.route.length&&budget>0){const [x,z]=a.route[0],dx=x-a.x,dz=z-a.z,d=Math.hypot(dx,dz);a.angle=Math.atan2(dx,dz);if(d<=budget){a.x=x;a.z=z;a.route.shift();budget-=d;}else{a.x+=dx/d*budget;a.z+=dz/d*budget;budget=0;}}
 a.walking=a.route.length>0;
}
export function rerouteLife(t){for(const a of [...t.life.visitors,...t.life.porters,...t.life.oxen]){if(a.walking&&a.goal)send(t,a,a.goal,a.action);}}
function tickBoat(t,dt){
 const l=t.life,b=l.boat;
 if(b.state==='approach'){
  b.z=Math.min(8,b.z+dt*.85);b.x=riverX(b.z);b.mast=Math.abs(b.z+16)<6?0:1;
  if(Math.abs(b.z+16)<5&&!b.announced){b.announced=true;l.bridgePasses++;t.log('漕船收桅過虹橋，橋頭來客駐足觀看');}
  if(b.z>=8)b.state='mooring';
 }else if(b.state==='mooring'){
  b.x=Math.max(17.1,b.x-dt*.4);if(b.x<=17.1){b.state='unloading';b.mast=1;t.log('貨船靠岸，腳夫開始把貨物搬上碼頭');}
 }else if(b.state==='unloading'){
  if(b.cargo===0&&!l.porters.some(p=>p.carrying)){b.state='depart';b.trips++;t.log('本船貨物已卸妥，船家解纜離岸');}
 }else if(b.state==='depart'){
  b.x=Math.min(riverX(b.z),b.x+dt*.4);b.z+=dt*.85;
  if(b.z>44){b.state='away';b.wait=35;}
 }else{
  b.wait-=dt;if(b.wait<=0&&importCargo(t)){Object.assign(b,{x:riverX(-44),z:-44,state:'approach',mast:1,announced:false});}
 }
}
function tickPorters(t,dt){
 const l=t.life;
 if(!l.porters.length)for(let i=0;i<2;i++)l.porters.push({...actor(3001+i,'porter',12,8),wait:i*2,phase:'fetch'});
 for(const p of l.porters){
  if(p.walking){advance(p,dt,t);if(p.walking)continue;}
  p.wait-=dt;if(p.wait>0)continue;
  if(p.phase==='fetch'){
   if(l.boat.state==='unloading'&&l.boat.cargo>0){send(t,p,BERTH,'走向船邊接貨');p.phase='load';}
   else p.action='在碼頭候船';
  }else if(p.phase==='load'){
   if(l.boat.cargo>0){transfer(t,'boat',`porter:${p.id}`,1);send(t,p,DOCK,'扛貨送往岸邊貨棧');p.phase='store';}else {send(t,p,DOCK,'返回岸邊');p.phase='fetch';}
  }else{const n=transfer(t,`porter:${p.id}`,'dock',1);l.dock.received+=n;p.wait=2;p.phase='fetch';p.action='把貨物放入貨棧';}
 }
}
function tickOxen(t,dt){
 const l=t.life;
 if(t.buildings.some(b=>b.stage>=3&&b.type!=='home')&&!l.oxen.length)l.oxen.push({...actor(4001,'ox',...DOCK),name:'牛車腳行',phase:'load'});
 for(const a of l.oxen){
  if(a.walking){advance(a,dt,t);if(a.walking)continue;}
  a.wait-=dt;if(a.wait>0)continue;
  if(a.phase==='load'){
   const plan=deliveryPlan(t);
   if(plan&&send(t,a,plan.building.entrance,`運送${GOODS[plan.good]}前往${plan.building.name}`)){transfer(t,'dock',`ox:${a.id}`,3,plan.good);a.target=plan.building.id;a.deliveryAt=plan.to;a.phase='deliver';}else a.action='牛車等候原料與作坊接貨';
  }else if(a.phase==='deliver'){
   const target=t.building(a.target);if(target){const lots=at(t,`ox:${a.id}`),label=GOODS[lots[0]?.good]||'貨物';const n=transfer(t,`ox:${a.id}`,a.deliveryAt||`shop:${target.id}`,3);if(target.type==='shop')l.dock.delivered+=n;else target.lastSupply=t.elapsed;t.log(`牛車送抵${target.name}，補入 ${n} 件${label}`);}a.phase='return';a.wait=5;a.action='卸貨，讓牛歇歇腳';
  }else if(send(t,a,DOCK,'空車返回碼頭'))a.phase='load';
 }
}
function tickVisitors(t,dt){
 const l=t.life,h=t.time%24,day=h>=6&&h<20;
 if(!l.visitors.length)for(let i=0;i<10;i++)l.visitors.push({...actor(2000+i,i%3===0?'peddler':i%3===1?'traveler':'shopper',...GATE),wait:i*3,phase:'choose',visible:false});
 const shops=t.buildings.filter(b=>b.type==='shop'&&b.stage>=3);
 for(const a of l.visitors){
  if(!day&&a.phase!=='night'&&a.phase!=='home'){send(t,a,GATE,'沿虹橋返回城門');a.phase='home';}
  if(a.walking){advance(a,dt,t);if(a.walking)continue;}
  a.wait-=dt;if(a.wait>0)continue;
  if(a.phase==='night'){a.visible=false;if(day){a.phase='choose';a.wait=a.id%5;}continue;}
  if(a.phase==='home'){a.visible=false;a.phase=day?'choose':'night';a.wait=10+a.id%6;continue;}
  if(a.phase==='choose'){
   if(!day)continue;a.visible=true;const shop=shops.length?shops[a.id%shops.length]:null;
   const target=shop?shop.entrance:MARKET;a.target=shop?.id||null;send(t,a,target,shop?`趕集，前往${shop.name}`:'前往橋頭市集');a.phase='browse';
  }else if(a.phase==='browse'){
   a.action=a.kind==='peddler'?'放下擔子，與店家談買賣':'在攤前看貨、喝茶';a.wait=7+a.id%5;a.phase='watch';
   const shop=t.building(a.target);if(shop?.stock>0){l.dock.sold+=transfer(t,`shop:${shop.id}`,'sold',1);}
  }else if(a.phase==='watch'){
   send(t,a,[18+(a.id%3),-16],'走到虹橋看船');a.phase='bridge';
  }else if(a.phase==='bridge'){
   a.action=Math.abs(l.boat.z+16)<7?'倚橋看船家收桅過橋':'倚橋看水，與同行閒談';a.wait=6+a.id%5;a.phase='leave';
  }else{send(t,a,GATE,'逛完市集，往城門歸去');a.phase='home';}
 }
}
function conversations(t){
 const h=t.time%24;if(h<6||h>=20||t.elapsed<30||t.weather.raining)return;
 const active=t.people.filter(p=>p.outside&&!p.streetEvent&&p.route.length&&(p.chatCooldown||0)<=t.elapsed);
 for(let i=0;i<active.length;i++){const a=active[i];if((a.chatCooldown||0)>t.elapsed)continue;
  const b=active.slice(i+1).find(p=>(p.chatCooldown||0)<=t.elapsed&&Math.hypot(p.x-a.x,p.z-a.z)<1.35);if(!b)continue;
  for(const [p,other] of [[a,b],[b,a]]){p.socialUntil=t.elapsed+4;p.chatCooldown=t.elapsed+70;p.chatPartner=other.id;p.action=`和${other.name}聊聊街坊近況`;p.angle=Math.atan2(other.x-p.x,other.z-p.z);}
  t.life.socialCount++;t.log(`${a.name}與${b.name}在巷口停步寒暄`);
 }
}
export function tickLife(t,dt){
 if(!t.buildings.length)return;
 tickBoat(t,dt);tickPorters(t,dt);tickOxen(t,dt);tickVisitors(t,dt);conversations(t);
}
export function cargoBalance(t){return goodsBalance(t);}
