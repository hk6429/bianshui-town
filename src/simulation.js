export const CELL = 4;
export const TYPES = {home:'民居',shop:'商鋪',work:'作坊'};
export const key = (x,z) => `${x},${z}`;
export const point = k => k.split(',').map(Number);
const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
export const bounds = {minX:-8,maxX:2,minZ:-6,maxZ:6};
export function dragCells(start,end){
 const cells=[{...start}]; let {x,z}=start;
 while(cells.length<3 && (x!==end.x||z!==end.z)){
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
 constructor(){this.buildings=[];this.blocks=[];this.people=[];this.carts=[];this.roads=new Set();this.time=8;this.elapsed=0;this.nextId=1;this.revision=0;this.events=[];}
 canPlace(cells){
  if(!cells.length||cells.length>3||new Set(cells.map(c=>key(c.x,c.z))).size!==cells.length)return false;
  const connected=new Set([key(cells[0].x,cells[0].z)]);
  for(let i=0;i<3;i++)for(const c of cells)if(dirs.some(([dx,dz])=>connected.has(key(c.x+dx,c.z+dz))))connected.add(key(c.x,c.z));
  return connected.size===cells.length&&cells.every(c=>Number.isInteger(c.x)&&Number.isInteger(c.z)&&c.x>=bounds.minX&&c.x<=bounds.maxX&&c.z>=bounds.minZ&&c.z<=bounds.maxZ&&!this.buildings.some(b=>b.x===c.x&&b.z===c.z));
 }
 place(type,cells,ready=false){
  if(!TYPES[type]||!this.canPlace(cells))return null;
  const block={id:this.nextId++,type,cells:cells.map(c=>({...c}))};this.blocks.push(block);
  for(const c of cells){const id=this.nextId++;this.buildings.push({id,blockId:block.id,type,...c,born:ready?this.elapsed-100:this.elapsed,variant:id%3,stage:ready?4:0,entrance:null,name:type==='home'?`${['柳蔭','汴水','杏花'][id%3]}人家 ${id}`:type==='shop'?['春水茶坊','陳記食肆','錦色布莊'][id%3]:['青瓷作坊','木作小院','織雲坊'][id%3]});}
  this.rebuildRoads();this.revision++;this.log(`一處${cells.length===1?'新':cells.length+'間相連的'}${TYPES[type]}開始動工`);
  return block;
 }
 isInterior(x,z){return this.buildings.some(b=>Math.abs(x-b.x*4)<2&&Math.abs(z-b.z*4)<2);}
 rebuildRoads(){
  this.roads=new Set();for(const block of this.blocks)for(const k of perimeter(block.cells))this.roads.add(k);
  // Join each exterior loop to the existing street network through free ground.
  let connected=new Set();
  for(const block of this.blocks){
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
  for(const b of this.buildings){
   const group=this.blocks.find(g=>g.id===b.blockId);
   const choices=[[0,1],[1,0],[-1,0],[0,-1]];
   const [dx,dz]=choices.find(([dx,dz])=>!group.cells.some(c=>c.x===b.x+dx&&c.z===b.z+dz))||[0,1];
   b.entrance=[b.x*4+dx*2,b.z*4+dz*2];b.facing=Math.atan2(dx,dz);
  }
  for(const p of [...this.people,...this.carts]){
   if(p.outside){const nearest=this.nearestRoad(p.x,p.z);if(nearest){[p.x,p.z]=point(nearest);p.route=[];p.destination=null;}}
  }
 }
 nearestRoad(x,z){let best=null,dist=Infinity;for(const k of this.roads){const [a,b]=point(k),d=(a-x)**2+(b-z)**2;if(d<dist){dist=d;best=k;}}return best;}
 log(text){this.events.unshift({text,time:this.time});this.events=this.events.slice(0,8);}
 residents(b){return this.people.filter(p=>p.home===b.id);}
 occupants(b){return this.people.filter(p=>!p.outside&&p.current===b.id);}
 workers(b){return this.people.filter(p=>p.work===b.id);}
 building(id){return this.buildings.find(b=>b.id===id);}
 travel(p,target){
  const dest=this.building(target);if(!dest)return false;
  if(!p.outside&&p.current===target){p.destination=target;return true;}
  const current=this.building(p.current)||this.building(p.home);
  if(!p.outside){[p.x,p.z]=current.entrance;}
  const from=this.nearestRoad(p.x,p.z);const path=pathfind(this.roads,from,key(...dest.entrance));
  if(!path.length){p.action='等候道路連通';return false;}
  p.route=path.slice(1);p.destination=target;p.outside=true;p.current=null;p.action=`前往${dest.name}`;return true;
 }
 tick(dt){
  if(dt<=0)return;this.elapsed+=dt;this.time+=dt/15;
  for(const b of this.buildings){const age=this.elapsed-b.born,stage=age<5?0:age<11?1:age<18?2:age<85?3:4;if(stage!==b.stage){b.stage=stage;this.revision++;if(stage===3)this.log(`${b.name}已落成`);}}
  for(const b of this.buildings.filter(b=>b.type==='home'&&b.stage>=3)){
   if(this.residents(b).length)continue;
   for(let i=0;i<2;i++){
    const id=this.nextId++;this.people.push({id,name:['沈安','李小滿','周青','陳禾','柳阿寧','王知夏','趙明','何蘭','蘇平','林春'][id%10]+(id>35?'·'+id:''),home:b.id,work:null,current:b.id,destination:b.id,x:b.entrance[0],z:b.entrance[1],outside:false,route:[],action:'在家歇息',speed:0.8+(id%4)*.12});
   }this.log(`${b.name}迎來兩位新住戶`);
  }
  const workplaces=this.buildings.filter(b=>b.type!=='home'&&b.stage>=3);
  for(const p of this.people){
   if(!p.work){const job=workplaces.find(b=>this.workers(b).length<(b.type==='work'?4:2));if(job)p.work=job.id;}
   const h=this.time%24,shops=this.buildings.filter(b=>b.type==='shop'&&b.stage>=3);
   let target=p.home;
   if(h>=7&&h<17&&!(h>=11.5&&h<13))target=p.work||p.home;
   else if((h>=11.5&&h<13)||(h>=17&&h<20))target=shops.length?shops[p.id%shops.length].id:p.home;
   if(!p.outside && p.current!==target)this.travel(p,target);
   else if(p.outside && p.destination!==target)this.travel(p,target);
   this.move(p,dt);
   if(!p.outside){const b=this.building(p.current);p.action=b?.type==='home'?(h>=21||h<6?'安睡中':'在家歇息'):b?.type==='shop'?(p.work===b.id?'招呼客人':'喝茶、採買'):['燒製陶器','打磨木器','整理織物'][b?.variant||0];}
  }
  const shops=this.buildings.filter(b=>b.type==='shop'&&b.stage>=3);
  for(const b of this.buildings.filter(b=>b.type==='work'&&b.stage>=3)){
   if(shops.length&&!this.carts.some(c=>c.home===b.id))this.carts.push({id:this.nextId++,home:b.id,current:b.id,destination:b.id,x:b.entrance[0],z:b.entrance[1],outside:false,route:[],speed:.7,wait:0,action:'整理貨物'});
  }
  for(const c of this.carts){if(!c.outside){c.wait-=dt;if(c.wait<=0){const shop=shops[c.id%shops.length];if(shop)this.travel(c,c.current===c.home?shop.id:c.home);c.wait=8;}}this.move(c,dt);}
 }
 move(p,dt){
  if(!p.outside)return;
  let remaining=dt*p.speed;
  while(p.route.length&&remaining>0){const [x,z]=p.route[0],dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);p.angle=Math.atan2(dx,dz);if(d<=remaining){p.x=x;p.z=z;p.route.shift();remaining-=d;}else{p.x+=dx/d*remaining;p.z+=dz/d*remaining;remaining=0;}}
  if(!p.route.length){p.outside=false;p.current=p.destination;}
 }
 demo(){
  this.place('home',[{x:-4,z:0},{x:-3,z:0},{x:-2,z:0}],true);
  this.place('shop',[{x:0,z:0},{x:1,z:0}],true);
  this.place('work',[{x:-2,z:-2},{x:-1,z:-2}],true);
  this.place('home',[{x:1,z:-3},{x:1,z:-2}],true);
  this.place('home',[{x:-5,z:3},{x:-4,z:3}],true);
  this.place('shop',[{x:-1,z:3}],true);
  this.place('work',[{x:-6,z:-2}],false);
  this.tick(.01);this.log('一城煙火，等你慢慢看');
 }
 toJSON(){return {version:1,time:this.time,elapsed:this.elapsed,nextId:this.nextId,buildings:this.buildings,blocks:this.blocks,people:this.people,carts:this.carts,events:this.events};}
 static restore(data){
  if(data?.version!==1||!Array.isArray(data.blocks)||!Array.isArray(data.buildings)||!Array.isArray(data.people)||!Array.isArray(data.carts))throw new Error('存檔格式不相容');
  if(data.buildings.length>143||!Number.isFinite(data.time)||!Number.isFinite(data.elapsed))throw new Error('存檔內容無效');
  const town=new Town();Object.assign(town,data);town.rebuildRoads();town.revision++;return town;
 }
}
