import * as THREE from 'three';
// 官署、學堂、祠廟與水運建築的外觀。造型為遊戲轉譯，不是歷史建築復原。
export const CIVIC_DESIGNS=['townOffice','taxOffice','wineOffice','postStation','villageSchool','townSchool','earthShrine','cityGodTemple','dock','granary','watermill'];
export function civicBuilding(b,api){
 if(!CIVIC_DESIGNS.includes(b.design))return null;
 const {box,cyl,ball,beam,roof,tree}=api,g=new THREE.Group(),large=!!b.footprint,R=large?3.8:1.85;
 const wood=0x7a5233,stone=0xb3ab90,wall=0xe4d8bc,tile=0x4a5f63,red=0x9b4c38,gold=0xb9984b;
 g.position.set(b.x*4,0,b.z*4);g.rotation.y=b.facing||0;box(g,R*2,.16,R*2,stone,0,.08,0);
 const hall=(x,z,w,d,h=1.8,color=tile)=>{
  box(g,w,h,d,wall,x,h/2+.2,z);
  for(const dx of [-w/2,w/2])box(g,.13,h,.13,wood,x+dx,h/2+.2,z+d/2);
  box(g,.6,h*.62,.07,wood,x,h*.31+.2,z+d/2+.04);
  for(const dx of [-w*.32,w*.32])box(g,.36,h*.38,.05,0x8d7f5c,x+dx,h*.6,z+d/2+.04);
  const r=new THREE.Group();r.position.set(x,0,z);g.add(r);roof(r,w+.5,d+.5,.65,h+.25,color);
 };
 const pole=(x,z,h=3.2,flag=red)=>{box(g,.1,h,.1,wood,x,h/2+.2,z);box(g,.62,.46,.05,flag,x+.35,h-.2,z);};
 const urn=(x,z,c=0x92745a)=>{cyl(g,.2,.3,.6,c,x,.48,z);cyl(g,.23,.23,.07,0x65523f,x,.8,z);};
 if(b.stage<3){
  for(const x of [-R*.7,R*.7])for(const z of [-R*.7,R*.7])box(g,.13,b.stage?1.7:.25,.13,wood,x,b.stage?.95:.3,z);
  if(b.stage===2)roof(g,R*1.7,R*1.7,.6,2,tile);
  return g;
 }
 if(b.design==='townOffice'){
  // 影壁、廳事與東西耳房，門前一對旗杆。
  box(g,large?4.6:2.4,1.5,.22,wall,0,.95,R-.35);
  hall(0,-R*.45,large?5.2:2.6,large?2.4:1.7,2.3);
  for(const x of [-R*.62,R*.62])hall(x,large?.5:.4,large?1.5:.8,large?2.6:1.5,1.6);
  for(const x of [-1.1,1.1])pole(x,R-1.1,large?3.6:2.8);
  box(g,1.2,.14,1.5,stone,0,.24,R-1.5);
  for(const x of [-.75,.75])ball(g,.26,0x8d8a77,x,.42,R-.6);
 }else if(b.design==='taxOffice'){
  hall(0,-.4,2.5,1.7,1.8);
  box(g,2.4,.6,.7,wood,0,.66,.95);                       // 稅櫃
  box(g,1.05,.62,.06,gold,0,1.55,.62);                    // 稅牌
  beam(g,[-.85,1.05,1.1],[.85,1.05,1.1],.04,wood);        // 秤桿
  cyl(g,.16,.16,.1,0x50504a,.7,.82,1.1,10);
  for(const z of [1.35,1.65])box(g,1.6,.12,.2,wood,-.2,.34,z);
 }else if(b.design==='wineOffice'){
  hall(-.35,-.45,2.1,1.7,1.9);
  pole(1.35,.5,2.9,0x9d7136);
  for(const x of [-1.2,-.55,.1])urn(x,1.25,0xa9763f);
  for(const x of [-.9,.25])urn(x,1.75,0x8c6234);
  box(g,1.9,.1,1.1,wood,-.4,1.02,1.45);
 }else if(b.design==='postStation'){
  hall(-.5,-.4,1.9,1.7,1.7);
  box(g,1.5,1.1,1.5,0x8a7355,1.1,.75,.85);                // 馬廄
  const r=new THREE.Group();r.position.set(1.1,0,.85);g.add(r);roof(r,1.9,1.9,.4,1.85,0x6d6a4f);
  box(g,.1,2.8,.1,wood,-1.5,1.6,1.3);beam(g,[-1.5,2.9,1.3],[-.85,2.75,1.3],.04,wood);
  cyl(g,.16,.13,.24,gold,-.85,2.6,1.3,8);                  // 遞鋪鈴
 }else if(b.design==='villageSchool'){
  hall(0,-.3,2.4,1.9,1.6);
  for(let i=0;i<3;i++)box(g,.7,.1,.4,wood,-.8+i*.8,.55,1.1);   // 矮案
  for(let i=0;i<3;i++)box(g,.5,.07,.3,0xd8c9a2,-.8+i*.8,.62,1.1);
  box(g,.75,.5,.05,0xe0d3ad,0,1.3,1.35);tree(g,-1.35,1.3,.28);
 }else if(b.design==='townSchool'){
  hall(0,-R*.4,large?4.4:2.5,large?2.3:1.8,2);
  for(const x of [-R*.6,R*.6])hall(x,large?.6:.5,large?1.3:.75,large?2.4:1.4,1.45);
  box(g,large?2.6:1.4,.12,large?1.6:.9,0x8f9e84,0,.22,R*.45);   // 射圃前庭
  for(let i=0;i<(large?6:3);i++)box(g,.5,.09,.32,wood,-(large?1.4:.7)+i*.55,.55,R*.45);
  tree(g,-R*.72,R*.6,large?.5:.3,true);
 }else if(b.design==='earthShrine'){
  hall(0,-.2,1.5,1.4,1.5,red);
  box(g,1,.6,.08,red,0,1.35,.78);
  cyl(g,.3,.34,.42,0x6d6a5c,0,.45,1.15,12);                 // 香爐
  for(const x of [-.14,0,.14])box(g,.02,.5,.02,0xb8895f,x,.85,1.15);
  tree(g,1.2,.9,.42,true);
  for(const x of [-1.2,1.2])box(g,.14,1.2,.14,stone,x,.75,1.35);
 }else if(b.design==='cityGodTemple'){
  box(g,large?3.4:2,1.9,.3,red,0,1.15,R-.3);                 // 山門
  const gate=new THREE.Group();gate.position.set(0,0,R-.3);g.add(gate);roof(gate,large?4:2.4,.9,.5,2.2,tile);
  box(g,large?2.6:1.6,.75,large?2:1.2,wood,0,.6,large?1:.6); // 戲臺
  for(const x of [-(large?1.2:.7),large?1.2:.7])box(g,.12,1.5,.12,red,x,1.5,large?1:.6);
  const stage=new THREE.Group();stage.position.set(0,0,large?1:.6);g.add(stage);roof(stage,large?3:1.9,large?2.4:1.5,.45,2.35,tile);
  hall(0,-R*.5,large?4.2:2.4,large?2.4:1.6,2.4,tile);
  for(const x of [-(large?1.5:.9),large?1.5:.9])urn(x,-R*.05,0x6f6a58);
 }else if(b.design==='dock'){
  box(g,large?5.6:2.7,.18,1.5,wood,0,.3,R*.45);              // 棧橋
  for(const x of [-(large?2.3:1.1),0,large?2.3:1.1])box(g,.16,.9,.16,wood,x,.3,R-.3);
  box(g,.18,2.6,.18,wood,-(large?1.9:.9),1.5,.3);beam(g,[-(large?1.9:.9),2.7,.3],[-(large?1.9:.9)+1.3,2.35,.3],.07,wood);
  cyl(g,.05,.05,.8,0x6b5a45,-(large?1.9:.9)+1.3,1.95,.3);
  for(let i=0;i<(large?6:3);i++)box(g,.55,.4,.5,0x9c7c55,-(large?1.4:.6)+i*.55,.6,-.5);   // 待運木箱
  hall(large?2.4:1.1,-R*.55,large?1.8:1,large?1.6:1.1,1.5);
 }else if(b.design==='granary'){
  const silos=large?[[-1.9,-1.3],[.3,-1.3],[-1.9,.9],[.3,.9]]:[[-.55,-.25],[.75,.35]];
  for(const [x,z] of silos){cyl(g,.72,.85,1.7,0xcbb98f,x,1.05,z,14);cyl(g,0,.98,.75,0x8c8058,x,2.25,z,14);box(g,.42,.55,.06,wood,x,.68,z+.86);}
  hall(large?2.6:0,large?1.6:R*.55,large?1.4:1.9,large?2.2:1,1.35);
  for(let i=0;i<3;i++)box(g,.5,.24,.4,0xb59a68,-R*.7+i*.6,.34,-R*.7);
 }else if(b.design==='watermill'){
  hall(-.45,-.5,2,1.6,1.8);
  box(g,3.4,.14,.9,0x5f8a84,.2,.26,1.25);                    // 水渠
  const wheel=cyl(g,1.05,1.05,.28,wood,1.15,.95,1.25,14);wheel.rotation.z=Math.PI/2;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;box(g,.14,.5,.34,0x6b5030,1.15+Math.cos(a)*.85,.95+Math.sin(a)*.85,1.25);}
  cyl(g,.13,.13,1.9,wood,.35,.95,1.25,8).rotation.z=Math.PI/2;
  cyl(g,.62,.62,.22,stone,-.45,.85,.55,14);                   // 石碾
 }
 if(large){box(g,.9,.08,1.4,stone,0,.22,3.05);}
 return g;
}
