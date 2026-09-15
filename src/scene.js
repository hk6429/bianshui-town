import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {CELL,key,point} from './simulation.js';
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
  this.land=new THREE.Group();this.scene.add(this.land);this.decorations=[];this.buildingModels=new Map();this.personModels=new Map();this.cartModels=new Map();this.glows=[];this.roads=new THREE.Group();this.scene.add(this.roads);this.preview=new THREE.Group();this.scene.add(this.preview);this.selection=new THREE.Group();this.scene.add(this.selection);this.raycaster=new THREE.Raycaster();this.groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);this.pointer=new THREE.Vector2();
  this.buildLandscape();this.lastRevision=-1;this.resize();
 }
 resize(){const w=window.innerWidth,h=window.innerHeight;this.renderer.setSize(w,h);const aspect=w/h;this.camera.left=-31*aspect;this.camera.right=31*aspect;this.camera.top=31;this.camera.bottom=-31;this.camera.updateProjectionMatrix();}
 buildLandscape(){
  const ground=box(this.land,220,.4,220,palette.grass,0,-.35,0);ground.castShadow=false;
  const scenery=new THREE.Group();
  const riverVerts=[],indices=[];for(let i=0;i<=90;i++){const z=-90+i*2,c=19+Math.sin(z*.045)*3;riverVerts.push(c-5,-.08,z,c+5,-.08,z);if(i<90){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(riverVerts,3));rg.setIndex(indices);rg.computeVertexNormals();this.water=new THREE.MeshStandardMaterial({color:0x79a8a3,roughness:.6,metalness:.12,side:THREE.DoubleSide});mesh(this.land,rg,this.water);
  let seed=72;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let z=-70;z<75;z+=2.1){const center=19+Math.sin(z*.045)*3;for(const sign of [-1,1]){const x=center+sign*(5.25+rand()*.3);const rock=ball(scenery,.35+rand()*.32,rand()>.5?0xa5ab88:0xb2b294,x,.02,z,0);rock.scale.set(1.5,.55,1);if(rand()>.4)plant(scenery,x+sign*.5,z);}}
  for(let i=0;i<85;i++){const z=rand()*110-55,x=rand()*112-60;if(x>12&&x<28)continue;if(x>-34&&x<12&&z>-27&&z<27)continue;tree(scenery,x,z,.65+rand()*.8,i%4===0);}
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
   for(const b of town.buildings){const existing=this.buildingModels.get(b.id);if(existing&&existing.userData.stage===b.stage)continue;if(existing){this.scene.remove(existing);this.clearGroup(existing);}const model=this.buildHouse(b);model.userData={...model.userData,buildingId:b.id,stage:b.stage};model.traverse(o=>{o.userData.buildingId=b.id;});this.buildingModels.set(b.id,model);this.scene.add(model);}
   this.clearGroup(this.roads);const raw=new THREE.Group();
   for(const k of town.roads){const [x,z]=point(k);box(raw,.76,.025,.76,palette.road,x,-.025,z);for(const [dx,dz] of [[1,0],[0,1]])if(town.roads.has(key(x+dx,z+dz)))box(raw,dx?1:.76,.025,dz?1:.76,palette.road,x+dx*.5,-.025,z+dz*.5);}
   this.roads.add(batch(raw));
   for(const d of this.decorations)d.group.visible=!town.buildings.some(b=>Math.abs(b.x*4-d.x)<2.3&&Math.abs(b.z*4-d.z)<2.3)&&![...town.roads].some(k=>{const [x,z]=point(k);return Math.abs(x-d.x)<.5&&Math.abs(z-d.z)<.5;});
   this.lastRevision=town.revision;
  }
  for(const p of town.people){if(!this.personModels.has(p.id)){const g=this.person(p.id);g.traverse(o=>o.userData.personId=p.id);this.personModels.set(p.id,g);this.scene.add(g);}}
  for(const c of town.carts){if(!this.cartModels.has(c.id)){const g=new THREE.Group();box(g,.7,.12,.95,0x94724b,0,.43,0);for(const x of [-.38,.38]){box(g,.08,.34,1,0x896945,x,.61,0);const wheel=cyl(g,.24,.24,.07,0x4e4635,x,.25,0,10);wheel.rotation.z=Math.PI/2;}box(g,.65,.35,.08,0x896945,0,.61,-.45);for(const x of [-.25,.25])box(g,.04,.04,.8,0x745b3e,x,.48,.7);pot(g,0,0,0xb89e72,.23);const porter=this.person(c.id);porter.position.z=1.1;g.add(porter);this.cartModels.set(c.id,g);this.scene.add(g);}}
 }
 buildHouse(b){
  const g=new THREE.Group(),stage=b.stage,w=3.15,d=2.6,h=1.72+(b.variant===1?.22:0);g.position.set(b.x*4,0,b.z*4);g.rotation.y=b.facing;
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
 person(id){const g=new THREE.Group();const color=[0x637d85,0xae775b,0x818862,0xbba481,0x6d7970,0x9b847e][id%6];const body=cyl(g,.14,.23,.53,color,0,.45,0,6);body.scale.z=.7;ball(g,.135,0xceac7e,0,.84,0,1);ball(g,.105,0x444239,0,.94,-.01);if(id%3===0)cyl(g,.03,.32,.13,0xb49a63,0,.99,0,8);for(const x of [-.085,.085])box(g,.08,.19,.13,0x524e3d,x,.11,0);for(const x of [-.18,.18]){const arm=box(g,.08,.33,.1,color,x,.47,.01);arm.rotation.z=x>0?-.1:.1;}if(id%4===0)ball(g,.18,0xb6a177,0,.58,-.17);g.userData.baseY=0;return g;}
 atScreen(clientX,clientY){const rect=this.canvas.getBoundingClientRect();this.pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const hit=new THREE.Vector3();return this.raycaster.ray.intersectPlane(this.groundPlane,hit)?hit:null;}
 pick(clientX,clientY){this.atScreen(clientX,clientY);const targets=[...this.personModels.values()].filter(g=>g.visible).concat([...this.buildingModels.values()]);const hits=this.raycaster.intersectObjects(targets,true);for(const h of hits){if(h.object.userData.personId)return {kind:'person',id:h.object.userData.personId};if(h.object.userData.buildingId)return {kind:'building',id:h.object.userData.buildingId};}return null;}
 outline(cells,color,group=this.preview){this.clearGroup(group);const set=new Set(cells.map(c=>key(c.x,c.z)));for(const c of cells){const tile=box(group,3.88,.025,3.88,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.13,depthWrite:false}),c.x*4,.2,c.z*4);tile.castShadow=false;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(!set.has(key(c.x+dx,c.z+dz)))box(group,dx?.055:4,.04,dz?.055:4,color,c.x*4+dx*2,.24,c.z*4+dz*2);}}
 update(town,dt){
  this.sync(town);const hour=town.time%24;
  const day=THREE.MathUtils.smoothstep(Math.sin((hour-6)/24*Math.PI*2),-.18,.35);this.scene.background.set(0x354b61).lerp(new THREE.Color(0xcbd1b4),day);this.scene.fog.color.copy(this.scene.background);this.ambient.intensity=1.2+day*1.3;this.ambient.color.set(0xa7c6ed).lerp(new THREE.Color(0xfff5d7),day);this.sun.intensity=.5+day*2.5;this.sun.color.set(0xadc5ed).lerp(new THREE.Color(0xffe8c0),day);this.water.color.set(0x405e72).lerp(new THREE.Color(0x79a8a3),day);
  for(const b of town.buildings){const model=this.buildingModels.get(b.id);if(model.userData.warm){const occupied=town.occupants(b).length>0;model.userData.warm.emissiveIntensity=(1-day)*(occupied?2.2:.5);model.userData.glow.material.opacity=(1-day)*(occupied?.5:.16);}}
  for(const p of town.people){const m=this.personModels.get(p.id);m.visible=p.outside;if(p.outside){m.position.set(p.x,Math.abs(Math.sin(town.elapsed*8+p.id))*.035,p.z);m.rotation.y=p.angle||0;}}
  for(const c of town.carts){const m=this.cartModels.get(c.id);m.visible=c.outside;m.position.set(c.x,0,c.z);m.rotation.y=c.angle||0;}
  const z=35-Math.sin(town.elapsed*.012)*58;this.boat.position.set(19+Math.sin(z*.045)*3,Math.sin(town.elapsed*.8)*.035,z);this.boat.rotation.y=Math.cos(town.elapsed*.012)>=0?Math.PI:0;
  this.controls.update();this.controls.target.x=THREE.MathUtils.clamp(this.controls.target.x,-45,40);this.controls.target.z=THREE.MathUtils.clamp(this.controls.target.z,-45,45);this.renderer.render(this.scene,this.camera);return day;
 }
 reset(){for(const map of [this.buildingModels,this.personModels,this.cartModels]){for(const model of map.values()){this.scene.remove(model);this.clearGroup(model);}map.clear();}this.clearGroup(this.selection);this.clearGroup(this.preview);this.lastRevision=-1;}
 resetView(){this.controls.target.set(-7,0,0);this.camera.position.set(41,53,65);this.camera.zoom=1;this.camera.updateProjectionMatrix();}
 rotate(angle){const offset=this.camera.position.clone().sub(this.controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle);this.camera.position.copy(this.controls.target).add(offset);}
}
