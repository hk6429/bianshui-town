import {disposeTree,shareResource,sharedCache} from './scene-resources.js';
import * as THREE from 'three';
const mats=sharedCache();const material=color=>{if(!mats.has(color))mats.set(color,shareResource(new THREE.MeshStandardMaterial({color,roughness:1})));return mats.get(color);};
function add(g,geometry,color,x,y,z){const m=new THREE.Mesh(geometry,material(color));m.position.set(x,y,z);g.add(m);return m;}
export function goodsModel(good){
 const g=new THREE.Group();
 if(good==='books'||good==='paper'){for(let i=0;i<3;i++){add(g,new THREE.BoxGeometry(.34,.055,.25),good==='books'?0x496d7d:0xe8dcc0,0,.05+i*.075,0);if(good==='books')add(g,new THREE.BoxGeometry(.04,.058,.25),0xc5b087,-.13,.05+i*.075,0);}}
 else if(good==='ink'){add(g,new THREE.BoxGeometry(.25,.08,.19),0x33343a,0,.05,0);add(g,new THREE.BoxGeometry(.13,.12,.055),0x171b24,0,.15,0);}
 else if(good==='ceramics'){add(g,new THREE.CylinderGeometry(.12,.19,.29,8),0x7eaaa0,0,.18,0);add(g,new THREE.TorusGeometry(.105,.023,4,10),0x638c83,0,.33,0).rotation.x=Math.PI/2;}
 else if(good==='timber'){for(let i=0;i<3;i++)add(g,new THREE.CylinderGeometry(.065,.065,.55,6),0x8c6c43,(i%2-.5)*.14,.1+Math.floor(i/2)*.11,0).rotation.x=Math.PI/2;}
 else if(good==='furniture'){add(g,new THREE.BoxGeometry(.37,.07,.32),0xa17c4b,0,.28,0);for(const x of [-.13,.13])for(const z of [-.1,.1])add(g,new THREE.BoxGeometry(.045,.25,.045),0x8f7048,x,.125,z);}
 else if(good==='cloth'){for(let i=0;i<3;i++)add(g,new THREE.CylinderGeometry(.065,.065,.38,8),[0x6b8d97,0xaf8079,0xb9a47d][i],i*.1-.1,.1,0).rotation.x=Math.PI/2;}
 else if(good==='fiber')add(g,new THREE.SphereGeometry(.2,7,5),0xd6c8a5,0,.18,0).scale.set(1,.65,.8);
 else if(good==='clay')add(g,new THREE.CylinderGeometry(.13,.19,.32,6),0xaa8269,0,.16,0);
 else add(g,new THREE.BoxGeometry(.3,.3,.3),0xb3986d,0,.15,0);
 return g;
}
export function displayGoods(group,lots,ref={}){
 const list=lots.slice(0,4),signature=list.map(l=>l.good).join(',');
 if(group.userData.goodsSignature===signature)return;
 disposeTree(group);group.userData.goodsSignature=signature;
 list.forEach((l,i)=>{const model=goodsModel(l.good);model.position.set((i%2-.5)*.36,0,Math.floor(i/2)*.4);model.traverse(o=>Object.assign(o.userData,ref));group.add(model);});
}
