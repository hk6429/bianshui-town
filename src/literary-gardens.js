import * as THREE from 'three';
export const GARDEN_FEATURES={
 zuiwengPavilion:['泉邊石徑','百姓休憩席','四季林木','山麓遊廊'],
 virtueLotus:['君子曲橋','三花對照圃','池畔水榭','環池欄岸'],
 redcliffBoat:['登船碼頭','箏席與酒案','岸邊竹林','江岸疊石'],
 oilSchool:['油甕陳列','學徒示範席','材料儲棚','技藝門樓'],
 creekLotus:['舟行木棧','溪邊矮亭','荷間水鳥','荷塘曲廊'],
 lanternMarket:['花燈樹','市集雙棚','魚龍燈架','元夕彩門'],
 moonTerrace:['團聚石席','桂樹雙影','書信亭','共享望月廊']
};
export function addLiteraryGarden(g,b,api){
 const features=GARDEN_FEATURES[b.design];if(!features)return false;
 const {box,cyl,ball,roof,tree,beam}=api,t=b.tier||1;
 const wood=0x77513a,stone=0xbdb698,tile=0x536b63,water=0x79a9a3,leaf=0x658653,pink=0xdca0a1,gold=0xd4ab57;
 const platform=(x,z,w,d)=>box(g,w,.13,d,wood,x,.35,z);
 const pool=(x,z,w,d)=>{box(g,w,.035,d,water,x,.28,z);};
 const pavilion=(x,z,w=2,d=2,h=1.5)=>{const q=new THREE.Group();q.position.set(x,0,z);g.add(q);box(q,w,.16,d,stone,0,.35,0);for(const dx of [-w*.4,w*.4])for(const dz of [-d*.4,d*.4])box(q,.1,h,.1,wood,dx,h/2+.4,dz);roof(q,w+.4,d+.4,.65,h+.45,tile);};
 const lotus=(x,z,n)=>{for(let i=0;i<n;i++){const xx=x+Math.sin(i*2.3)*.7,zz=z+Math.cos(i*2.3)*.6;cyl(g,.23,.23,.04,leaf,xx,.34,zz,9);if(i%3===0){box(g,.03,.3,.03,leaf,xx,.5,zz);for(let j=0;j<5;j++){const petal=ball(g,.1,pink,xx+Math.cos(j*1.25)*.08,.69,zz+Math.sin(j*1.25)*.08);petal.scale.y=1.5;}}}};
 const bench=(x,z)=>{box(g,1.1,.15,.4,wood,x,.7,z);for(const dx of [-.4,.4])box(g,.1,.3,.3,wood,x+dx,.48,z);};
 const rail=(x,z,w)=>{for(let i=0;i<6;i++)box(g,.07,.55,.07,wood,x-w/2+i*w/5,.65,z);box(g,w,.08,.1,wood,x,.95,z);};
 const lantern=(x,z,y=2.5,color=0xcb7954)=>{box(g,.08,y,.08,wood,x,y/2+.3,z);cyl(g,.23,.23,.42,color,x,y+.25,z,8);box(g,.025,.22,.025,gold,x,y-.07,z);};
 const booth=(x,z,color)=>{box(g,1.55,.7,.8,wood,x,.65,z);const q=new THREE.Group();q.position.set(x,0,z);g.add(q);for(const dx of [-.85,.85])box(q,.08,1.8,.08,wood,dx,1.2,0);roof(q,2,1.6,.35,2.15,color);};
 const boat=(x,z)=>{const hull=ball(g,1,wood,x,.5,z);hull.scale.set(.6,.28,1.8);box(g,.8,.12,2.3,0xc6a47d,x,.65,z);for(const dz of [-.7,.7])box(g,.9,.12,.25,wood,x,.8,z+dz);};
 if(b.design==='zuiwengPavilion'){
  pavilion(0,-.7,3,2.2,1.7);pool(0,1.4,3,1.2);for(let i=0;i<4;i++){const r=ball(g,.55,0x8d9283,-2.3+i*.25,.55+i*.23,-1.6);r.scale.set(1,.8,1.1);}
  if(t>=2)for(let i=0;i<7;i++)box(g,.6,.1,.4,stone,Math.sin(i*.6)*1.8,.39,2.8-i*.65);
  if(t>=3){bench(-2.4,1.6);bench(2.4,1.6);}
  if(t>=4)for(const [i,c] of [0x89a570,0x627d49,0xbb954e,0xb7b9ae].entries()){tree(g,i%2?2.6:-2.6,i<2?-2.5:2.5,.44);ball(g,.5,c,i%2?2.6:-2.6,1.8,i<2?-2.5:2.5);}
  if(t>=5)for(const x of [-3,3])pavilion(x,0,.8,3,1.3);
 }else if(b.design==='virtueLotus'){
  pool(0,0,5.9,5.9);lotus(-1.5,-1.5,8);lotus(1.5,1.5,8);platform(0,0,.7,6.1);
  if(t>=2){platform(-1.2,-.3,2.5,.65);platform(1.2,.3,2.5,.65);rail(0,2.8,2);}
  if(t>=3)for(const [i,c] of [0xcfb665,0xb46588,pink].entries())for(let j=0;j<4;j++)ball(g,.13,c,-2.8+i*.45,.65,2+j*.35);
  if(t>=4)pavilion(2,-2,1.8,1.8,1.4);
  if(t>=5){rail(0,-3.2,6.4);rail(0,3.2,6.4);for(const x of [-3.1,3.1]){const q=new THREE.Group();q.rotation.y=Math.PI/2;q.position.x=x;g.add(q);for(let i=0;i<8;i++)box(q,.07,.7,.07,wood,-2.8+i*.8,.65,0);box(q,6.1,.08,.1,wood,0,1,0);}}
 }else if(b.design==='redcliffBoat'){
  pool(.6,.2,5.9,6.5);boat(.5,.3);box(g,.08,2.6,.08,wood,.5,1.9,.3);box(g,1.2,1.5,.04,0xe8d6b3,1.05,2.4,.3);for(let i=0;i<3;i++)ball(g,.6,0x848a81,-2.55,.6+i*.35,-1.7+i*.4);
  if(t>=2){platform(-1.8,2,2.3,.9);platform(-2.8,0,.65,4.7);rail(-1.8,2.5,2.3);}
  if(t>=3){box(g,.6,.25,.7,wood,.5,.95,.1);cyl(g,.12,.16,.28,0xb9a379,.5,1.2,0,8);for(let i=0;i<5;i++)box(g,.025,.05,.55,gold,.25+i*.1,1.1,.1);}
  if(t>=4)for(let i=0;i<7;i++){cyl(g,.05,.07,2.3,leaf,-2.8+(i%3)*.25,1.3,-2.6+Math.floor(i/3)*.3,6);ball(g,.25,leaf,-2.7+(i%3)*.25,2.1,-2.6+Math.floor(i/3)*.3);}
  if(t>=5)for(let i=0;i<8;i++){const rock=ball(g,.45,0x8b928c,-2.4+Math.sin(i)*.2,.6+i*.24,-.9+i*.28);rock.scale.y=1.4;}
 }else if(b.design==='oilSchool'){
  booth(0,-1.8,0x9b7648);box(g,2,.16,1.1,wood,0,.85,.3);cyl(g,.22,.3,.6,0xb0884c,0,1.2,.3,10);cyl(g,.13,.13,.025,gold,0,1.52,.3,10);
  if(t>=2)for(let i=0;i<4;i++){cyl(g,.28,.42,.85,0x947248,-2.5, .7,-1.8+i*1.1,10);cyl(g,.25,.25,.08,wood,-2.5,1.15,-1.8+i*1.1,10);}
  if(t>=3){bench(-1.2,2);bench(1.2,2);box(g,.8,.1,.55,wood,2,.85,.3);cyl(g,.18,.22,.4,0xcaa66c,2,1.1,.3,10);}
  if(t>=4)pavilion(2.5,-1.7,1.4,2,1.7);
  if(t>=5){for(const x of [-1.6,1.6])box(g,.2,2.8,.2,wood,x,1.65,3);box(g,3.6,.45,.3,0x99733d,0,2.7,3);const q=new THREE.Group();q.position.z=3;g.add(q);roof(q,3.9,.7,.4,3,0x9b7648);}
 }else if(b.design==='creekLotus'){
  pool(0,0,6.4,6.4);for(const [x,z] of [[-2,-2],[-1,1],[2,1.8],[1,-1.5]])lotus(x,z,9);boat(.5,.6);
  if(t>=2){platform(-2.8,0,.7,5.7);platform(-1.7,2.7,2.5,.65);}
  if(t>=3)pavilion(2,-2,1.7,1.7,1.2);
  if(t>=4)for(let i=0;i<5;i++){const x=-2+i*.9,z=2;ball(g,.14,0xe9e5d6,x,.65,z);beam(g,[x-.4,.8,z],[x,.68,z],.055,0xe9e5d6);beam(g,[x,.68,z],[x+.4,.85,z],.055,0xe9e5d6);}
  if(t>=5){pavilion(-2.8,-1,.7,2.8,1.4);pavilion(-1.8,2.7,2.6,.65,1.4);}
 }else if(b.design==='lanternMarket'){
  platform(0,-2,3,1.8);for(const x of [-1.4,1.4])lantern(x,-2.6,2.2);booth(-2,.5,0xa45844);for(let i=0;i<3;i++)cyl(g,.15,.15,.2,gold,-2.4+i*.4,1.12,.5,8);
  if(t>=2){box(g,.15,3,.15,wood,2,1.8,-2);for(let i=0;i<5;i++){const x=2+Math.sin(i*1.2)*.65,y=2.3+Math.cos(i*1.2)*.6;beam(g,[2,1.7,-2],[x,y,-2],.06,wood);cyl(g,.18,.18,.35,0xd8a657,x,y,-2,8);}}
  if(t>=3){booth(2,.5,0x658485);booth(-2,2.4,0x957ea2);}
  if(t>=4){beam(g,[-2,3,-1],[2,3,-1],.12,wood);for(let i=0;i<7;i++)ball(g,.18,[0xcf7449,0xcda557,0x7a9a83][i%3],-1.8+i*.55,2.9+Math.sin(i)*.3,-1);}
  if(t>=5){for(const x of [-1,1])lantern(x,2.7,3,0xc75b42);box(g,2.4,.35,.2,gold,0,3,2.7);for(let i=0;i<5;i++)box(g,.22,.8,.035,[0xbe7360,0x79a297][i%2],-.8+i*.4,2.5,2.7);}
  // Southeast corner intentionally stays open and dim: the poem ends away from the crowd.
 }else if(b.design==='moonTerrace'){
  cyl(g,2.6,2.8,.3,stone,0,.43,0,24);const arch=new THREE.Mesh(new THREE.TorusGeometry(1.25,.18,8,32),new THREE.MeshStandardMaterial({color:stone}));arch.position.set(0,1.8,-2);g.add(arch);box(g,3,.18,.45,stone,0,.4,-2);
  if(t>=2)for(const x of [-1.7,1.7]){cyl(g,.55,.6,.18,stone,x,.9,.5,12);for(const z of [-.25,1.25])cyl(g,.2,.25,.4,stone,x,.6,z,8);}
  if(t>=3)for(const x of [-2.7,2.7]){tree(g,x,-1.9,.65);for(let i=0;i<5;i++)ball(g,.16,gold,x+Math.sin(i)*.6,1.9+Math.cos(i)*.3,-1.9+Math.cos(i)*.4);}
  if(t>=4){pavilion(-2.8,1.5,1.1,1.6,1.7);box(g,.65,.25,.5,wood,-2.8,.6,1.5);box(g,.4,.05,.3,0xf2e3c0,-2.8,.75,1.5);}
  if(t>=5){rail(0,2.75,5);pavilion(2.8,1.5,.7,2.2,1.5);}
 }
 g.userData.upgradeFeatures=features.slice(0,t-1);return true;
}
