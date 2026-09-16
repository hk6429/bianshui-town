import * as THREE from 'three';

export function markFire(model,b,{box,ball,cyl}){
 if(b.fireWarningAt===undefined&&!b.fireDamage)return model;
 const height=new THREE.Box3().setFromObject(model).max.y,mark=new THREE.Group();mark.name='fire-status';model.add(mark);
 if(b.fireWarningAt!==undefined){
  cyl(mark,.45,.45,.1,0x9e3327,0,height+.45,0,16);box(mark,.12,.6,.12,0xffdf76,0,height+.86,0);ball(mark,.1,0xffdf76,0,height+.45,0);
 }else{
  for(const x of [-.7,0,.7]){const puff=ball(mark,.32,0x686457,x,height+.25+Math.abs(x)*.25,0);puff.scale.y=1.5;}
  box(mark,1.6,.18,.1,0xc5853e,0,.8,b.footprint?3.4:1.6);
 }
 return model;
}
