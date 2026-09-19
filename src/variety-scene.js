import {roofTone} from './roof-colors.js';
import * as THREE from 'three';
import {NEW_DESIGNS} from './variety.js';
export function varietyBuilding(b,api){
 if(!NEW_DESIGNS[b.design])return null;
 const {box,cyl,ball,roof,tree}=api,g=new THREE.Group(),large=!!b.footprint,R=large?3.8:1.85,wood=0x79583d,stone=0xb5ad92,wall=0xe1d4b9,tile=roofTone(b);
 g.position.set(b.x*4,0,b.z*4);g.rotation.y=b.facing||0;box(g,R*2,.16,R*2,stone,0,.08,0);
 const hall=(x,z,w,d,h=1.6)=>{box(g,w,h,d,wall,x,h/2+.2,z);box(g,.5,1.1,.06,wood,x,.76,z+d/2+.03);for(const dx of [-w*.3,w*.3]){box(g,.38,.5,.055,0x7b6e50,x+dx,h*.6,z+d/2+.04);for(const n of [-1,0,1])box(g,.022,.5,.02,0xd0be90,x+dx+n*.1,h*.6,z+d/2+.075);}const r=new THREE.Group();r.position.set(x,0,z);g.add(r);roof(r,w+.35,d+.4,.6,h+.25,tile);};
 const shelf=(x,z,w=1.6)=>{for(const y of [.4,.85,1.3]){box(g,w,.08,.35,wood,x,y,z);for(let i=0;i<5;i++)box(g,w/7,.24,.2,[0xa77d5c,0x819a83,0xc2ad75][i%3],x+(i-2)*w/5,y+.15,z);}for(const dx of [-w/2,w/2])box(g,.07,1.4,.4,wood,x+dx,.75,z);};
 if(b.stage<3){for(const x of [-R*.7,R*.7])for(const z of [-R*.7,R*.7])box(g,.13,b.stage?1.8:.25,.13,wood,x,b.stage?1:.3,z);if(b.stage===2)roof(g,R*1.7,R*1.7,.6,2,tile);return g;}
 const z=large?-1.9:-.35;
 if(b.design==='bambooHome'){
  hall(large?-.8:-.35,z,large?4:2.2,large?2.5:2,1.25);for(let i=0;i<(large?15:8);i++)box(g,.045,.65,.05,0x87915c,-R+.2+i*(R*2-.4)/(large?14:7),.5,R-.2);for(let i=0;i<3;i++){box(g,large?2:.6,.06,.25,0x877553,R*.5,.22,-.4+i*.45);for(let j=0;j<3;j++)ball(g,.09,0x6e995c,R*.5+(j-1)*.18,.35,-.4+i*.45);}if(large)hall(2,.5,1.6,2.5,1.1);
 }else if(b.design==='terraceHome'){
  const n=large?2:1;for(let i=0;i<n;i++){const x=large?(i?1.7:-1.7):0;box(g,2.5,1,2.4,wood,x,.65,z);const h=new THREE.Group();g.add(h);h.position.set(x,1.05,z);box(h,2,1.7,1.7,wall,0,1,0);box(h,.45,1,.06,wood,0,.8,.88);for(const x of [-.65,.65])box(h,.35,.55,.06,0x8b805d,x,1.1,.89);roof(h,2.5,2.2,.7,2,tile);box(g,2.8,.12,1.1,wood,x,1.18,z+1.4);for(let j=0;j<5;j++)box(g,.4,.14,1,stone,x-1.3+j*.3,.24+j*.18,z+1.35);} 
 }else if(b.design==='plumHome'){
  hall(-R*.25,z,large?4:2,large?2.2:1.7,1.65);hall(R*.6,large?.4:.6,large?1.2:.6,large?3:1.4,1.15);tree(g,-R*.5,R*.45,large?.55:.3);for(let i=0;i<9;i++)ball(g,large?.14:.09,0xc996a2,-R*.5+Math.sin(i*2)*.55,1.2+Math.cos(i)*.2,R*.45+Math.cos(i*2)*.45);for(const x of [-.65,.65])box(g,.45,.9,.18,wall,x,.65,R-.25);cyl(g,.7,.7,.08,wood,0,1.3,R-.25,16).rotation.x=Math.PI/2;
 }else if(b.design==='dragonKiln'){
  hall(-R*.5,z,large?2.3:1.15,large?2.4:1.6,1.2);for(let i=0;i<(large?5:3);i++){const k=box(g,large?1.6:.9,.65,.58,0xa1785d,R*.3,.55+i*.13,R*.5-i*.5);k.rotation.x=-.18;}for(const x of [R*.1,R*.5])box(g,.25,2,.25,0x8e715c,x,1.15,z);shelf(-R*.45,R*.6,large?1.6:1);
 }else if(b.design==='timberYard'){
  const shed=(x,w)=>{for(const dx of [-w/2,w/2])for(const zz of [-.8,.8])box(g,.12,1.8,.12,wood,x+dx,1.1,z+zz);const r=new THREE.Group();r.position.set(x,0,z);g.add(r);roof(r,w+.4,2.3,.4,2,0x8b8260);};shed(large?-1.4:0,large?2.5:2.7);if(large)shed(1.7,2.4);for(let i=0;i<5;i++){const log=cyl(g,.16,.16,large?2.4:1.7,0xa77e4c,-.4+i*.2,.4+(i%2)*.25,R*.5,8);log.rotation.z=Math.PI/2;}box(g,1.8,.1,.65,wood,0,1,R*.75);
 }else if(b.design==='dyeHouse'){
  hall(0,z,large?5.6:2.7,large?2.4:1.7,1.6);for(let i=0;i<(large?5:3);i++){const x=(i-(large?2:1))*(large?1:.8);box(g,.65,1.4,.03,[0xb17378,0x6c999c,0xc4a566][i%3],x,1.3,R*.6);cyl(g,.25,.2,.4,0x816b53,x,.4,R*.3,10);}for(const x of [-R*.8,R*.8])box(g,.07,2.2,.07,wood,x,1.25,R*.6);box(g,R*1.6,.07,.07,wood,0,2.3,R*.6);
 }else if(b.design==='bookshop'){
  hall(large?-1:0,z,large?3:2.5,large?2.4:1.7,1.9);shelf(large?-1:0,.7,large?2.7:2.3);if(large){hall(2,z,1.8,2.3,2.9);shelf(2,.7,1.6);}box(g,large?3:1.7,.08,.7,wood,0,.85,R*.7);for(let i=0;i<4;i++)box(g,.25,.05,.4,0xd8c59b,(i-1.5)*.35,.93,R*.7);
 }else if(b.design==='incenseShop'){
  hall(0,z,large?3.2:1.65,large?2.6:1.65,3);for(const x of [-R*.62,R*.62]){hall(x,large?.6:.5,large?1.7:.7,large?2:1,1.2);box(g,large?1.4:.6,.75,.04,0xaa817e,x,1.35,R*.6);}shelf(0,R*.6,large?2:1.2);
 }else if(b.design==='herbShop'){
  hall(-R*.22,z,large?4.3:2.2,large?2.4:1.7,1.6);for(let i=0;i<4;i++)for(let j=0;j<3;j++){box(g,.4,.27,.18,0x9a7856,-.7+i*.45,.45+j*.3,.8);ball(g,.03,0x554a36,-.7+i*.45,.45+j*.3,.91);}for(let i=0;i<3;i++){cyl(g,.23,.23,.1,0xa99266,R*.65,.4,.1+i*.55,12);ball(g,.14,0x748864,R*.65,.52,.1+i*.55);}if(large)hall(2,.5,1.2,3,1.1);
 }else{
  hall(0,z,large?5.6:2.8,large?2.5:1.8,1.35);box(g,R*1.7,.07,1.2,0xa97460,0,1.8,R*.48);for(const x of [-R*.7,R*.7]){box(g,.07,1.6,.07,wood,x,1,R*.7);box(g,.5,.5,.5,0x8f765b,x,.45,R*.4);for(let i=0;i<3;i++)cyl(g,.23,.23,.15,0xc7a370,x,.78+i*.16,R*.4,10);}box(g,1,.5,.45,wood,0,.45,R*.75);
 }
 if(large){box(g,.85,.08,1.4,stone,0,.22,3.05);for(const x of [-3.4,3.4])box(g,.12,.7,6.5,wood,x,.5,0);}
 return g;
}
