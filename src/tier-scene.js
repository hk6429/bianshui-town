import * as THREE from 'three';
import {tierOf} from './building-tiers.js';
// Deliberately theatrical silhouettes: each tier adds a full, broad roofed storey.
export function decorateTier(g,b,api){
 const tier=tierOf(b);if(tier===1||b.stage<3)return g;
 const {box,cyl,ball,roof}=api,large=!!b.footprint,r=large?3.55:1.65;
 const garden=b.type==='garden',work=b.type==='work',shop=b.type==='shop';
 const wood=shop?0x9d352c:work?0x69472e:0x974831;
 const tile=tier===5?0xc89b38:garden?0x367f72:work?0x326783:shop?0x913f3b:0x387968;
 const gold=tier>=4?0xf1cd68:0xd6b967,wall=0xf0ddb4;
 const baseHeight=new THREE.Box3().setFromObject(g).max.y;
 // Keep ground-level signature objects; the main mass becomes taller too.
 const stretch=1+(tier-1)*.09;for(const child of g.children){child.position.y*=stretch;child.scale.y*=stretch;}
 const detail=new THREE.Group();detail.name=`tier-${tier}`;g.add(detail);
 const roofAt=(x,z,w,d,y,h=.6)=>{const q=new THREE.Group();q.position.set(x,0,z);detail.add(q);roof(q,w,d,h,y,tile);if(tier>=3){for(const edge of [-1,1])box(q,w,.16,.16,gold,0,y+.04,edge*d*.5);}box(q,w*.9,.12,.12,gold,0,y+h+.04,0);for(const dx of [-w*.43,w*.43]){const tip=box(q,.36,.12,.17,gold,dx,y+h*.28,0);tip.rotation.z=Math.sign(dx)*.5;}return q;};
 const lanternMat=new THREE.MeshStandardMaterial({color:0xf5b24f,emissive:0xe78729,emissiveIntensity:.35,roughness:.7});
 // Large banners, lanterns and a broad gate are readable at the town overview scale.
 const gateH=1.9+tier*.28,front=r-.32;
 for(const x of [-r*.78,r*.78]){box(detail,.17,gateH,.17,wood,x,gateH/2+.2,front);box(detail,.4,.26,.35,gold,x,.32,front);cyl(detail,.24,.21,.5,lanternMat,x,gateH-.3,front+.13,8);box(detail,.48,.13,.45,gold,x,gateH+.04,front);if(tier>=3){box(detail,.36,1.05,.06,shop?0xc85242:0x417d88,x,gateH-.85,front-.18);box(detail,.36,.12,.07,gold,x,gateH-1.35,front-.18);}}
 roofAt(0,front,r*1.95,.72,gateH+.15,.5);
 // The front silhouette changes by level, even when distant roofs overlap.
 if(tier>=3){
  const gateway=new THREE.Group();gateway.name='ceremonial-gateway';detail.add(gateway);
  for(const x of [-r*.45,r*.45])box(gateway,.24,gateH+.85,.24,wood,x,(gateH+.85)/2,front);
  box(gateway,r*.9,.55,.18,tier===5?gold:wood,0,gateH+.5,front);
  roofAt(0,front,r*1.25,.95,gateH+.95,.65);
  if(tier>=4){
   const gallery=new THREE.Group();gallery.name='upper-gallery';detail.add(gallery);
   const deckY=large?3.4:2.6;
   box(gallery,r*1.65,.22,.55,gold,0,deckY,-r*.72);
   for(let i=-4;i<=4;i++)box(gallery,.1,.7,.1,wood,i*r*.19,deckY+.35,-r*.44);
   box(gallery,r*1.65,.12,.12,gold,0,deckY+.72,-r*.44);
  }
  if(tier===5){
   roofAt(0,front,r*.86,1.05,gateH+2,.72);
   for(const x of [-r*.82,r*.82]){box(gateway,.3,gateH,.3,gold,x,gateH/2,front);ball(gateway,.28,gold,x,gateH+.3,front);}
  }
 }
 for(const x of [-r,r]){cyl(detail,.23,.28,.32,0xb7a58a,x,.33,r*.3,8);for(let i=0;i<7;i++)ball(detail,.13,[0xe6a0b0,0xf1d76d,0x91b383][i%3],x+Math.sin(i*2)*.15,.64,r*.3+Math.cos(i*2)*.15);}
 // Each level adds an entire floor: tier 2 one, tier 3 two, tier 4 three, tier 5 four.
 const floors=tier-1,h=large?1.65:1.25,w=large?5.4:2.65,z=garden?-r*.26:-r*.18;
 const start=garden?baseHeight*.85:baseHeight*stretch-.3;
 if(garden)for(const x of [-w*.35,w*.35])for(const dz of [-w*.22,w*.22]){box(detail,.19,start,.19,wood,x,start/2+.14,z+dz);box(detail,.32,.25,.32,gold,x,.26,z+dz);}
 for(let level=0;level<floors;level++){
  const width=w*(1-level*.12),depth=width*.7,y=start+level*(h+.65),x=work?-r*.08:0;
  box(detail,width+.14,.16,depth+.28,gold,x,y,z);
  if(!garden)box(detail,width*.88,h*.84,depth*.83,wall,x,y+h*.46,z);
  for(const dx of [-width*.42,width*.42])for(const dz of [-depth*.4,depth*.4]){box(detail,.15,h,.15,wood,x+dx,y+h/2,z+dz);box(detail,.35,.17,.3,gold,x+dx,y+h-.12,z+dz);}
  for(let i=0;i<5;i++){const xx=x+(i-2)*width*.15;box(detail,.11,.52,.09,wood,xx,y+.4,z+depth*.53);if(!garden)box(detail,width*.105,h*.48,.055,0x4b7670,xx,y+h*.51,z+depth*.43);}
  box(detail,width,.12,.12,gold,x,y+.69,z+depth*.53);
  roofAt(x,z,width+.42,depth+.65,y+h,.64);
  if(tier>=4)for(const dx of [-width*.4,width*.4])cyl(detail,.18,.17,.36,lanternMat,x+dx,y+h-.15,z+depth*.5,8);
 }
 // Upper tiers gain a second roofed silhouette, then a conspicuous gold crown.
 if(tier>=4){for(const x of [-r*.76,r*.76]){
  const sideZ=-r*.72,sideW=large?1.65:.9,sideH=large?1.5:1.1;
  const towerFloors=tier===5?3:2;
  for(let floor=0;floor<towerFloors;floor++){
   const y=.25+floor*(sideH+.5),width=sideW*(1-floor*.12);
   box(detail,width*.72,sideH,width*.65,wall,x,y+sideH/2,sideZ);
   for(const dx of [-width*.38,width*.38])box(detail,.12,sideH,.12,wood,x+dx,y+sideH/2,sideZ+width*.32);
   box(detail,width*.46,sideH*.45,.065,0x39665f,x,y+sideH*.55,sideZ+width*.34);
   roofAt(x,sideZ,width,width*.85,y+sideH,.5);
   cyl(detail,.16,.14,.35,lanternMat,x,y+sideH-.25,sideZ+width*.55,8);
  }
 }}
 if(tier===5){const crownY=start+(floors-1)*(h+.65)+h+.72;cyl(detail,.04,.35,.72,gold,0,crownY+.3,z,8);ball(detail,.18,gold,0,crownY+.76,z);for(const x of [-r*.82,r*.82]){box(detail,.085,3.7,.085,gold,x,2.05,front-.3);box(detail,.85,2.2,.06,0xbd493c,x+.25,2.95,front-.3);box(detail,.87,.18,.075,gold,x+.25,1.93,front-.3);}}
 return g;
}
