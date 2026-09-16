import {STARTER_ROAD,roadAnchor} from './road-network.js';
import {createTrade} from './trade.js';
import {createDemography,tickPopulation} from './city-growth.js';
import {residentPurchase} from './commerce.js';
import {assignJobs} from './employment.js';
import {createCity,charge,buildCost,settleBudget,managed} from './city-finance.js';
import {validateSave} from './save-schema.js';
import {tierOf} from './building-tiers.js';
import {roadNodes,mergeGardens} from './urban.js';
import {createLiterati,tickLiterati,rerouteLiterati} from './literati.js';
import {isUtility} from './public-services.js';
import {tickHealthcare} from './healthcare.js';
import {onSickLeave} from './employment.js';
import {tickFire} from './fire-service.js';
import {tickSanitation} from './sanitation.js';
import {DESIGNS,isSquare,gardenActivity} from './heritage.js';
import {createEconomy,importCargo,migrateEconomy,tickProduction,tickCraftCarts,syncCargo} from './production.js';
import {createWeather,tickWeather,shelterResident} from './weather.js';
import {prepareTraffic,applyTraffic} from './traffic.js';
import {createStories,tickStories,eventAction,remember,rerouteStories} from './stories.js';
import {createLife,publicRoads,rerouteLife,tickLife,send} from './life.js';
export const CELL = 4;
export const TYPES = {home:'民居',shop:'商鋪',work:'作坊',garden:'園景'};
export const key = (x,z) => `${x},${z}`;
export const point = k => k.split(',').map(Number);
const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
export const bounds = {minX:-8,maxX:2,minZ:-6,maxZ:6};
export function dragCells(start,end){
 if(start.x!==end.x&&start.z!==end.z){const dx=Math.sign(end.x-start.x),dz=Math.sign(end.z-start.z);return [{...start},{x:start.x+dx,z:start.z},{x:start.x,z:start.z+dz},{x:start.x+dx,z:start.z+dz}];}

 const cells=[{...start}]; let {x,z}=start;
 while(cells.length<4 && (x!==end.x||z!==end.z)){
  if(Math.abs(end.x-x)>=Math.abs(end.z-z) && x!==end.x)x+=Math.sign(end.x-x); else z+=Math.sign(end.z-z);
  cells.push({x,z});
 }
 return cells;
}
export function perimeter(cells){
 const occupied=new Set(cells.map(c=>key(c.x,c.z))), nodes=new Set();
 for(const c of cells)for(const [dx,dz] of dirs){
  if(occupied.has(key(c.x+dx,c.z+dz)))continue;
  for(let i=-2;i<=2;i++)nodes.add(key(c.x*4+dx*2+(dz?i:0),c.z*4+dz*2+(dx?i:0)));
 }
 return nodes;
}
export function pathfind(nodes,start,goal){
 if(!nodes.has(start)||!nodes.has(goal))return [];
 const queue=[start],parent=new Map([[start,null]]);
 for(let i=0;i<queue.length;i++){
  const k=queue[i]; if(k===goal){const path=[];for(let p=k;p!==null;p=parent.get(p))path.push(point(p));return path.reverse();}
  const [x,z]=point(k);
  for(const [dx,dz] of dirs){const next=key(x+dx,z+dz);if(nodes.has(next)&&!parent.has(next)){parent.set(next,k);queue.push(next);}}
 }
 return [];
}
export class Town {
 constructor({mode='sandbox'}={}){this.demography=createDemography();this.city=createCity(mode);this.market={trades:0};this.publicWorks=mode==='managed'?[{...STARTER_ROAD}]:[];this.buildings=[];this.blocks=[];this.people=[];this.carts=[];this.roads=new Set();this.time=8;this.elapsed=0;this.nextId=1;this.revision=0;this.events=[];this.life=createLife();this.stories=createStories();this.weather=createWeather();this.literati=createLiterati();this.economy=createEconomy();importCargo(this);if(this.publicWorks.length)this.rebuildRoads();}
 canPlace(cells){
  if(!cells.length||cells.length>4||new Set(cells.map(c=>key(c.x,c.z))).size!==cells.length)return false;
  const connected=new Set([key(cells[0].x,cells[0].z)]);
  for(let i=0;i<3;i++)for(const c of cells)if(dirs.some(([dx,dz])=>connected.has(key(c.x+dx,c.z+dz))))connected.add(key(c.x,c.z));
  return connected.size===cells.length&&cells.every(c=>Number.isInteger(c.x)&&Number.isInteger(c.z)&&c.x>=bounds.minX&&c.x<=bounds.maxX&&c.z>=bounds.minZ&&c.z<=bounds.maxZ&&!this.publicWorks.some(p=>p.x===c.x&&p.z===c.z)&&!this.blocks.some(b=>b.cells.some(n=>n.x===c.x&&n.z===c.z)));
 }
 place(type,cells,ready=false,design=null){
  if(!TYPES[type]||!this.canPlace(cells))return null;
  if(isSquare(cells)&&design)design=({garden:'scholarGarden',residence:'mansion',kiln:'kilnHall',woodshop:'woodshopHall',weavery:'weaveryHall'})[design]||design;
  if(isSquare(cells)&&!design){design=type==='home'?'mansion':type==='work'?'kilnHall':type==='shop'?'wine':null;}
  const spec=DESIGNS[design];if(design&&(!spec||spec.type!==type||!spec.sizes.includes(isSquare(cells)?4:1)))return null;if(type==='garden'&&!spec)return null;
  if(!charge(this,buildCost(type,cells),'建設'))return null;
  const combined=isSquare(cells);
  const block={id:this.nextId++,type,combined,cells:cells.map(c=>({...c}))};this.blocks.push(block);
  const plots=combined?[{x:cells.reduce((s,c)=>s+c.x,0)/4,z:cells.reduce((s,c)=>s+c.z,0)/4,footprint:cells.map(c=>({...c}))}]:cells;
  for(const c of plots){const id=this.nextId++;this.buildings.push({id,blockId:block.id,type,...c,tier:1,level:spec&&['home','work'].includes(type)?2:1,design:design||(combined&&type==='shop'?'wine':null),born:ready?this.elapsed-100:this.elapsed,variant:spec?spec.variant:id%3,stage:ready?4:0,entrance:null,name:spec?(combined&&spec.largeName?spec.largeName:spec.name):combined?(type==='shop'?'夢華酒樓':type==='home'?'合院人家':'合院工坊'):type==='home'?`${['柳蔭','汴水','杏花'][id%3]}人家 ${id}`:type==='shop'?['春水茶坊','陳記食肆','錦色布莊'][id%3]:['青瓷作坊','木作小院','織雲坊'][id%3]});}
  const merged=type==='garden'?mergeGardens(this):null;syncCargo(this);this.rebuildRoads();this.revision++;this.log(`一處${combined?'四格合建的':cells.length===1?'新':cells.length+'間相連的'}${TYPES[type]}${ready?'已落成':'開始動工'}`);
  return merged||block;
 }
 isInterior(x,z){return this.buildings.some(b=>Math.abs(x-b.x*4)<(b.footprint?4:2)&&Math.abs(z-b.z*4)<(b.footprint?4:2));}
 rebuildRoads({preserveRoutes=false}={}){
  this.roads=this.buildings.length||this.publicWorks.length?publicRoads():new Set();for(const block of this.blocks)for(const k of perimeter(block.cells))this.roads.add(k);
  // Join each exterior loop to the existing street network through free ground.
  let connected=this.buildings.length?publicRoads():new Set();
  for(const block of managed(this)?[]:this.blocks){
   const loop=perimeter(block.cells);
   if(!connected.size){connected=new Set(loop);continue;}
   const queue=[...loop],parent=new Map(queue.map(k=>[k,null]));let hit=null;
   for(let i=0;i<queue.length&&!hit;i++){
    const k=queue[i];if(connected.has(k)){hit=k;break;}const [x,z]=point(k);
    for(const [dx,dz] of dirs){const nx=x+dx,nz=z+dz,n=key(nx,nz);if(nx<-34||nx>12||nz<-26||nz>26||parent.has(n)||this.isInterior(nx,nz))continue;parent.set(n,k);queue.push(n);}
   }
   if(hit)for(let p=hit;p!==null;p=parent.get(p)){this.roads.add(p);connected.add(p);}
   for(const k of loop)connected.add(k);
  }
  for(const k of roadNodes(this))this.roads.add(k);
  for(const b of this.buildings){
   const group=this.blocks.find(g=>g.id===b.blockId);
   if(b.footprint){b.entrance=[b.x*4,b.z*4+4];b.facing=0;continue;}
   const choices=[[0,1],[1,0],[-1,0],[0,-1]];
   const [dx,dz]=choices.find(([dx,dz])=>!group.cells.some(c=>c.x===b.x+dx&&c.z===b.z+dz))||[0,1];
   b.entrance=[b.x*4+dx*2,b.z*4+dz*2];b.facing=Math.atan2(dx,dz);
  }
  if(preserveRoutes){
   const valid=route=>route.every((p,i)=>this.roads.has(key(...p))&&(!i||Math.abs(p[0]-route[i-1][0])+Math.abs(p[1]-route[i-1][1])<=1));
   for(const p of [...this.people,...this.carts])if(p.route.length&&!valid(p.route)){p.route=[];if(p.eventSlot)p.route=pathfind(this.roads,this.nearestRoad(p.x,p.z),key(...p.eventSlot));else if(p.destination)this.travel(p,p.destination);}
   for(const p of [...this.life.visitors,...this.life.porters,...this.life.oxen,...this.literati.actors])if(p.route.length&&!valid(p.route)){p.route=[];p.walking=false;if(p.goal)send(this,p,p.goal,p.action);}
   return;
  }
  for(const p of [...this.people,...this.carts]){
   if(p.outside){const nearest=roadAnchor(this,p.x,p.z);if(nearest)[p.x,p.z]=point(nearest);p.route=[];p.destination=null;}
  }
  rerouteLife(this);rerouteStories(this);rerouteLiterati(this);
 }
 nearestRoad(x,z){let best=null,dist=Infinity;for(const k of this.roads){const [a,b]=point(k),d=(a-x)**2+(b-z)**2;if(d<dist){dist=d;best=k;}}return best;}
 log(text){this.events.unshift({text,time:this.time});this.events=this.events.slice(0,24);}
 residents(b){return this.people.filter(p=>p.home===b.id);}
 occupants(b){return this.people.filter(p=>!p.outside&&p.current===b.id);}
 workers(b){return this.people.filter(p=>p.work===b.id);}
 building(id){return this.buildings.find(b=>b.id===id);}
 travel(p,target){
  const dest=this.building(target);if(!dest)return false;
  if(!p.outside&&p.current===target){p.destination=target;return true;}
  const current=this.building(p.current)||this.building(p.home);
  if(!p.outside){if(current)[p.x,p.z]=current.entrance;else p.outside=true;}
  const from=roadAnchor(this,p.x,p.z);const path=pathfind(this.roads,from,key(...dest.entrance));
  if(!path.length){p.route=[];p.action='等候道路連通';return false;}
  p.route=path.slice(1);p.destination=target;p.outside=true;p.current=null;p.action=`前往${dest.name}`;return true;
 }
 tick(dt){
  if(!Number.isFinite(dt)||dt<=0||dt>60)return;this.elapsed+=dt;this.time+=dt/15;
  for(const b of this.buildings){const age=this.elapsed-b.born,stage=age<5?0:age<11?1:age<18?2:age<85?3:4;if(stage!==b.stage){b.stage=stage;this.revision++;if(stage===3)this.log(`${b.name}已落成`);}}
  tickPopulation(this);
  for(const a of [...this.people,...this.life.visitors,...this.life.porters])a.traffic='';
  tickWeather(this);tickStories(this);prepareTraffic(this);
  assignJobs(this);
  for(const p of this.people){
   if(!p.home&&!p.work){p.outside=true;p.action='在街口等候新居';continue;}
   if(onSickLeave(this,p)){p.streetEvent=null;p.socialUntil=0;p.shelter=null;if(p.home&&(p.destination!==p.home||!p.outside&&p.current!==p.home||p.outside&&!p.route.length))this.travel(p,p.home);this.move(p,dt);p.action=p.outside?'身體不適，返家休養':'身體不適，在家休養（病假）';continue;}
   if(shelterResident(this,p,dt))continue;
   if(eventAction(this,p)){this.move(p,dt);eventAction(this,p);continue;}
   const h=this.time%24;if((p.socialUntil||0)>this.elapsed&&h>=6&&h<20)continue;const shops=this.buildings.filter(b=>(b.type==='shop'||b.type==='garden'&&!isUtility(b))&&b.stage>=3);
   let target=p.home;
   if(this.building(p.work)?.type==='shop'&&h>=7&&h<19)target=p.work;
   else if(h>=7&&h<17&&!(h>=11.5&&h<13))target=p.work||p.home;
   else if((h>=11.5&&h<13)||(h>=17&&h<20))target=shops.length?shops[p.id%shops.length].id:p.home;
   if(!p.outside && p.current!==target)this.travel(p,target);
   else if(p.outside && p.destination!==target)this.travel(p,target);
   this.move(p,dt);
   if(!p.outside){const b=this.building(p.current);p.action=b?.type==='garden'?gardenActivity(b):b?.type==='home'?(h>=21||h<6?'安睡中':h>=8&&h<18?'在院裡整理花草':'在家歇息'):b?.type==='shop'?(p.work===b.id?'招呼客人':'喝茶、採買'):['燒製陶器','打磨木器','整理織物'][b?.variant||0];}
  }
  const shops=this.buildings.filter(b=>b.type==='shop'&&b.stage>=3);
  for(const b of this.buildings.filter(b=>b.type==='work'&&b.stage>=3)){
   if(shops.length&&!this.carts.some(c=>c.home===b.id))this.carts.push({id:this.nextId++,home:b.id,current:b.id,destination:b.id,x:b.entrance[0],z:b.entrance[1],outside:false,route:[],speed:.7,wait:0,carrying:0,action:'整理貨物'});
  }
  for(const p of this.people)residentPurchase(this,p);
  tickProduction(this,dt);tickCraftCarts(this,dt);
  tickLife(this,dt);tickLiterati(this,dt);settleBudget(this);tickSanitation(this);tickFire(this);tickHealthcare(this,dt);
  for(const p of this.people){if(this.weather.raining&&p.outside&&!p.shelter&&!p.action.startsWith('撐傘'))p.action='撐傘 · '+p.action;remember(this,p,p.action);}
 }
 move(p,dt){
  if(!p.outside)return;
  if(p.route.some(([x,z])=>!this.roads.has(key(x,z)))){p.route=[];p.action='等候道路連通';return;}
  let remaining=dt*p.speed*applyTraffic(this,p);
  while(p.route.length&&remaining>0){const [x,z]=p.route[0],dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);p.angle=Math.atan2(dx,dz);if(d<=remaining){p.x=x;p.z=z;p.route.shift();remaining-=d;}else{p.x+=dx/d*remaining;p.z+=dz/d*remaining;remaining=0;}}
  if(!p.route.length){const dest=this.building(p.destination);if(dest&&Math.hypot(p.x-dest.entrance[0],p.z-dest.entrance[1])<.02){p.outside=false;p.current=p.destination;}}
 }
 demo(){
  this.place('home',[{x:-4,z:0},{x:-3,z:0},{x:-2,z:0}],true);
  this.place('shop',[{x:0,z:0},{x:1,z:0}],true);
  this.place('work',[{x:-2,z:-2},{x:-1,z:-2}],true);
  this.place('home',[{x:1,z:-3},{x:1,z:-2}],true);
  this.place('home',[{x:-5,z:3},{x:-4,z:3}],true);
  this.place('shop',[{x:-1,z:3}],true);
  this.place('work',[{x:-6,z:-2}],false);
  this.place('home',[{x:-6,z:-4},{x:-5,z:-4},{x:-4,z:-4}],true);
  this.place('shop',[{x:-5,z:-2},{x:-4,z:-2},{x:-3,z:-2}],true);
  this.place('home',[{x:-2,z:3},{x:-2,z:4},{x:-1,z:4}],true);
  this.place('work',[{x:-6,z:2},{x:-6,z:3}],true);
  this.place('shop',[{x:1,z:2},{x:2,z:2}],true);
  this.tick(.01);this.log('一城煙火，等你慢慢看');
 }
 toJSON(){return {version:9,demography:this.demography,city:this.city,market:this.market,publicWorks:this.publicWorks,literati:this.literati,economy:this.economy,weather:this.weather,stories:this.stories,life:this.life,time:this.time,elapsed:this.elapsed,nextId:this.nextId,buildings:this.buildings,blocks:this.blocks,people:this.people,carts:this.carts,events:this.events};}
 static restore(data){
  data=validateSave(data);
  if(![1,2,3,4,5,6,7,8,9].includes(data?.version)||!Array.isArray(data.blocks)||!Array.isArray(data.buildings)||!Array.isArray(data.people)||!Array.isArray(data.carts))throw new Error('存檔格式不相容');
  if(data.buildings.length>143||!Number.isFinite(data.time)||!Number.isFinite(data.elapsed))throw new Error('存檔內容無效');
  const town=new Town();Object.assign(town,data);town.demography=data.demography||createDemography(town.elapsed);town.city=data.city||createCity('sandbox',town.time);town.city.trade??=createTrade();town.city.logisticsLevel??=1;town.city.sanitationDay??=Math.floor(town.time/24);town.city.fireDay??=Math.floor(town.time/24);town.buildings=town.buildings.map(b=>({...b,tier:tierOf(b)}));town.market=data.version>=8&&data.market?data.market:{trades:0};town.publicWorks=data.version>=7&&Array.isArray(data.publicWorks)?data.publicWorks:[];town.literati=data.version>=6&&data.literati?data.literati:{...createLiterati(),nextAt:town.elapsed+3};town.life=data.version>=2&&data.life?data.life:createLife();town.stories=data.version>=3&&data.stories?data.stories:createStories();town.weather=data.version>=4&&data.weather?data.weather:createWeather();if(data.version<4||!data.economy)migrateEconomy(town);else syncCargo(town);town.rebuildRoads({preserveRoutes:true});town.revision++;return town;
 }
}
