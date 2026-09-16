import {LiteratiScene} from './literati-scene.js';
import {songBuilding} from './song-buildings.js';
import {designFor,DESIGNS} from './heritage.js';
import {WeatherScene} from './weather-scene.js';
import {displayGoods} from './goods-scene.js';
import {at} from './production.js';
import {courtyards,courtyardFor,courtyardPosition} from './courtyards.js';
import {streetPosition} from './traffic.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {CELL,key,point} from './simulation.js';
import {streetHeight,riverX} from './life.js';
const palette={grass:0xaebc87,wood:0x73583a,cream:0xe5d7b5,roof:0x536264,stone:0xafa68a,road:0xcdbb91,leaf:0x83975e};
const materials=new Map();
function mat(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:1,flatShading:true}));return materials.get(color);}
function mesh(parent,geo,color,x=0,y=0,z=0){const m=new THREE.Mesh(geo,typeof color==='number'?mat(color):color);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(p,w,h,d,c,x=0,y=0,z=0){return mesh(p,new THREE.BoxGeometry(w,h,d),c,x,y,z);}
function ball(p,r,c,x,y,z,detail=0){return mesh(p,new THREE.IcosahedronGeometry(r,detail),c,x,y,z);}
function cyl(p,top,bottom,h,c,x,y,z,n=7){return mesh(p,new THREE.CylinderGeometry(top,bottom,h,n),c,x,y,z);}
function beam(p,a,b,r,c){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);const m=cyl(p,r,r,av.distanceTo(bv),c,...av.clone().add(bv).multiplyScalar(.5).toArray(),5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());return m;}
function batch(group){
 group.updateMatrixWorld(true);const buckets=new Map();group.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.deleteAttribute('uv');geo.applyMatrix4(o.matrixWorld);if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material).push(geo);});
 const out=new THREE.Group();for(const [material,geos] of buckets){const merged=mergeGeometries(geos,false);if(merged){const m=new THREE.Mesh(merged,material);m.castShadow=true;m.receiveShadow=true;out.add(m);}for(const g of geos)g.dispose();}group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});return out;
}
function roof(p,w,d,h,y,color){
 const r=w*.32,v=[[-w/2,y,-d/2],[w/2,y,-d/2],[w/2,y,d/2],[-w/2,y,d/2],[-r,y+h,0],[r,y+h,0]];
 const faces=[[0,1,5],[0,5,4],[3,4,5],[3,5,2],[0,4,3],[1,2,5]],positions=[];
 for(const face of faces)for(const idx of face)positions.push(...v[idx]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();const m=mesh(p,g,color);m.material.side=THREE.DoubleSide;
 beam(p,[-r-.1,y+h+.07,0],[r+.1,y+h+.07,0],.07,color);
 for(let i=-5;i<=5;i++){const x=i*w/12;for(const sign of [-1,1]){const rx=THREE.MathUtils.clamp(x,-r,r);beam(p,[x,y+.015,sign*d/2],[rx,y+h+.025,0],.021,color);}}
 for(const sign of [-1,1])beam(p,[-w/2,y+.04,sign*d/2],[w/2,y+.04,sign*d/2],.065,color);
}
function tree(parent,x,z,scale=1,willow=false){
 const p=new THREE.Group();p.position.set(x,0,z);p.scale.setScalar(scale);parent.add(p);cyl(p,.11,.19,2.5,0x79684b,0,1.25,0);
 for(let i=0;i<5;i++){const a=i*2.4,xx=Math.cos(a)*.8,zz=Math.sin(a)*.8;beam(p,[0,1.4,0],[xx,2.7,zz],.07,0x79684b);const crown=ball(p,1.1,[0x7f945e,0x91a56a,0xa4b67b][i%3],xx,2.9+(i%2)*.3,zz,1);crown.scale.y=willow?.65:.85;
 if(willow)for(let j=0;j<4;j++){const angle=a+j*1.4;const vine=cyl(p,.17,.015,1.65,0x91a36a,xx+Math.cos(angle)*.7,1.8,zz+Math.sin(angle)*.7,4);vine.rotation.z=Math.sin(angle)*.12;}}
}
function plant(p,x,z){for(let i=0;i<3;i++){const stem=cyl(p,.025,.015,.4+i*.13,0x8d9565,x+i*.08,.25,z,4);stem.rotation.z=(i-1)*.25;}}
function pot(p,x,z,color=0xb17d51,size=.23){cyl(p,size*.7,size,size*1.6,color,x,size*.8,z);cyl(p,size*.75,size*.75,.045,0x69543b,x,size*1.6,z);}
export class TownScene {
 constructor(canvas){
  this.canvas=canvas;this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.18;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0xcbd1b4);this.scene.fog=new THREE.Fog(0xcbd1b4,80,175);
  this.camera=new THREE.OrthographicCamera(-45,45,30,-30,.1,250);this.camera.position.set(41,53,65);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.target.set(-7,0,0);this.controls.enableDamping=true;this.controls.dampingFactor=.12;this.controls.minZoom=.6;this.controls.maxZoom=3.2;this.controls.maxPolarAngle=Math.PI*.37;this.controls.minPolarAngle=Math.PI*.2;this.controls.enableRotate=false;this.controls.screenSpacePanning=false;this.controls.mouseButtons.LEFT=THREE.MOUSE.PAN;this.controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;this.controls.touches.ONE=THREE.TOUCH.PAN;
  this.ambient=new THREE.HemisphereLight(0xfff5d7,0x6f8060,2.5);this.scene.add(this.ambient);
  this.sun=new THREE.DirectionalLight(0xffe8c0,3);this.sun.position.set(-30,45,10);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-48,right:48,top:42,bottom:-42,near:1,far:130});this.sun.shadow.normalBias=.055;this.sun.shadow.bias=-.0002;this.scene.add(this.sun);
  this.land=new THREE.Group();this.scene.add(this.land);this.meadow=new THREE.Group();this.scene.add(this.meadow);this.decorations=[];this.buildingModels=new Map();this.personModels=new Map();this.cartModels=new Map();this.glows=[];this.roads=new THREE.Group();this.scene.add(this.roads);this.preview=new THREE.Group();this.scene.add(this.preview);this.selection=new THREE.Group();this.scene.add(this.selection);this.raycaster=new THREE.Raycaster();this.groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);this.pointer=new THREE.Vector2();
  this.buildLandscape();this.lifeScene=new LivingScene(this);this.weatherScene=new WeatherScene(this);this.authorScene=new LiteratiScene(this);this.lastRevision=-1;this.resize();
 }
 resize(){const w=window.innerWidth,h=window.innerHeight;this.renderer.setSize(w,h);const aspect=w/h;this.camera.left=-31*aspect;this.camera.right=31*aspect;this.camera.top=31;this.camera.bottom=-31;this.camera.updateProjectionMatrix();}
 buildLandscape(){
  const ground=box(this.land,220,.4,220,palette.grass,0,-.35,0);ground.castShadow=false;
  const scenery=new THREE.Group();
  const riverVerts=[],indices=[];for(let i=0;i<=90;i++){const z=-90+i*2,c=19+Math.sin(z*.045)*3;riverVerts.push(c-5,-.08,z,c+5,-.08,z);if(i<90){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(riverVerts,3));rg.setIndex(indices);rg.computeVertexNormals();this.water=new THREE.MeshStandardMaterial({color:0x79a8a3,roughness:.6,metalness:.12,side:THREE.DoubleSide});mesh(this.land,rg,this.water);
  let seed=72;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let z=-70;z<75;z+=2.1){const center=19+Math.sin(z*.045)*3;for(const sign of [-1,1]){const x=center+sign*(5.25+rand()*.3);const rock=ball(scenery,.35+rand()*.32,rand()>.5?0xa5ab88:0xb2b294,x,.02,z,0);rock.scale.set(1.5,.55,1);if(rand()>.4)plant(scenery,x+sign*.5,z);}}
  for(let i=0;i<85;i++){const z=rand()*110-55,x=rand()*112-60;if(x>12&&x<35&&z>-23&&z<-3)continue;if(x>12&&x<28)continue;if(x>-34&&x<12&&z>-27&&z<27)continue;tree(scenery,x,z,.65+rand()*.8,i%4===0);}
  for(const [x,z,s] of [[11,13,1.4],[12,-25,1.2],[11,25,1.3],[29,-7,1.3],[30,16,1.15],[-31,29,1],[-36,10,1.1]])tree(scenery,x,z,s,true);
  // Shallow crop beds and sparse meadow details keep the town's empty land readable.
  for(let row=0;row<7;row++){box(scenery,14,.025,.48,0x9b9d6b,-23,0,-31-row*.85);for(let n=0;n<21;n++)cyl(scenery,.12,.18,.28,0x91a16a,-29.5+n*.65,.16,-31-row*.85,4);}
  for(let i=0;i<220;i++){const x=rand()*90-50,z=rand()*82-41;if(x>12&&x<29)continue;const g=new THREE.Group();const color=[0xa4b77e,0xb8c48b,0xc2ca98][i%3];ball(g,.12+rand()*.18,color,x,.04,z);if(i%5===0)ball(g,.065,0xe9deaf,x+.16,.13,z+.07);this.land.add(g);this.decorations.push({group:g,x,z});}
  // Arched wooden footbridge, simplified into modular planks.
  for(let i=0;i<26;i++){const x=12+i*.48,y=.5+Math.sin(i/25*Math.PI)*1.35;box(scenery,.46,.15,2.2,0xa48a60,x,y,-16);for(const side of [-1,1]){if(i%3===0)box(scenery,.11,.95,.11,palette.wood,x,y+.48,-16+side);if(i<25){const nx=x+.48,ny=.5+Math.sin((i+1)/25*Math.PI)*1.35;beam(scenery,[x,y+.85,-16+side],[nx,ny+.85,-16+side],.055,palette.wood);beam(scenery,[x,y+.4,-16+side],[nx,ny+.4,-16+side],.045,palette.wood);}}}
  for(let i=0;i<11;i++)box(scenery,.38,.12,2.7,0x9d8258,12+i*.42,.3,8);
  for(const x of [12,16])for(const z of [6.7,9.3])cyl(scenery,.1,.13,1.1,0x746348,x,.15,z);
  for(let i=0;i<7;i++){pot(scenery,12+i*.24,8.4,0x9c744c,.15);}
  this.scene.add(batch(scenery));
  this.boat=new THREE.Group();box(this.boat,1.8,.35,4.5,0x705336,0,.05,0);for(const x of [-.88,.88])box(this.boat,.14,.4,4.3,0x95734c,x,.35,0);box(this.boat,1.75,.3,.17,0x95734c,0,.34,2.2);box(this.boat,1.5,.8,2,0xbca777,0,.6,-.3);roof(this.boat,1.8,2.5,.5,1,0x97845d);pot(this.boat,-.4,1.5,0xb08d57,.23);pot(this.boat,.4,1.6,0xb08d57,.22);beam(this.boat,[0,.4,-2],[.6,1,-3],.04,0x67583c);this.scene.add(this.boat);
  this.ripples=new THREE.Group();for(let i=0;i<65;i++){const z=rand()*140-70,x=19+Math.sin(z*.045)*3+(rand()-.5)*8;box(this.ripples,.3+rand()*.9,.008,.028,0xa4c5b5,x,-.045,z);}this.scene.add(batch(this.ripples));
 }
 clearGroup(group){group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});group.clear();}
 sync(town){
  if(town.revision!==this.lastRevision){
   for(const [id,m] of this.buildingModels)if(!town.building(id)){this.scene.remove(m);this.clearGroup(m);this.buildingModels.delete(id);}
   for(const [id,m] of this.cartModels)if(!town.carts.some(c=>c.id===id)){this.scene.remove(m);this.clearGroup(m);this.cartModels.delete(id);}
   for(const b of town.buildings){const signature=JSON.stringify([b.stage,b.x,b.z,b.blockId,b.level,b.design,b.facing]);const existing=this.buildingModels.get(b.id);if(existing&&existing.userData.signature===signature)continue;if(existing){this.scene.remove(existing);this.clearGroup(existing);}const model=this.buildHouse(b,town);model.userData={...model.userData,buildingId:b.id,stage:b.stage,signature};model.traverse(o=>{o.userData.buildingId=b.id;});this.buildingModels.set(b.id,model);this.scene.add(model);}
   this.clearGroup(this.roads);const raw=new THREE.Group();
   for(const k of town.roads){const [x,z]=point(k);if((z===-16&&x>=12&&x<=24)||(z===8&&x>=12&&x<=16))continue;box(raw,.76,.025,.76,palette.road,x,streetHeight(x,z)-.025,z);for(const [dx,dz] of [[1,0],[0,1]])if(town.roads.has(key(x+dx,z+dz)))box(raw,dx?1:.76,.025,dz?1:.76,palette.road,x+dx*.5,streetHeight(x+dx*.5,z+dz*.5)-.025,z+dz*.5);}
   for(const c of town.publicWorks){const w=c.type==='avenue'?2.3:.95,color=c.type==='avenue'?0x89948d:0xa19d87;box(raw,4,.04,w,color,c.x*4,.015,c.z*4);box(raw,w,.04,4,color,c.x*4,.015,c.z*4);}
   this.roads.add(batch(raw));
   for(const d of this.decorations)d.group.visible=!town.buildings.some(b=>Math.abs(b.x*4-d.x)<(b.footprint?4.3:2.3)&&Math.abs(b.z*4-d.z)<(b.footprint?4.3:2.3))&&![...town.roads].some(k=>{const [x,z]=point(k);return Math.abs(x-d.x)<.5&&Math.abs(z-d.z)<.5;});
   this.clearGroup(this.meadow);const flowers=new THREE.Group();for(const d of this.decorations){if(d.group.visible){const copy=d.group.clone(true);copy.traverse(o=>{if(o.isMesh)o.geometry=o.geometry.clone();});flowers.add(copy);}d.group.visible=false;}this.meadow.add(batch(flowers));this.lastRevision=town.revision;
  }
  for(const p of town.people){if(!this.personModels.has(p.id)){const g=this.person(p.id);g.traverse(o=>o.userData.personId=p.id);this.personModels.set(p.id,g);this.scene.add(g);}}
  for(const c of town.carts){if(!this.cartModels.has(c.id)){const g=new THREE.Group();box(g,.7,.12,.95,0x94724b,0,.43,0);for(const x of [-.38,.38]){box(g,.08,.34,1,0x896945,x,.61,0);const wheel=cyl(g,.24,.24,.07,0x4e4635,x,.25,0,10);wheel.rotation.z=Math.PI/2;}box(g,.65,.35,.08,0x896945,0,.61,-.45);for(const x of [-.25,.25])box(g,.04,.04,.8,0x745b3e,x,.48,.7);const cargo=new THREE.Group();cargo.position.set(0,.55,-.2);cargo.position.y=.65;g.add(cargo);g.userData.cargo=cargo;const porter=this.person(c.id);porter.position.z=1.1;g.add(porter);this.cartModels.set(c.id,g);this.scene.add(g);}}
 }
 buildHouse(b,town={blocks:[]}){
  if(b.design||b.type==='shop'||b.type==='garden'||b.footprint){const raw=songBuilding(b,{box,cyl,ball,beam,roof,tree,mat}),warm=raw.userData.warm,model=batch(raw);model.userData.warm=warm;return model;}
  const g=new THREE.Group(),stage=b.stage,w=3.15,d=2.6,h=1.72+(b.variant===1?.22:0);g.position.set(b.x*4,0,b.z*4);g.rotation.y=b.facing;if(courtyardFor(town,b))g.scale.set(.72,.8,.72);
  box(g,3.8,.16,3.8,0xc4b58f,0,.03,0);box(g,w,.2,d,palette.stone,0,.16,-.2);
  if(stage===0){for(const x of [-1.3,1.3])for(const z of [-1.2,1.2])box(g,.22,.22,.22,0x9e9377,x,.3,z);for(let i=0;i<5;i++)box(g,1.2,.07,.1,palette.wood,-.5,.32+i*.08,.4);return batch(g);}
  for(const x of [-1.4,0,1.4])for(const z of [-1.35,1.0])box(g,.12,h,.12,palette.wood,x,h/2+.25,z);
  for(const z of [-1.35,1])box(g,3,.14,.15,palette.wood,0,h+.24,z);
  for(const x of [-1.4,1.4])box(g,.12,.12,2.5,palette.wood,x,h+.24,-.15);
  if(stage===1){for(const x of [-1.6,1.6]){beam(g,[x,.2,-1.4],[x,h+.5,1.4],.045,0xbba274);for(let y=.6;y<h+.7;y+=.45)box(g,.08,.05,3.1,0xac9569,x,y,0);}for(let i=0;i<7;i++)box(g,.55,.035,.12,0xae9263,1.65,.28+i*.25,.6);return batch(g);}
  box(g,2.8,h,2.35,[0xe5d7b5,0xd8cca9,0xded8bc][b.variant],0,h/2+.22,-.15);
  for(const z of [-1.34,1.04]){box(g,2.95,.11,.07,palette.wood,0,.53,z);box(g,2.95,.13,.07,palette.wood,0,h+.15,z);for(const x of [-1.4,1.4])box(g,.13,h,.1,palette.wood,x,h/2+.25,z);}
  const roofColor=[0x58666a,0x68716b,0x4c5d61][b.variant];roof(g,3.5,3.05,.9,h+.27,roofColor);
  if(stage===2){for(let i=0;i<4;i++)box(g,.5,.04,.12,0xb49a6b,-1.7,.3+i*.45,1.1);return batch(g);}
  box(g,.65,1.3,.06,0x756044,0,.86,1.06);box(g,.07,1.3,.05,0xbca178,0,.86,1.1);ball(g,.04,0xb7a171,.17,.83,1.15);
  const warm=new THREE.MeshStandardMaterial({color:0xc5a77b,emissive:0xffaa46,emissiveIntensity:0,roughness:.85});
  for(const x of [-.95,.95]){box(g,.53,.64,.055,warm,x,1.24,1.075);for(let i=-1;i<=1;i++)box(g,.025,.66,.045,palette.wood,x+i*.16,1.24,1.115);box(g,.56,.035,.05,palette.wood,x,1.24,1.12);box(g,.56,.045,.07,palette.wood,x,.9,1.12);}
  for(const x of [-1.41,1.41])box(g,.06,.6,.55,warm,x,1.23,-.15);
  if(b.type==='shop'){
   const awning=box(g,2.6,.07,1.1,[0xb87e52,0xa76b4c,0x8e9c81][b.variant],0,1.7,1.36);awning.rotation.x=.13;
   for(const x of [-1.25,1.25])box(g,.06,1.68,.06,palette.wood,x,.84,1.78);
   box(g,1.45,.1,.45,0x9b7c50,-.45,.63,1.56);for(const x of [-1,-.4])box(g,.07,.6,.1,palette.wood,x,.32,1.56);
   for(let i=0;i<4;i++)pot(g,-1+i*.34,1.58,[0xc8ac6e,0x8d9b80,0xa7774b][i%3],.12);
  }else if(b.type==='work'){
   box(g,1.1,.15,.62,0x967647,-.86,.55,1.48);for(let i=0;i<3;i++)pot(g,.7+i*.24,1.55,[0xae8051,0x79948a,0x998e69][b.variant],.17+i*.02);
   if(b.variant===1)for(let i=0;i<3;i++)cyl(g,.09,.09,1.1,palette.wood,-1.6,.17+i*.13,.1).rotation.z=Math.PI/2;
  }else{pot(g,-1.1,1.6,0xa67e52,.2);ball(g,.3,0x849764,-1.1,.6,1.6,1);box(g,.8,.11,.33,palette.wood,.92,.39,1.49);}
  // One soft lantern by the entrance; pools use alpha gradients instead of costly point lights.
  box(g,.04,.45,.04,palette.wood,1.48,1.8,1.25);cyl(g,.14,.14,.26,warm,1.48,1.47,1.25,8);box(g,.31,.035,.27,0x716044,1.48,1.62,1.25);
  if(stage===4){for(const x of [-1.7,1.7]){pot(g,x,-1.3,0xb08b5a,.17);ball(g,.25,0x91a16b,x,.48,-1.3,0);}box(g,.4,.43,.4,0xad9066,-1.5,.35,.25);}
  const model=batch(g);model.userData.warm=warm;
  const glowGeo=new THREE.PlaneGeometry(4,4),glowMat=new THREE.MeshBasicMaterial({map:this.glowTexture(),color:0xffbe5b,transparent:true,opacity:0,depthWrite:false});const glow=new THREE.Mesh(glowGeo,glowMat);glow.rotation.x=-Math.PI/2;const dx=Math.sin(b.facing),dz=Math.cos(b.facing);glow.position.set(b.x*4+dx*1.5,.075,b.z*4+dz*1.5);model.add(glow);model.userData.glow=glow;return model;
 }
 glowTexture(){if(this._glow)return this._glow;const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');const grad=ctx.createRadialGradient(32,32,1,32,32,32);grad.addColorStop(0,'rgba(255,255,255,0.75)');grad.addColorStop(.4,'rgba(255,255,255,0.35)');grad.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);this._glow=new THREE.CanvasTexture(c);return this._glow;}
 person(id){const g=new THREE.Group();const color=[0x637d85,0xae775b,0x818862,0xbba481,0x6d7970,0x9b847e][id%6];const body=cyl(g,.14,.23,.53,color,0,.45,0,6);body.scale.z=.7;ball(g,.135,0xceac7e,0,.84,0,1);ball(g,.105,0x444239,0,.94,-.01);if(id%3===0)cyl(g,.03,.32,.13,0xb49a63,0,.99,0,8);g.userData.legs=[];g.userData.arms=[];for(const x of [-.085,.085])g.userData.legs.push(box(g,.08,.19,.13,0x524e3d,x,.11,0));for(const x of [-.18,.18]){const arm=box(g,.08,.33,.1,color,x,.47,.01);arm.rotation.z=x>0?-.1:.1;g.userData.arms.push(arm);}if(id%4===0)ball(g,.18,0xb6a177,0,.58,-.17);g.userData.baseY=0;return g;}
 atScreen(clientX,clientY){const rect=this.canvas.getBoundingClientRect();this.pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const hit=new THREE.Vector3();return this.raycaster.ray.intersectPlane(this.groundPlane,hit)?hit:null;}
 pick(clientX,clientY){this.atScreen(clientX,clientY);const targets=[...this.authorScene.models.values(),...this.personModels.values(),...this.lifeScene.actors.values()].filter(g=>g.visible).concat([...this.buildingModels.values()],this.boat.visible?[this.boat]:[]);const hits=this.raycaster.intersectObjects(targets,true);for(const h of hits){if(h.object.userData.authorId)return {kind:'author',id:h.object.userData.authorId};if(h.object.userData.lifeId)return {kind:'life',id:h.object.userData.lifeId};if(h.object.userData.boat)return {kind:'boat',id:0};if(h.object.userData.personId)return {kind:'person',id:h.object.userData.personId};if(h.object.userData.buildingId)return {kind:'building',id:h.object.userData.buildingId};}return null;}
 outline(cells,color,group=this.preview){this.clearGroup(group);const set=new Set(cells.map(c=>key(c.x,c.z)));for(const c of cells){const tile=box(group,3.88,.025,3.88,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.13,depthWrite:false}),c.x*4,.2,c.z*4);tile.castShadow=false;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(!set.has(key(c.x+dx,c.z+dz)))box(group,dx?.055:4,.04,dz?.055:4,color,c.x*4+dx*2,.24,c.z*4+dz*2);}}
 update(town,dt){
  this.sync(town);const hour=town.time%24;
  const day=THREE.MathUtils.smoothstep(Math.sin((hour-6)/24*Math.PI*2),-.18,.35);this.scene.background.set(0x354b61).lerp(new THREE.Color(0xcbd1b4),day);this.scene.fog.color.copy(this.scene.background);this.ambient.intensity=1.2+day*1.3;this.ambient.color.set(0xa7c6ed).lerp(new THREE.Color(0xfff5d7),day);this.sun.intensity=.5+day*2.5;this.sun.color.set(0xadc5ed).lerp(new THREE.Color(0xffe8c0),day);this.water.color.set(0x405e72).lerp(new THREE.Color(0x79a8a3),day);
  for(const b of town.buildings){const model=this.buildingModels.get(b.id);if(model.userData.warm){const occupied=town.occupants(b).length>0;model.userData.warm.emissiveIntensity=(1-day)*(occupied?2.2:.5);if(model.userData.glow)model.userData.glow.material.opacity=(1-day)*(occupied?.5:.16);}}
  for(const p of town.people){const m=this.personModels.get(p.id),b=town.building(p.current),yard=!p.outside&&b&&hour>=6&&hour<20;m.visible=p.outside||yard;if(p.outside){const [px,pz]=streetPosition(p);m.position.set(px,streetHeight(p.x,p.z)+(p.traffic?.startsWith('讓')?0:Math.abs(Math.sin(town.elapsed*8+p.id))*.025),pz);m.rotation.y=p.angle||0;}else if(yard){const court=courtyardPosition(town,p),side=(p.id%2?-.4:.4),inset=b.type==='garden'?.12:courtyardFor(town,b)?1:.65;m.position.set(court?court[0]:b.entrance[0]+Math.cos(b.facing)*side-Math.sin(b.facing)*inset,.16,court?court[1]:b.entrance[1]-Math.sin(b.facing)*side-Math.cos(b.facing)*inset);m.rotation.y=b.facing;}this.lifeScene.animateHuman(m,town.elapsed,p.outside&&p.route.length>0&&!p.traffic?.startsWith('讓')&&p.traffic!=='等前方行人走開'&&!(p.socialUntil>town.elapsed),p.socialUntil>town.elapsed||yard||!!p.streetEvent&&!p.route.length);}
  for(const c of town.carts){const m=this.cartModels.get(c.id);m.visible=c.outside;m.position.set(c.x,streetHeight(c.x,c.z),c.z);m.rotation.y=c.angle||0;displayGoods(m.userData.cargo,at(town,`cart:${c.id}`));}
  this.lifeScene.update(town,day);this.weatherScene.update(town);this.authorScene.update(town);if(town.weather.raining){this.sun.intensity*=.45;this.ambient.intensity*=.8;this.scene.background.lerp(new THREE.Color(0x7c9699),.4);this.scene.fog.color.copy(this.scene.background);}
  this.controls.update();this.updateFollow(town,dt);this.controls.target.x=THREE.MathUtils.clamp(this.controls.target.x,-45,40);this.controls.target.z=THREE.MathUtils.clamp(this.controls.target.z,-45,45);this.renderer.render(this.scene,this.camera);return day;
 }
 reset(){this.authorScene.reset();this.lifeScene.reset();for(const map of [this.buildingModels,this.personModels,this.cartModels]){for(const model of map.values()){this.scene.remove(model);this.clearGroup(model);}map.clear();}this.clearGroup(this.selection);this.clearGroup(this.preview);this.lastRevision=-1;}
 focusAt(point,zoom=2.2,overhead=false){
  this.follow(null);const target=new THREE.Vector3(point[0],0,point[1]);this.camera.position.add(target.clone().sub(this.controls.target));this.controls.target.copy(target);if(overhead){const offset=this.camera.position.clone().sub(this.controls.target),horizontal=Math.hypot(offset.x,offset.z),radius=offset.length()/Math.sqrt(2.44);offset.x*=radius/horizontal;offset.z*=radius/horizontal;offset.y=radius*1.2;this.camera.position.copy(this.controls.target).add(offset);}this.camera.zoom=zoom;this.camera.updateProjectionMatrix();
 }
 follow(id){this.followId=id;}
 updateFollow(town,dt){
  if(this.followId==null)return;const author=typeof this.followId==='string'&&this.followId.startsWith('author:')?this.followId.slice(7):null;const p=author?town.literati.actors.find(a=>a.author===author):town.people.find(p=>p.id===this.followId);if(!p){this.followId=null;return;}
  const model=author?this.authorScene.models.get(author):this.personModels.get(p.id),b=town.building(p.current)||town.building(p.home);
  const target=model?.visible?model.position.clone():new THREE.Vector3(b?b.x*4:p.x,0,b?b.z*4:p.z);target.y=0;
  const delta=target.sub(this.controls.target).multiplyScalar(1-Math.exp(-dt*7));this.controls.target.add(delta);this.camera.position.add(delta);
 }
 showBuildGrid(visible){if(!this.plotGrid){this.plotGrid=new THREE.Group();this.scene.add(this.plotGrid);const material=new THREE.LineBasicMaterial({color:0x5e7354,transparent:true,opacity:.36});for(let x=-34;x<=10;x+=4)this.plotGrid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,.11,-26),new THREE.Vector3(x,.11,26)]),material));for(let z=-26;z<=26;z+=4)this.plotGrid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-34,.11,z),new THREE.Vector3(10,.11,z)]),material));}this.plotGrid.visible=visible;}
 resetView(){this.controls.target.set(-7,0,0);this.camera.position.set(41,53,65);this.camera.zoom=1;this.camera.updateProjectionMatrix();}
 rotate(angle){const offset=this.camera.position.clone().sub(this.controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle);this.camera.position.copy(this.controls.target).add(offset);}
}

function sign(parent,text,x,y,z,w=.5,h=.8){
 const c=document.createElement('canvas');c.width=96;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#dcc99d';ctx.fillRect(0,0,96,128);ctx.strokeStyle='#785b3a';ctx.lineWidth=6;ctx.strokeRect(5,5,86,118);ctx.fillStyle='#584d37';ctx.font='bold 65px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,48,65);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,side:THREE.DoubleSide,roughness:1}));m.position.set(x,y,z);parent.add(m);return m;
}
function animal(parent,color=0x806c4f,scale=1,horns=true){
 const g=new THREE.Group();parent.add(g);g.scale.setScalar(scale);const torso=box(g,.55,.53,1.05,color,0,.75,0);const head=box(g,.4,.44,.48,color,0,.98,.7);box(g,.37,.2,.25,0xad9a74,0,.82,.96);const legs=[];for(const x of [-.2,.2])for(const z of [-.35,.35]){const leg=box(g,.1,.55,.12,color,x,.29,z);legs.push(leg);}
 for(const x of [-.2,.2]){if(horns)beam(g,[x,1.13,.72],[x*1.8,1.35,.55],.045,0xd4c8a7);else cyl(g,0,.10,.20,color,x*.75,1.23,.7,3);ball(g,.035,0x242b29,x,1,.83);}
 beam(g,[0,.95,-.5],[.07,.4,-.7],.025,color);g.userData.legs=legs;return g;
}
class LivingScene {
 constructor(owner){
  this.owner=owner;this.root=new THREE.Group();owner.scene.add(this.root);this.actors=new Map();this.details=new Map();this.workers=new Map();this.flags=[];this.lamps=[];this.smoke=[];this.shared=[];
  const landscape=new THREE.Group();
  // Raised timber arch ribs, with no pillars in the navigation channel.
  for(const z of [-17.02,-14.98])for(let i=0;i<12;i++){const x=12+i;beam(landscape,[x,.22+Math.sin(i/12*Math.PI)*1.35,z],[x+1,.22+Math.sin((i+1)/12*Math.PI)*1.35,z],.13,0x8c704c);if(i%2===0)beam(landscape,[x,.1+Math.sin(i/12*Math.PI)*1.35,z],[x+1,.5+Math.sin((i+1)/12*Math.PI)*1.35,z],.08,0xa1895e);}
  const gate=new THREE.Group();gate.position.set(31,0,-16);gate.rotation.y=Math.PI/2;landscape.add(gate);
  for(const x of [-2.3,2.3]){box(gate,2,3.4,2.4,0xaaa589,x,1.7,0);box(gate,3,1.35,2,0xc7bd99,x*1.8,.675,0);}
  box(gate,6.4,.85,2.5,0xaaa589,0,3.2,0);box(gate,5.5,1.25,2.1,0xdac9a4,0,4.2,0);
  for(const x of [-2.5,-1.2,0,1.2,2.5])box(gate,.14,1.5,2.2,0x6e593b,x,4.2,0);roof(gate,6.8,3.3,1.25,5,0x5d6966);
  for(const z of [-18,-13,-9]){
   const stall=new THREE.Group();stall.position.set(28,0,z);stall.rotation.y=-Math.PI/2;landscape.add(stall);box(stall,1.5,.1,.8,0xa88a59,0,.7,0);for(const x of [-.72,.72]){box(stall,.08,1.8,.08,0x80653d,x,.9,0);box(stall,.06,.7,.06,0x80653d,x,.35,.3);}box(stall,1.8,.07,1.3,z===-13?0xa47554:0xbfa773,0,1.85,0);for(let i=0;i<5;i++)pot(stall,-.6+i*.27,.15,0x9a8058,.13);
   const flag=sign(this.root,z===-18?'茶':z===-13?'食':'布',27.5,1.3,z,.45,.7);flag.rotation.y=-Math.PI/2;this.flags.push(flag);
  }
  // A small cargo store at the landward end of the pier.
  for(let i=0;i<8;i++)box(landscape,.48,.46,.48,0xb49a6a,11.1+(i%2)*.55,.23+Math.floor(i/4)*.46,6.2+Math.floor(i%4/2)*.55);
  box(landscape,2.3,.08,1.9,0xb49d73,11.3,2.2,6.4);for(const x of [10.3,12.3])box(landscape,.08,2.2,.08,0x92764d,x,1.1,6.4);
  for(const [x,z] of [[11,-16],[24,-16],[26,-8],[12,8],[12,17]]){box(landscape,.1,2,.1,0x756448,x,1,z);beam(landscape,[x,1.9,z],[x+.35,1.9,z],.04,0x756448);const material=new THREE.MeshStandardMaterial({color:0xd6b575,emissive:0xffa333,emissiveIntensity:0});cyl(landscape,.19,.19,.35,material,x+.35,1.64,z,8);this.lamps.push(material);}
  this.root.add(batch(landscape));
  this.fisher=owner.person(5021);this.fisher.position.set(12.4,0,19);this.fisher.rotation.y=Math.PI/2;this.root.add(this.fisher);const pole=beam(this.fisher,[.15,.65,.2],[.2,1.6,2.2],.023,0x80754b);this.fisher.userData.pole=pole;
  this.washer=owner.person(5022);this.washer.position.set(12.5,0,14);this.washer.rotation.y=Math.PI/2;this.root.add(this.washer);const cloth=box(this.washer,.5,.025,.7,0xb6c5b1,0,.15,.7);this.washer.userData.cloth=cloth;
  this.dog=animal(this.root,0xb29569,.43,false);
  this.ducks=[];for(let i=0;i<5;i++){const g=new THREE.Group();ball(g,.18,0xe3ddc5,0,.13,0,1).scale.z=1.5;ball(g,.11,0xe5dfc9,0,.3,.16);box(g,.09,.04,.12,0xc9a056,0,.28,.27);this.ducks.push(g);this.root.add(g);}
  this.birds=[];for(let i=0;i<5;i++){const g=new THREE.Group();for(const side of [-1,1]){const wing=box(g,.5,.025,.16,0x697565,side*.23,0,0);wing.rotation.z=side*.3;}this.birds.push(g);this.root.add(g);}
  this.rope=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(16,.5,8),new THREE.Vector3(17,.6,8)]),new THREE.LineBasicMaterial({color:0xa3946b}));this.root.add(this.rope);
  const mast=new THREE.Group();mast.position.set(0,1.2,.65);beam(mast,[0,0,0],[0,2.5,0],.04,0x806845);const sail=box(mast,1.25,1.65,.035,0xc7bc96,.6,1.5,0);owner.boat.add(mast);owner.boat.userData.mast=mast;owner.boat.userData.sail=sail;
  const boatman=owner.person(5031);boatman.position.set(.3,.3,-1.8);owner.boat.add(boatman);owner.boat.userData.boatman=boatman;
  this.boatCargo=new THREE.Group();for(let i=0;i<4;i++)box(this.boatCargo,.35,.3,.35,0xbc9d6c,(i%2-.5)*.45,.42,1.4+Math.floor(i/2)*.4);owner.boat.add(this.boatCargo);owner.boat.traverse(o=>o.userData.boat=true);
  this.sharedRevision=-1;
 }
 actorModel(a){
  const g=new THREE.Group();
  if(a.kind==='ox'){
   box(g,.85,.13,1.2,0x977347,0,.53,-.35);for(const x of [-.46,.46]){box(g,.09,.4,1.2,0x947246,x,.74,-.35);const wheel=cyl(g,.31,.31,.1,0x62563e,x,.34,-.35,10);wheel.rotation.z=Math.PI/2;beam(g,[x,.55,.1],[x,1,1.9],.035,0x80613c);}const ox=animal(g,0x8d7956);ox.position.z=1.7;g.userData.ox=ox;
   const driver=this.owner.person(4061);driver.position.set(-.7,0,.5);g.add(driver);g.userData.driver=driver;
   const cargo=new THREE.Group();for(let i=0;i<3;i++)box(cargo,.33,.38,.4,0xb59b6c,(i%2-.5)*.4,.8,-.5+Math.floor(i/2)*.4);cargo.position.y=.65;g.add(cargo);g.userData.cargo=cargo;
  }else{
   const human=this.owner.person(a.id);g.add(human);g.userData.human=human;
   if(a.kind==='peddler'){beam(g,[-.65,.75,0],[.65,.75,0],.025,0x81683d);for(const x of [-.6,.6]){beam(g,[x,.75,0],[x,.35,0],.015,0x8a7753);cyl(g,.2,.16,.27,0xad9364,x,.23,0,6);}}
   if(a.kind==='porter'){const cargo=box(g,.38,.38,.4,0xb8a176,0,.98,-.2);g.userData.cargo=cargo;}
  }
  g.traverse(o=>o.userData.lifeId=a.id);return g;
 }
 animateHuman(g,time,moving,talking=false){
  const phase=time*7+(g.id%7);for(let i=0;i<(g.userData.legs||[]).length;i++)g.userData.legs[i].rotation.x=moving?Math.sin(phase+i*Math.PI)*.4:0;
  for(let i=0;i<(g.userData.arms||[]).length;i++)g.userData.arms[i].rotation.x=talking?-.7+Math.sin(time*4+i)*.2:moving?Math.sin(phase+i*Math.PI)*.3:0;
 }
 syncDetails(t){
  for(const b of t.buildings){if(b.stage<3||this.details.has(b.id))continue;
   const group=new THREE.Group();group.position.set(b.x*4,0,b.z*4);group.rotation.y=b.facing;if(courtyardFor(t,b)&&b.type==='home')group.scale.set(.72,.8,.72);this.root.add(group);
   if(b.type!=='home'){const flag=sign(group,DESIGNS[designFor(b)]?.mark||['瓷','木','織'][b.variant],b.footprint?1.5:1.15,1.9,b.footprint?3.55:1.65,.42,.68);this.flags.push(flag);}
   const sheets=[];if(b.type==='home'&&!b.footprint){beam(group,[-1.2,1.25,-1.58],[1.2,1.25,-1.58],.015,0x776d4d);for(let i=0;i<3;i++){const sheet=box(group,.35,.6,.018,[0xd8c59d,0x9caa92,0xc7b59b][i],-.65+i*.55,.95,-1.57);sheets.push(sheet);}}
   const steam=[];if(b.type==='work'||designFor(b)==='food')for(let i=0;i<3;i++){const m=ball(group,.12,new THREE.MeshBasicMaterial({color:0xe4decc,transparent:true,opacity:.19,depthWrite:false}),.6,2.8,-.4,1);steam.push(m);}
   const cargo=new THREE.Group();cargo.position.set(-.6,.2,1.65);group.add(cargo);const dragonflies=[];if(b.design==='pond')for(let i=0;i<3;i++){const insect=new THREE.Group();box(insect,.035,.035,.23,0x70574a);box(insect,.38,.015,.07,0xc7d7c1);group.add(insect);dragonflies.push(insect);}this.details.set(b.id,{group,sheets,steam,cargo,dragonflies});
  }
  for(const b of t.buildings){if(b.stage>=3){const m=this.workers.get(b.id);if(m)m.visible=false;continue;}if(!this.workers.has(b.id)){const m=this.owner.person(6000+b.id);this.root.add(m);this.workers.set(b.id,m);}}
  if(this.sharedRevision!==t.revision){
   for(const obj of this.shared){this.root.remove(obj);obj.traverse(o=>{if(o.geometry)o.geometry.dispose();});}this.shared=[];
   for(const block of t.blocks)for(const c of courtyards(block)){
    if(!t.buildings.filter(b=>b.blockId===block.id).every(b=>b.stage>=3))continue;
    const g=new THREE.Group();g.position.set(c.x,0,c.z);if(!c.acrossX)g.rotation.y=Math.PI/2;
    box(g,1.2,.045,3.2,0xbab59a,0,.12,0);box(g,.3,.28,.72,0x8c7956,-.38,.27,-.7);pot(g,.38,-.9,0xa18864,.17);
    // Side gate and drying line open into the shared court, never into a new road.
    for(const x of [-.53,.53])box(g,.065,1.05,.065,0x8c7450,x,.55,1.45);beam(g,[-.53,1.1,1.45],[.53,1.1,1.45],.035,0x8c7450);
    const sheets=new THREE.Group();for(let i=0;i<2;i++)box(sheets,.28,.4,.025,[0xc8b78d,0x9aaa94][i],-.24+i*.48,.88,1.43);g.add(sheets);g.userData.sheets=sheets;
    // A visible side door on each facing wall connects the houses to the courtyard.
    for(const x of [-.99,.99])box(g,.03,.72,.45,0x80684d,x,.58,.25);
    g.traverse(o=>{const b=t.buildings.find(b=>b.blockId===block.id);o.userData.buildingId=b.id;});this.root.add(g);this.shared.push(g);
   }
   this.sharedRevision=t.revision;
  }
 }
 update(t,day){
  this.syncDetails(t);
  const event=t.stories.active;
  if(event){
   if(!this.storyHost){this.storyHost=new THREE.Group();this.storySpeaker=this.owner.person(7010);this.storyHost.add(this.storySpeaker);box(this.storyHost,.6,.5,.45,0x8d7049,0,.25,.55);sign(this.storyHost,'聚',0,1.5,0,.45,.6);this.root.add(this.storyHost);}
   this.storyHost.visible=true;this.storyHost.position.set(event.center[0],streetHeight(...event.center),event.center[1]);this.animateHuman(this.storySpeaker,t.elapsed,false,true);
  }else if(this.storyHost)this.storyHost.visible=false;
  const time=t.elapsed,daytime=t.time%24>=6&&t.time%24<20;
  for(const a of [...t.life.visitors,...t.life.porters,...t.life.oxen]){
   let g=this.actors.get(a.id);if(!g){g=this.actorModel(a);this.actors.set(a.id,g);this.root.add(g);}g.visible=a.visible;const [ax,az]=streetPosition(a);g.position.set(ax,streetHeight(a.x,a.z),az);g.rotation.y=a.angle||0;
   if(g.userData.cargo){const cargo=g.userData.cargo;if(!cargo.isGroup){g.remove(cargo);cargo.geometry.dispose();g.userData.cargo=new THREE.Group();g.userData.cargo.position.set(0,.95,-.2);g.add(g.userData.cargo);}displayGoods(g.userData.cargo,at(t,`${a.kind==='ox'?'ox':'porter'}:${a.id}`),{lifeId:a.id});g.userData.cargo.visible=a.carrying>0;}
   if(g.userData.human)this.animateHuman(g.userData.human,time,a.walking&&!a.traffic?.startsWith('讓')&&a.traffic!=='等前方行人走開',a.action.includes('談'));
   if(g.userData.driver)this.animateHuman(g.userData.driver,time,a.walking);
   if(g.userData.ox){const ox=g.userData.ox;ox.position.y=streetHeight(a.x+Math.sin(a.angle||0)*1.7,a.z+Math.cos(a.angle||0)*1.7)-streetHeight(a.x,a.z);for(let i=0;i<ox.userData.legs.length;i++)ox.userData.legs[i].rotation.x=a.walking?Math.sin(time*4+i*Math.PI)*.32:0;}
  }
  for(const g of this.shared)g.userData.sheets.visible=!t.weather.raining;
  for(const [id,d] of this.details){const b=t.building(id);for(let i=0;i<d.dragonflies.length;i++){const f=d.dragonflies[i],r=b.footprint?2:1;f.visible=daytime&&!t.weather.raining;f.position.set(Math.sin(time*.5+i*2)*r,.7+Math.sin(time+i)*.12,Math.cos(time*.4+i*2)*r);f.rotation.y=-time*.5;}displayGoods(d.cargo,at(t,`${b.type==='shop'?'shop':'output'}:${id}`),{buildingId:id});for(const sheet of d.sheets)sheet.visible=!t.weather.raining&&!courtyardFor(t,b);for(let i=0;i<d.sheets.length;i++)d.sheets[i].rotation.x=Math.sin(time*1.1+i)*.09;for(let i=0;i<d.steam.length;i++){const m=d.steam[i],phase=(time*.32+i/3)%1;m.visible=daytime&&t.occupants(b).length>0;m.position.y=2.5+phase*1.7;m.position.x=.5+Math.sin(phase*4)*.15;m.scale.setScalar(.7+phase*1.5);m.material.opacity=(1-phase)*.2;}}
  for(const [id,g] of this.workers){const b=t.building(id);g.visible=b.stage<3;if(g.visible){g.position.set(b.entrance[0],streetHeight(...b.entrance),b.entrance[1]);g.rotation.y=b.facing+Math.PI;this.animateHuman(g,time,false,true);}}
  for(const flag of this.flags)flag.rotation.z=Math.sin(time*.9+flag.id)*.055;for(const material of this.lamps)material.emissiveIntensity=(1-day)*1.8;
  this.fisher.visible=this.washer.visible=daytime&&!t.weather.raining;this.fisher.userData.pole.rotation.x=Math.sin(time*.8)*.07;this.animateHuman(this.washer,time,false,true);this.washer.userData.cloth.position.y=.15+Math.sin(time*2)*.04;
  this.dog.position.set(12,0,13+Math.sin(time*.15)*3);this.dog.rotation.y=Math.cos(time*.15)>0?0:Math.PI;for(let i=0;i<4;i++)this.dog.userData.legs[i].rotation.x=Math.sin(time*7+i*Math.PI)*.3;
  this.ducks.forEach((g,i)=>{g.position.set(riverX(20)-2+i*.42+Math.sin(time*.18+i)*.5,0,19+Math.sin(time*.12+i*.4)*1.5);g.rotation.y=Math.cos(time*.12+i*.4)>0?0:Math.PI;});
  this.birds.forEach((g,i)=>{g.visible=daytime;g.position.set(-10+Math.sin(time*.04+i*.06)*22,9+i*.25,Math.cos(time*.04)*18+i);g.rotation.y=time*.04;g.children.forEach((wing,n)=>wing.rotation.z=Math.sin(time*6+i)*(n?-.45:.45));});
  const b=t.life.boat;this.owner.boat.visible=t.buildings.length>0&&b.state!=='away';this.owner.boat.position.set(b.x,Math.sin(time*.8)*.025,b.z);this.owner.boat.rotation.y=0;this.owner.boat.userData.mast.rotation.x=(b.state==='approach'?Math.PI*.49*THREE.MathUtils.smoothstep(6-Math.abs(b.z+16),0,2):0);this.owner.boat.userData.sail.visible=b.mast===1;displayGoods(this.boatCargo,at(t,'boat'),{boat:true});this.boatCargo.position.set(0,.45,.9);this.boatCargo.visible=b.cargo>0;this.rope.visible=b.state==='unloading';
 }
 reset(){for(const group of [...this.actors.values(),...this.workers.values(),...this.shared,...[...this.details.values()].map(d=>d.group)]){this.root.remove(group);group.traverse(o=>{if(o.geometry)o.geometry.dispose();});}this.flags=this.flags.filter(f=>f.parent===this.root);this.actors.clear();this.workers.clear();this.details.clear();this.shared=[];this.sharedRevision=-1;}
}
