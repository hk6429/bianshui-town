import * as THREE from 'three';
import {tierOf} from './building-tiers.js';
// Additive architecture stays inside the original plot and keeps its identifying facade.
export function decorateTier(g,b,api){
 const tier=tierOf(b);if(tier===1||b.stage<3)return g;
 const {box,cyl,ball,roof}=api,large=!!b.footprint,r=large?3.55:1.65;
 const garden=b.type==='garden',work=b.type==='work',wood=work?0x795b41:0x85563e;
 const tile=garden?0x537c73:work?0x666d67:0x435e69,trim=0xc8ad70;
 const detail=new THREE.Group();detail.name=`tier-${tier}`;g.add(detail);
 const roofAt=(x,z,w,d,y,h=.4)=>{const q=new THREE.Group();q.position.set(x,0,z);detail.add(q);roof(q,w,d,h,y,tile);box(q,w*.75,.06,.07,trim,0,y+h+.03,0);};
 // Tier 2: paired carved plinths, blossoms and hanging lanterns.
 for(const x of [-r,r]){cyl(detail,.17,.23,.22,0xb7a58a,x,.29,r,8);for(let i=0;i<5;i++)ball(detail,.085,[0xd7a0a4,0xc4b779,0x90a88b][i%3],x+Math.sin(i*2)*.13,.52,r+Math.cos(i*2)*.13);box(detail,.045,1.35,.045,wood,x,.95,r-.3);cyl(detail,.12,.1,.25,0xdba566,x,1.38,r-.2,8);box(detail,.18,.05,.18,trim,x,1.54,r-.2);}
 for(const x of [-r,r])box(detail,.09,.12,r*1.5,trim,x,.26,-r*.1);
 // Tier 3: broad entrance portico, timber brackets and low balustrades.
 if(tier>=3){const span=large?2.5:1.5,y=garden?1.65:1.8,z=r-.12;for(const x of [-span/2,span/2]){box(detail,.09,y,.09,wood,x,y/2+.2,z);box(detail,.28,.09,.22,trim,x,y-.05,z);}
 roofAt(0,z,span+.5,.65,y+.18);for(const x of [-r,r]){box(detail,.06,.55,1,wood,x,.5,.35);for(let i=0;i<4;i++)box(detail,.055,.55,.055,wood,x,.5,i*.28-.1);}
 }
 // Tier 4: gardens receive a waterside tower; working buildings keep their open yards.
 if(tier>=4){
  const tower=new THREE.Group();detail.add(tower);
  const original=new THREE.Box3().setFromObject(g),base=garden?.28:Math.max(2.7,original.max.y);
  const x=garden?r*.55:work?-r*.35:0,z=garden?-r*.55:-r*.4,w=large?1.8:.95,h=large?1.25:.85;
  box(tower,w+.18,.12,w+.18,trim,x,base,z);
  for(const dx of [-w*.4,w*.4])for(const dz of [-w*.4,w*.4])box(tower,.07,h,.07,wood,x+dx,base+h/2,z+dz);
  if(!garden){box(tower,w*.8,h*.7,w*.8,0xe2d2ad,x,base+h*.43,z);for(const dx of [-w*.25,w*.25])box(tower,.14,h*.45,.04,0x6a7162,x+dx,base+h*.5,z+w*.41);}
  roofAt(x,z,w+.45,w+.45,base+h,.45);
  if(tier>=5){const top=base+h+.43;for(const dx of [-w*.28,w*.28])for(const dz of [-w*.28,w*.28])box(tower,.06,h*.65,.06,wood,x+dx,top+h*.32,z+dz);roofAt(x,z,w+.2,w+.2,top+h*.65,.4);ball(tower,.09,trim,x,top+h*.65+.47,z);
   for(const dx of [-r*.8,r*.8]){roofAt(dx,r*.68,large?1:.45,.6,2.25,.3);box(tower,.065,1.95,.065,wood,dx,1.22,r*.68);}
   for(let i=0;i<5;i++)ball(tower,.055,trim,x+(i-2)*w*.16,top+h*.65+.45,z);
  }
 }
 return g;
}
