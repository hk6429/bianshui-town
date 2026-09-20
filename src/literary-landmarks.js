import {addLiteraryGarden} from './literary-gardens.js';
import * as THREE from 'three';
import {LANDMARK_QUEST} from './literary-quests.js';
export function literaryLandmark(b,api){
 if(!LANDMARK_QUEST[b.design])return null;
 const {box,cyl,roof,tree}=api,g=new THREE.Group(),tier=b.tier||1;
 g.name=b.design;g.position.set(b.x*4,0,b.z*4);g.rotation.y=b.facing||0;
 const wood=0x75462e,wall=0xe9d6af,tile=0x526f65,stone=0xb6aa8c,gold=0xcfaa51;
 box(g,7.6,.24,7.6,stone,0,.12,0);
 const hall=(x,z,w,d,h=1.8,y=0,color=tile)=>{const a=new THREE.Group();a.position.set(x,y,z);g.add(a);box(a,w,h,d,wall,0,h/2+.25,0);box(a,w*.3,h*.75,.08,wood,0,h*.375+.25,d/2+.05);for(const dx of [-w*.43,w*.43])box(a,.16,h,.16,wood,dx,h/2+.25,d/2);roof(a,w+.6,d+.6,.7,h+.3,color);return a;};
 if(b.stage<3){for(const x of [-2.6,2.6])for(const z of [-2.6,2.6])box(g,.16,.5+b.stage,.16,wood,x,(.5+b.stage)/2+.24,z);return g;}
 if(addLiteraryGarden(g,b,api))return g;
 if(b.design==='yueyangTower'){
  for(let level=0;level<3;level++){const w=4.6-level*.6,y=level*2.05;hall(0,-.5,w,3.2-level*.35,1.6,y);box(g,w+.6,.15,1,wood,0,y+.3,1.4);for(let i=-3;i<=3;i++)box(g,.07,.55,.07,wood,i*w/7,y+.65,1.85);box(g,w+.4,.08,.1,gold,0,y+.94,1.85);}
  for(let i=0;i<4;i++)box(g,2.5-i*.15,.12,1-i*.15,stone,0,.2+i*.12,2.9-i*.2);
  if(tier>=2)for(const x of [-3.2,3.2]){box(g,.12,2.2,.12,wood,x,1.3,2.6);cyl(g,.26,.26,.45,0xc5944b,x,2.15,2.6,8);}
  if(tier>=3)for(const x of [-3.1,3.1])hall(x,-.5,.65,3.5,1.2);
  if(tier>=4)for(const x of [-2.6,2.6])tree(g,x,-2.8,.55);
  if(tier>=5)for(let i=-3;i<=3;i++)box(g,.45,.6,.15,gold,i,.6,3.4);
 }else if(b.design==='kaifengCourt'){
  hall(0,-2.1,4.8,2.1,2.7);hall(0,2.65,3.2,1.1,1.8);box(g,1.5,.5,.12,0x36534f,0,1.8,3.28);
  for(const x of [-3,3])hall(x,0,1,3.5,1.5);box(g,1.7,.7,.7,wood,0,.6,-.5);
  if(tier>=2)for(const x of [-1.1,1.1])cyl(g,.3,.42,.65,stone,x,.55,3.3,8);
  if(tier>=3)for(const x of [-1.5,1.5]){box(g,.1,3,.1,wood,x,1.7,1.5);box(g,.65,.7,.06,0xa84b36,x+.3,2.7,1.5);}
  if(tier>=4)for(const x of [-2,2])hall(x,-.1,.7,1.2,1.1);
  if(tier>=5){box(g,4.4,.24,.15,gold,0,2.95,-.98);for(const x of [-3.35,3.35])tree(g,x,-2.9,.5);}
 }else{
  hall(0,-2.3,5.8,1.8,1.8);const tables=tier>=3?[-1.9,0,1.9]:[-1.3,1.3];
  for(const x of tables){box(g,1.35,.15,1,wood,x,.95,.4);for(let i=0;i<12;i++)box(g,.16,.1,.18,0x535045,x-.45+(i%4)*.3,1.08,.1+Math.floor(i/4)*.25);}
  cyl(g,.65,.8,1.1,0xa9714d,-2.6,.8,2.5,10);box(g,.3,1.5,.3,0x89543b,-2.6,1.6,2.25);
  for(let i=0;i<2+(tier>=2?2:0);i++){box(g,1.2,.1,.5,wood,-2+i*1.3,.4,-.7);box(g,.9,.08,.4,0xe8dfbd,-2+i*1.3,.5,-.7);}
  if(tier>=4){box(g,2.6,.1,.1,wood,1.5,2,2.5);for(const x of [.3,2.7])box(g,.1,1.8,.1,wood,x,1.1,2.5);for(let i=0;i<4;i++)box(g,.45,.9,.03,0xf1e4bc,.55+i*.6,1.5,2.5);}
  if(tier>=5)for(const x of [-3.25,3.25])hall(x,0,.55,3.8,1.5);
 }
 g.userData.upgradeFeatures=({yueyangTower:['登臨燈柱','兩側廊道','庭樹','展覽石牌'],kaifengCourt:['門前石座','儀仗旗','案牘房','金飾庭樹'],movableTypeHall:['字格書櫃','第三排字臺','晾紙架','側廊']}[b.design]).slice(0,tier-1);
 return g;
}
