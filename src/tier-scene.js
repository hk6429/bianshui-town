import * as THREE from 'three';
import {tierOf} from './building-tiers.js';
import {appearanceKey,TIER_APPEARANCES} from './tier-appearance.js';
export function decorateTier(g,b,api){
 const tier=tierOf(b);if(tier===1||b.stage<3)return g;
 const profile=appearanceKey(b),spec=TIER_APPEARANCES[profile],large=!!b.footprint,R=large?3.5:1.65,S=large?1:.58;
 const {box,cyl,ball,roof,beam,tree}=api,wood=0x79563b,stone=0xbcb394,gold=0xd4ae56;
 const colors={bambooHome:0x73834c,terraceHome:0x487a83,plumHome:0xbe7a92,dragonKiln:0xa36343,timberYard:0xa0824c,dyeHouse:0x6a959e,bookshop:0x536d81,incenseShop:0x87608f,herbShop:0x6b9258,cakeShop:0xb77952,tea:0x487b68,food:0xa45a40,textile:0xa3628b,wine:0x993e39};
 const accent=colors[profile]||0x66876d;
 const detail=new THREE.Group();detail.name=`tier-${tier}-${profile}`;g.add(detail);
 function hall(q,w=2.5,d=1.5,h=1.6,open=false){
  if(!open)box(q,w,h,d,0xe5d6b7,0,h/2+.2,0);
  for(const x of [-w*.43,w*.43])for(const z of [-d*.42,d*.42])box(q,.14,h,.14,wood,x,h/2+.2,z);
  roof(q,w+.3,d+.4,.55,h+.25,accent);box(q,w*.85,.12,.1,gold,0,h+.12,d*.51);
 }
 const rail=(q,w,y,z)=>{for(let i=0;i<=6;i++)box(q,.07,.5,.07,wood,-w/2+i*w/6,y+.25,z);box(q,w,.09,.1,wood,0,y+.52,z);};
 const jar=(q,x,z,h=.9,c=0x97755b)=>{cyl(q,.3,.45,h,c,x,h/2+.2,z,10);cyl(q,.28,.28,.1,wood,x,h+.25,z,10);};
 const wheel=(q,x,y,z,r=1)=>{const c=cyl(q,r,r,.16,wood,x,y,z,16);c.rotation.z=Math.PI/2;for(let i=0;i<10;i++){const a=i*Math.PI/5;beam(q,[x,y,z],[x,y+Math.sin(a)*r,z+Math.cos(a)*r],.06,gold);}};
 const cloth=(q,n=4,h=2.5)=>{for(const x of [-1.5,1.5])box(q,.12,h+.4,.12,wood,x,(h+.4)/2,0);box(q,3.2,.12,.12,wood,0,h+.35,0);for(let i=0;i<n;i++)box(q,2.8/n*.8,h*.8,.05,[0xb66385,0x529d9b,0xd6b34f,0x716eaf][i%4],-1.4+(i+.5)*2.8/n,h*.55,0);};
 const books=(q)=>{for(let y=.35;y<2.1;y+=.5){box(q,2.8,.09,.45,wood,0,y,0);for(let i=0;i<7;i++)box(q,.27,.3,.3,[0xb77452,0x6d889b,0xc8b981][i%3],(i-3)*.38,y+.2,0);}for(const x of [-1.45,1.45])box(q,.12,2.3,.5,wood,x,1.2,0);};
 const blossoms=(q,c=0xd793a6)=>{tree(q,0,0,.55);for(let i=0;i<14;i++)ball(q,.23,c,Math.sin(i*2.1)*.95,1.6+Math.sin(i)*.4,Math.cos(i*2.1)*.8,1);};
 function feature(q,id){
  switch(id){
   case 'vegetables':for(let n=0;n<4;n++){box(q,2.8,.12,.32,0x9b7954,0,.15,n*.42-.6);for(let j=0;j<5;j++)ball(q,.16,0x739859,(j-2)*.5,.35,n*.42-.6);}break;
   case 'bamboo':for(let i=0;i<8;i++){const x=Math.sin(i*2)*1.2,z=Math.cos(i*2)*.5,h=2.8+i%3*.45;cyl(q,.05,.07,h,0x6c874d,x,h/2,z,6);for(let j=1;j<4;j++){box(q,.12,.07,.12,0xb4b883,x,j*h/4,z);const leaf=ball(q,.4,0x819a54,x+.25,h*.7+j*.15,z);leaf.scale.set(1,.25,.6);}}break;
   case 'pergola':case 'canopy':for(const x of [-1.4,1.4])for(const z of [-.65,.65])box(q,.13,2,.13,wood,x,1,z);for(let i=-3;i<=3;i++)box(q,.14,.13,1.7,wood,i*.45,2.1,0);if(id==='canopy')box(q,3.1,.09,1.7,accent,0,2.2,0);else for(let i=0;i<9;i++)ball(q,.3,0x7f9c63,Math.sin(i)*1.3,2.3,Math.cos(i)*.55);break;
   case 'bambooHall':hall(q,3,1.8,2.4,true);feature(q,'bamboo');break;
   case 'terrace':case 'teaDeck':case 'reading':case 'waterside':box(q,3,.22,1.8,stone,0,.55,0);rail(q,3,.66,-.8);for(const x of [-1,1]){cyl(q,.35,.35,.12,wood,x,1.1,0,8);cyl(q,.08,.08,.5,wood,x,.8,0);}if(id==='reading')for(const x of [-1,1])box(q,.4,.05,.3,0xe5d3a0,x,1.2,0);break;
   case 'stairs':for(let i=0;i<7;i++)box(q,1.3,.25,2.3-i*.28,stone,0,.25+i*.25,i*.14);rail(q,2.5,2,.95);break;
   case 'lookout':case 'bookTower':case 'wineTower':hall(q,2,1.8,2.5);{const upper=new THREE.Group();upper.position.y=3;q.add(upper);hall(upper,1.9,1.7,id==='lookout'?1.4:2,true);if(id==='bookTower')books(upper);if(id==='wineTower'){jar(q,-1.3,0,1.3);jar(q,1.3,0,1.3);}}break;
   case 'skyGallery':for(const x of [-1.3,1.3]){box(q,.5,3.8,.5,wood,x,1.9,0);const h=new THREE.Group();h.position.set(x,3.5,0);q.add(h);hall(h,1.4,1.6,1.3,true);}box(q,3,.2,1,wood,0,3,0);rail(q,3,3,.5);break;
   case 'plum':blossoms(q);break;
   case 'moonGate':{for(const x of [-1.1,1.1])box(q,.8,2.3,.3,0xeae3cf,x,1.15,0);const ring=new THREE.Mesh(new THREE.TorusGeometry(.88,.19,8,24),api.mat(stone));ring.position.y=1.25;q.add(ring);box(q,3,.22,.48,0x52615d,0,2.4,0);}break;
   case 'whiteGallery':hall(q,3.2,1,1.7,true);for(const x of [-1.3,1.3])box(q,.45,1.3,.22,0xeee5ce,x,.65,.3);break;
   case 'plumCourt':feature(q,'moonGate');for(const x of [-1.2,1.2]){const p=new THREE.Group();p.position.set(x,.4,-.6);p.scale.setScalar(.65);q.add(p);blossoms(p);}break;
   case 'pottery':books(q);for(let i=0;i<4;i++)jar(q,(i-1.5)*.65,.45,.5,[0x6aa498,0xc7b987,0x7594a4][i%3]);break;
   case 'kiln':{const k=cyl(q,.65,.8,2.6,0xa77451,0,.9,0,14);k.rotation.x=Math.PI/2;box(q,.65,.45,.08,0xf49b3d,0,.6,1.35);for(const x of [-.65,.65])box(q,.2,1.2,2.5,0x916348,x,.6,0);}break;
   case 'chimney':for(let i=0;i<3;i++){const h=3+i*.65;box(q,.48,h,.48,0x925f45,(i-1)*.8,h/2,0);box(q,.7,.2,.7,0xc39d72,(i-1)*.8,h,0);}break;
   case 'kilnMountain':for(let i=0;i<3;i++){const k=new THREE.Group();k.position.set((i-1)*.85,i*.5,0);k.scale.set(.7,1,.7);q.add(k);feature(k,'kiln');}feature(q,'chimney');break;
   case 'timber':for(let i=0;i<9;i++){const log=cyl(q,.2,.2,2.8,0xb28b50,0,.4+Math.floor(i/3)*.4,(i%3-1)*.42,8);log.rotation.z=Math.PI/2;}break;
   case 'saw':box(q,2.6,.2,1,wood,0,1,0);for(const x of [-1,1])box(q,.2,1,.2,wood,x,.5,0);box(q,.08,1.7,.6,0x8b9697,0,1.5,0);break;
   case 'crane':for(const x of [-1.25,1.25]){box(q,.25,4.8,.25,wood,x,2.4,0);beam(q,[x,.2,0],[x>0?-.7:.7,4.3,0],.1,wood);}box(q,3.3,.28,.32,wood,0,4.8,0);box(q,.055,2.2,.055,0xcebd8b,.6,3.5,0);wheel(q,-1.35,3.7,0,.65);box(q,1.5,.35,.5,0xb39158,.6,2.3,0);break;
   case 'vats':for(let i=0;i<4;i++){cyl(q,.48,.4,.7,wood,(i%2-.5)*1.2,.5,Math.floor(i/2)*1.1-.5,12);cyl(q,.4,.4,.03,[0x815184,0x458d9c,0xbfa54e,0xa35459][i],(i%2-.5)*1.2,.87,Math.floor(i/2)*1.1-.5,12);}break;
   case 'cloth':cloth(q);break;
   case 'loom':cloth(q,9,2);box(q,2.6,.15,1.4,wood,0,.8,.4);for(let i=0;i<12;i++)beam(q,[-1.1+i*.2,2,0],[-1.1+i*.2,.85,1],.015,0xe4d5a7);break;
   case 'clothGallery':cloth(q,5,4.2);for(const z of [-.8,.8]){const p=new THREE.Group();p.position.set(0,1,z);q.add(p);cloth(p,4,2.4);}break;
   case 'books':books(q);break;
   case 'incense':cyl(q,.65,.4,.65,gold,0,1,0,10);for(const x of [-.4,.4])box(q,.12,.7,.12,wood,x,.45,0);for(let i=0;i<5;i++)cyl(q,.025,.025,1.6,0xb68c5c,(i-2)*.18,2,0,5);break;
   case 'incenseSpire':for(let j=0;j<4;j++){cyl(q,.7-j*.1,.85-j*.1,.55,gold,0,.7+j*.75,0,8);cyl(q,.02,.55-j*.08,.25,0x856788,0,1.1+j*.75,0,8);}break;
   case 'perfumeCourt':for(const x of [-1.2,1.2]){const p=new THREE.Group();p.position.x=x;q.add(p);feature(p,'incenseSpire');}cloth(q,3,3.8);break;
   case 'cabinet':for(let x=0;x<5;x++)for(let y=0;y<5;y++){box(q,.5,.37,.4,wood,(x-2)*.55,.4+y*.42,0);ball(q,.055,gold,(x-2)*.55,.4+y*.42,.24);}break;
   case 'herbs':for(let x of [-1,0,1])for(let z of [-.5,.5]){cyl(q,.36,.3,.35,0x95794b,x,.35,z,10);for(let i=0;i<5;i++)ball(q,.17,0x719a64,x+Math.sin(i)*.18,.65,z+Math.cos(i)*.18);}break;
   case 'herbRacks':for(let y=0;y<3;y++)for(let x of [-.8,.8]){cyl(q,.6,.6,.1,0xc2ac77,x,.6+y*.65,0,14);ball(q,.3,0x85915a,x,.8+y*.65,0);}for(let x of [-1.5,1.5])box(q,.12,2.5,.12,wood,x,1.25,0);break;
   case 'herbHall':hall(q,3.3,2,3.2,true);feature(q,'herbRacks');break;
   case 'steamers':for(let x of [-.9,.9])for(let j=0;j<4;j++){cyl(q,.6,.6,.4,0xc3a373,x,.45+j*.44,0,12);cyl(q,.63,.63,.07,wood,x,.65+j*.44,0,12);}break;
   case 'kitchen':box(q,3,1.1,1.4,0xa67b5a,0,.55,0);for(let x of [-.85,.85]){box(q,.6,.6,.05,0x46382f,x,.45,.73);cyl(q,.52,.45,.1,0x4a4b42,x,1.16,0,12);}break;
   case 'steamHall':feature(q,'steamers');{const p=new THREE.Group();p.position.set(0,1.7,-.6);q.add(p);feature(p,'steamers');}hall(q,3,1.5,3.4,true);break;
   case 'kitchenHall':feature(q,'kitchen');for(let x of [-1.1,1.1])box(q,.5,4,.5,0x945b42,x,2,-.5);roof(q,3.1,1.7,.5,2.3,accent);break;
   case 'teaPavilion':case 'lotusPavilion':case 'twinPavilion':case 'hexRoof':for(let i=0;i<6;i++){let a=i*Math.PI/3;box(q,.14,2.6,.14,wood,Math.cos(a)*1.1,1.3,Math.sin(a)*1.1);}cyl(q,0,1.65,.95,accent,0,3.1,0,6);if(id!=='teaPavilion')cyl(q,0,1.3,.85,accent,0,3.9,0,6);if(id==='lotusPavilion')feature(q,'lotus');if(id==='twinPavilion'){const p=new THREE.Group();p.position.set(1.2,0,1);p.scale.setScalar(.55);q.add(p);feature(p,'teaPavilion');}break;
   case 'jars':for(let x of [-1,0,1])jar(q,x,0,1.3,0x896043);break;
   case 'wineGate':case 'silkGate':for(const x of [-1.4,1.4])box(q,.18,3,.18,wood,x,1.5,0);box(q,3.2,.3,.3,accent,0,3,0);for(let i=-2;i<=2;i++)box(q,.38,1.5,.06,[accent,gold,0x567e7b][(i+3)%3],i*.5,2,0);if(id==='wineGate')roof(q,3.4,.8,.55,3.3,accent);break;
   case 'flowers':case 'flowerTerrace':for(let j=0;j<(id==='flowers'?1:3);j++){const radius=1.3-j*.3,y=.3+j*.75;cyl(q,radius,radius+.1,.3,stone,0,y,0,12);for(let i=0;i<12;i++)ball(q,.22,[0xe3a6b6,0xe9c869,0xaa98ca][i%3],Math.sin(i*Math.PI/6)*radius,y+.32,Math.cos(i*Math.PI/6)*radius,1);}break;
   case 'hedge':for(let x of [-1.3,1.3])box(q,.5,.85,2.2,0x6e915d,x,.6,0);box(q,2.8,.85,.5,0x6e915d,0,.6,-1);break;
   case 'bridge':for(let i=-4;i<=4;i++){const y=.4+Math.cos(i*Math.PI/10)*.55;box(q,.35,.1,1,wood,i*.35,y,0);for(let z of [-.5,.5])box(q,.07,.6,.07,wood,i*.35,y+.3,z);}break;
   case 'rockery':case 'waterfall':for(let i=0;i<7;i++){const rock=ball(q,.65,0x929990,Math.sin(i*2)*.65,.65+i*.35,Math.cos(i*2)*.45,1);rock.scale.y=1.5;}if(id==='waterfall'){box(q,.7,2.8,.055,0x81c0bb,.15,1.8,.65);box(q,2.8,.15,1.8,0x609f9c,0,.25,.6);}break;
   case 'lotus':for(let i=0;i<9;i++){const x=Math.sin(i*2.4)*1.1,z=Math.cos(i*2.4)*.8;cyl(q,.4,.4,.05,0x679566,x,.35,z,10);if(i%2===0){cyl(q,.03,.03,.9,0x71955c,x,.65,z);for(let j=0;j<5;j++)ball(q,.18,0xdf9eb4,x+Math.sin(j)*.14,1.1,z+Math.cos(j)*.14,1);}}break;
   case 'orchard':for(let x of [-.9,.9]){const p=new THREE.Group();p.position.x=x;p.scale.setScalar(.65);q.add(p);blossoms(p,0xdca057);}break;
   case 'waterwheel':feature(q,'aqueduct');wheel(q,0,1.7,0,1.5);break;
   case 'orchardHall':hall(q,3,1.8,2);feature(q,'orchard');break;
   case 'audience':for(let i=0;i<4;i++)box(q,3,.25,2-i*.4,wood,0,.3+i*.3,i*.2);break;
   case 'drum':for(let x of [-.9,.9]){box(q,.12,2,.12,wood,x,1,0);cyl(q,.42,.42,.4,0xb4783f,x,1.9,0,12);box(q,.35,1,.05,0xac4e3e,x,1,-.25);}break;
   case 'stageHall':box(q,3.5,.65,2.2,wood,0,.35,0);hall(q,3.4,2.1,3,true);roof(q,3,1.8,.6,4,0x985544);cloth(q,3,2.5);break;
   case 'academyHall':hall(q,3.2,2.2,2.4);for(let x of [-1.3,1.3]){const p=new THREE.Group();p.position.set(x,0,1);p.scale.setScalar(.5);q.add(p);books(p);}break;
   case 'aqueduct':for(let x of [-1.2,1.2])box(q,.2,1.8,.2,wood,x,.9,0);box(q,3,.2,.5,wood,0,1.9,0);box(q,3,.06,.3,0x75a6a1,0,2.03,0);break;
   case 'wheel':wheel(q,0,1.7,0,1.25);break;
   case 'wellTower':hall(q,2.6,2,3.4,true);for(let x of [-.8,.8])wheel(q,x,2.3,0,.75);break;
   case 'bins':for(let x of [-1,0,1])jar(q,x,0,1,0x778368);break;
   case 'cart':box(q,2,.65,1,wood,0,.85,0);for(let x of [-1.1,1.1])wheel(q,x,.65,0,.55);break;
   case 'cleanHall':hall(q,3.5,2,2.6,true);feature(q,'bins');const p=new THREE.Group();p.position.set(0,0,1);p.scale.setScalar(.6);q.add(p);feature(p,'cart');break;
   case 'waterTank':for(let x of [-.65,.65])box(q,.2,2,.2,wood,x,1,0);cyl(q,.85,.65,1,0x867354,0,2.3,0,12);break;
   case 'watchTower':case 'fireTower':for(let x of [-.8,.8])for(let z of [-.6,.6])box(q,.2,4,.2,wood,x,2,z);box(q,2.3,.2,1.9,wood,0,3.1,0);rail(q,2.3,3.2,.9);roof(q,2.5,2.1,.6,4.1,0x99483b);if(id==='fireTower'){const p=new THREE.Group();p.position.y=2;q.add(p);feature(p,'waterTank');box(q,.1,2,.1,wood,0,5,0);box(q,.7,1,.05,0xba4c38,.35,5.5,0);}break;
   default:throw Error(`Unknown tier feature: ${id}`);
  }
 }
 // Additions occupy different corners; the final landmark rises at the rear,
 // leaving the original entrance and ground-level purpose visible.
 const sites=[[-.56,.64],[.6,.25],[0,.76],[.32,-.58]];
 for(let step=2;step<=tier;step++){
  const q=new THREE.Group(),[x,z]=sites[step-2];q.name=`upgrade-${step}-${spec.features[step-2]}`;q.userData.upgradeFeature=spec.labels[step-2];q.position.set(x*R,.2,z*R);q.scale.setScalar(S*(step===5?1.2:step===4?1.05:1));detail.add(q);feature(q,spec.features[step-2]);
 }
 g.userData.upgradeProfile=profile;g.userData.upgradeFeatures=spec.labels.slice(0,tier-1);return g;
}
