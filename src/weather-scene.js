import * as THREE from 'three';
export class WeatherScene {
 constructor(owner){
  this.owner=owner;this.positions=new Float32Array(420*6);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(this.positions,3));
  this.rain=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xc8dae0,transparent:true,opacity:.48,depthWrite:false}));this.rain.frustumCulled=false;owner.scene.add(this.rain);
 }
 umbrella(model,visible,ref){
  if(!model)return;
  if(visible&&!model.userData.umbrella){const g=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:0xab8861,roughness:1,side:THREE.DoubleSide});const canopy=new THREE.Mesh(new THREE.ConeGeometry(.48,.19,10),material);canopy.position.set(.12,1.48,0);g.add(canopy);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.8,5),new THREE.MeshStandardMaterial({color:0x70583e}));pole.position.set(.12,1.06,0);g.add(pole);g.traverse(o=>Object.assign(o.userData,ref));model.add(g);model.userData.umbrella=g;}
  if(model.userData.umbrella)model.userData.umbrella.visible=visible;
 }
 update(t){
  this.rain.visible=t.weather.raining;
  if(t.weather.raining){for(let i=0;i<420;i++){const x=-36+(i*17.731%78),z=-29+(i*7.317%60),y=(15-((t.elapsed*12+i*.37)%15));this.positions.set([x,y,z,x-.13,y-.55,z+.06],i*6);}this.rain.geometry.attributes.position.needsUpdate=true;}
  for(const p of t.people)this.umbrella(this.owner.personModels.get(p.id),t.weather.raining&&p.outside&&!p.shelter,{personId:p.id});
  for(const a of [...t.life.visitors,...t.life.porters])this.umbrella(this.owner.lifeScene.actors.get(a.id)?.userData.human,t.weather.raining&&a.visible&&a.kind!=='porter',{lifeId:a.id});
 }
}
