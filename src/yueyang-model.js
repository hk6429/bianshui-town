import * as THREE from 'three';
// Present-day Qing-form reference, scaled for four plots. No claim to a measured Song reconstruction.
export const YUEYANG_REFERENCE={era:'清代現存形制參照',floors:3,roof:'盔頂、三重飛簷',source:'https://wlgd.yueyang.gov.cn/58628/58645/58666/content_1632756.html',photo:'https://wlgd.yueyang.gov.cn/uploadfiles/201408/20140827101531522.jpg'};
export function yueyangModel(g,tier,api){
 const {box,cyl,beam,tree}=api,wood=0x843e2a,gold=0xd6a340,wall=0x6f3925,stone=0xb7aa8b;
 function curvedRoof(width,depth,base,height,helmet=false){
  const N=20,vertices=[],indices=[],color=helmet?0xd7a345:0xc89b44;
  const surface=(u,v)=>base+height*(1-Math.max(Math.abs(u),Math.abs(v))**.72)+.58*Math.max(0,(Math.max(Math.abs(u),Math.abs(v))-.62)/.38)**3+.35*(Math.abs(u*v))**3;
  for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const u=i*2/N-1,v=j*2/N-1;vertices.push(u*width/2,surface(u,v),v*depth/2);}
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=i*(N+1)+j,b=a+N+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.85,side:THREE.DoubleSide}));mesh.name=helmet?'helmet-roof':'flying-eaves';mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);
  // Raised tile courses follow the same curve rather than straight triangular roof ridges.
  for(let i=0;i<=16;i++){const u=i/8-1;for(let j=0;j<10;j++){const v=j/5-1,next=v+.2;beam(g,[u*width/2,surface(u,v)+.035,v*depth/2],[u*width/2,surface(u,next)+.035,next*depth/2],.026,gold);}}
  for(const v of [-1,1])for(let i=0;i<12;i++){const u=i/6-1,next=u+1/6;beam(g,[u*width/2,surface(u,v)+.05,v*depth/2],[next*width/2,surface(next,v)+.05,v*depth/2],.065,gold);}
  for(const u of [-1,1])for(const v of [-1,1]){const y=surface(u,v);beam(g,[u*width/2,y,v*depth/2],[u*(width/2+.08),y+.25,v*(depth/2+.06)],.07,0x777849);}
 }
 box(g,6.4,.35,5.3,stone,0,.38,0);
 for(let level=0;level<3;level++){
  const y=.55+level*1.75,w=4.85-level*.65,d=3.6-level*.36,h=1.4;
  box(g,w*.84,h,d*.74,wall,0,y+h/2,0);
  for(const x of [-w*.44,-w*.15,w*.15,w*.44])for(const z of [-d*.42,d*.42])cyl(g,.065,.075,h,wood,x,y+h/2,z,8);
  for(let i=-3;i<=3;i++){const x=i*w*.115;box(g,.35,.93,.04,0xb28439,x,y+.61,d*.38);for(const dx of [-.12,0,.12])box(g,.022,.88,.045,wood,x+dx,y+.61,d*.39);for(const dy of [.35,.58,.8])box(g,.34,.025,.045,wood,x,y+dy,d*.39);}
  if(level===1){box(g,w+.65,.12,d+.65,wood,0,y+.04,0);for(const z of [-d*.55,d*.55]){for(let i=-5;i<=5;i++){const x=i*w/10;box(g,.05,.52,.05,wood,x,y+.35,z);beam(g,[x-.13,y+.16,z],[x+.13,y+.48,z],.025,gold);beam(g,[x+.13,y+.16,z],[x-.13,y+.48,z],.025,gold);}box(g,w+.3,.08,.1,wood,0,y+.63,z);}for(const x of [-w*.55,w*.55]){box(g,.1,.08,d+.3,wood,x,y+.63,0);for(let i=-3;i<=3;i++)box(g,.05,.52,.05,wood,x,y+.35,i*d/6);}}
  for(const x of [-w*.44,-w*.15,w*.15,w*.44])for(const z of [-d*.42,d*.42])for(let n=0;n<3;n++){box(g,.23+n*.1,.075,.13,wood,x,y+h-.12+n*.09,z);box(g,.11,.075,.24+n*.09,gold,x,y+h-.08+n*.09,z);}
  curvedRoof(w+1.6,d+1.45,y+h+.08,level===2?1.1:.65,level===2);
  if(level===2){box(g,1.7,.38,.09,0x39392b,0,y+1.06,d*.4);for(let i=-1;i<=1;i++)box(g,.21,.19,.04,gold,i*.4,y+1.06,d*.4+.06);cyl(g,.045,.08,.45,0x76503c,0,y+h+1.45,0,8);}
 }
 for(let i=0;i<4;i++)box(g,2.3,.12,.5,stone,0,.18+i*.12,3.2-i*.35);
 if(tier>=2)for(const x of [-2.65,2.65]){cyl(g,.23,.32,.65,0x6f6250,x,.6,2.45,12);cyl(g,.32,.32,.08,gold,x,.97,2.45,12);}
 if(tier>=3)for(const x of [-3.3,3.3]){for(let i=-3;i<=3;i++)box(g,.065,.65,.065,wood,x,.7,i*.75);box(g,.1,.09,5,wood,x,1.04,0);}
 if(tier>=4)for(const x of [-2.7,2.7])tree(g,x,-2.7,.45);
 if(tier>=5)for(const x of [-3,-2,2,3]){box(g,.65,.85,.18,stone,x,.77,3.2);box(g,.43,.55,.03,0x574d37,x,.83,3.31);for(let j=0;j<3;j++)box(g,.025,.34,.02,gold,x-.12+j*.12,.84,3.335);}
 g.userData.history=YUEYANG_REFERENCE;g.userData.upgradeFeatures=['門前香爐','環臺木欄','後院古樹','文學碑廊'].slice(0,tier-1);
}
