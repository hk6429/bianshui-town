import * as THREE from 'three';
import {designFor} from './heritage.js';
// The shared primitives also serve the original village; each plan has its own silhouette.
export function songBuilding(b,api){
 const {box,cyl,ball,beam,roof,tree,mat}=api,g=new THREE.Group();
 const design=designFor(b),large=!!b.footprint,size=large?7.6:3.7;
 g.position.set(b.x*4,0,b.z*4);g.rotation.y=b.facing||0;
 const warm=new THREE.MeshStandardMaterial({color:0xc3af82,emissive:0xffb35b,emissiveIntensity:0,roughness:1});g.userData.warm=warm;
 const wood=0x72543a,tile=0x485b60,wall=0xe2d4b3,stone=0xb9b294;
 const slab=(w,d,x=0,z=0)=>box(g,w,.18,d,stone,x,.09,z);
 const hall=(x,z,w,d,h=1.8,y=0,color=tile)=>{
  box(g,w,h,d,wall,x,y+h/2+.18,z);
  for(const xx of [-w/2,w/2])box(g,.13,h,.13,wood,x+xx,y+h/2+.18,z+d/2);
  for(let xx=-w/2+.45;xx<w/2;xx+=.75){box(g,.38,.66,.05,warm,x+xx,y+1,z+d/2+.03);for(let n=-1;n<=1;n++)box(g,.022,.66,.03,wood,x+xx+n*.1,y+1,z+d/2+.065);}
  const r=new THREE.Group();r.position.set(x,y,z);g.add(r);roof(r,w+.45,d+.5,.7,h+.25,color);
  box(g,.56,1.15,.07,wood,x,y+.75,z+d/2+.04);
 };
 const rail=(x,z,w,y)=>{box(g,w,.06,.08,wood,x,y+.5,z);for(let i=-w/2;i<=w/2;i+=.35)box(g,.045,.48,.05,wood,x+i,y+.24,z);};
 const table=(x,z)=>{cyl(g,.38,.38,.09,wood,x,.62,z,10);cyl(g,.06,.1,.58,wood,x,.3,z);for(const dx of [-.5,.5]){cyl(g,.16,.16,.09,wood,x+dx,.32,z,8);box(g,.09,.29,.09,wood,x+dx,.15,z);}cyl(g,.06,.04,.09,0xd4d4b4,x,.7,z,8);};
 const urn=(x,z)=>{cyl(g,.2,.31,.62,0x92745a,x,.48,z);cyl(g,.23,.23,.07,0x665240,x,.82,z);};
 const water=(w,d,x=0,z=0)=>{
  box(g,w+.3,.13,d+.3,0x8d9e84,x,.2,z);box(g,w,.09,d,0x609c96,x,.24,z);
  for(let i=0;i<5;i++)box(g,w*.18,.012,.025,0xb2d5bd,x+Math.sin(i*2)*w*.3,.295,z+(i-2)*d*.13);
 };
 slab(size,size);
 if(b.stage<3){
  box(g,size-.4,.07,size-.4,design==='pond'?0x796b4f:0xaa9877,0,.2,0);
  if(b.stage>0&&design!=='pond')for(const x of [-size*.35,size*.35])for(const z of [-size*.35,size*.35]){box(g,.15,1.8,.15,wood,x,1.05,z);beam(g,[x,.25,z],[x,2,z+size*.5],.045,wood);}
  if(b.stage===2&&design==='pond')water(size-.8,size-.8);
  if(b.stage===2&&design!=='pond')roof(g,size-.5,size-.5,.9,2.1,tile);
  return g;
 }
 if(design==='pond'){
  water(size-.6,size-.6);
  for(let i=0;i<(large?16:6);i++){
   const x=Math.sin(i*2.4)*size*.32,z=Math.cos(i*1.7)*size*.3;
   const leaf=cyl(g,.23,.23,.025,0x6c9764,x,.34,z,9);leaf.rotation.z=.08;
   if(i%3===0){cyl(g,.02,.02,.35,0x648253,x,.46,z);for(let j=0;j<5;j++){const petal=ball(g,.11,0xd9a29b,x+Math.cos(j*1.25)*.09,.65,z+Math.sin(j*1.25)*.09,1);petal.scale.y=1.6;}}
  }
  tree(g,-size*.34,-size*.32,large?.7:.34,true);
  for(const x of [-size*.34,size*.34])box(g,.65,.25,.3,wood,x,.31,size*.4);
  // A narrow bank is walkable; visitors remain outside the water.
 }else if(design==='pavilion'){
  water(size*.58,size*.35,0,-size*.22);
  cyl(g,large?1.75:1.2,large?1.85:1.3,.18,stone,0,.25,.2,6);
  const r=large?1.5:.95;
  for(let i=0;i<6;i++){const a=i*Math.PI/3;cyl(g,.075,.1,1.9,wood,Math.cos(a)*r,1.3,Math.sin(a)*r+.2);}
  cyl(g,0,r+ .55,1.0,tile,0,2.75,.2,6);cyl(g,.5,r+.35,.28,tile,0,2.36,.2,6);ball(g,.1,0xa99765,0,3.3,.2);
  table(0,.25);box(g,.75,.08,1.1,stone,0,.25,size*.35);
  if(large){tree(g,-2.7,-2.7,.65,true);for(const x of [-2.9,2.9]){slab(.7,5,x,0);for(const z of [-2,0,2])box(g,.07,1.2,.07,wood,x,.75,z);const rr=new THREE.Group();rr.position.set(x,0,0);g.add(rr);roof(rr,.9,5,.3,1.45,tile);}}
 }else if(large){
  hall(0,-2.1,6.2,2.4,design==='wine'?2.3:1.8);
  for(const x of [-2.65,2.65])hall(x,.4,1.25,2.5,1.45);
  box(g,1.1,.12,1.25,stone,0,.24,3.1);
  if(design==='wine'){
   hall(0,-2.1,5.7,2.1,1.9,2.6);box(g,6.3,.13,1,wood,0,2.6,-.6);rail(0,-.1,6.3,2.65);
   for(const x of [-1.5,1.5]){box(g,.16,2.5,.16,0x93563c,x,1.4,2.8);cyl(g,.25,.25,.45,0xce9158,x,2.35,2.65,8);}box(g,3.4,.32,.28,0x9a6845,0,2.65,2.8);const rr=new THREE.Group();rr.position.z=2.8;g.add(rr);roof(rr,3.8,.8,.4,2.9,tile);table(-1.1,.4);table(1.1,.4);urn(-2.8,2.7);urn(2.8,2.7);
  }else if(design==='academy'){
   water(2.6,1.7,0,.2);box(g,.7,.06,1.9,stone,0,.24,.2);for(const x of [-1.8,1.8]){box(g,.8,.1,.5,wood,x,.75,-.5);box(g,.28,.08,.22,0xe6d3a1,x,.84,-.5);}tree(g,-2.9,2.6,.45);
  }else if(design==='textile'){
   for(let i=0;i<5;i++)box(g,.52,1.6,.035,[0xac6b5d,0x7e9d9c,0xcab37c][i%3],-1.6+i*.8,1.55,-.8);rail(0,2.8,4.4,.3);
  }else if(design==='food'){
   box(g,.75,3,.7,0x937e66,2.7,1.65,-2.2);for(const x of [-1.1,1.1])table(x,.4);for(let i=0;i<3;i++)cyl(g,.29,.29,.17,0xc4a06f,-1,.45+i*.17,2.5,10);
  }else{table(-1.2,.4);table(1.2,.4);tree(g,0,2.5,.45);}
 }else if(design==='tea'){
  hall(-.7,-.35,1.65,2,1.7);const rr=new THREE.Group();rr.position.set(.8,0,-.1);g.add(rr);roof(rr,1.6,2.8,.32,1.55,tile);for(const z of [-1.4,1.2])box(g,.08,1.65,.08,wood,1.5,.92,z);table(.75,.3);
 }else if(design==='food'){
  hall(0,-.45,2.65,1.8,1.65,0,0x736653);box(g,.55,2.8,.5,0x93816c,-1.05,1.55,-.75);box(g,3.05,.09,1.3,0xb17a50,0,1.55,1);for(const x of [-1.4,1.4])box(g,.06,1.5,.06,wood,x,.9,1.4);box(g,1.8,.65,.5,0x97764c,0,.52,1.1);for(let i=0;i<3;i++)cyl(g,.25,.25,.15,0xc8aa7a,-.5,.9+i*.15,1.1,10);urn(.7,1.15);
 }else if(design==='textile'){
  hall(0,-.35,2.6,2.1,2.8);box(g,2.9,.12,.65,wood,0,1.85,.9);rail(0,1.22,2.9,1.9);for(let i=0;i<3;i++)box(g,.65,1.25,.035,[0x9e6b69,0x719794,0xc1aa73][i],-.85+i*.85,1.05,1.12);for(let i=0;i<3;i++)cyl(g,.15,.15,.6,[0xb9816b,0xa9b597,0xc5b286][i],-.7+i*.55,.32,1.55,8).rotation.z=Math.PI/2;
 }
 return g;
}
