import * as THREE from 'three';
import {authorById} from './literati-data.js';
import {streetHeight} from './life.js';
import {streetPosition} from './traffic.js';
const box=(g,w,h,d,color,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:1}));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
export class LiteratiScene{
 constructor(owner){this.owner=owner;this.models=new Map();}
 create(a){
  const spec=authorById(a.author),g=new THREE.Group(),human=this.owner.person(a.id);g.add(human);human.children[0].material=human.children[0].material.clone();human.children[0].material.color.set(spec.color);
  if(a.author!=='li'){box(human,.28,.15,.25,0x35443d,0,1.04,0);box(human,.54,.04,.1,0x35443d,0,1.03,0);}else box(human,.38,.025,.035,0xc4a875,0,1.02,0);
  const scroll=box(human,.35,.26,.025,0xe5d5ac,0,.58,.27);scroll.rotation.x=-.5;
  const desk=new THREE.Group();box(desk,.8,.07,.48,0x8d714c,0,.69,.55);for(const x of [-.32,.32])box(desk,.07,.66,.07,0x6c583f,x,.33,.55);box(desk,.47,.018,.29,0xf0dfb8,0,.74,.55);box(desk,.09,.025,.065,0x3c4540,.29,.75,.56);g.add(desk);
  const brush=box(human,.018,.32,.018,0x4c4938,.2,.75,.35);brush.rotation.x=.7;
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=88;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));label.position.set(0,1.62,0);label.scale.set(3.1,.71,1);label.renderOrder=3;g.add(label);
  g.userData={human,desk,brush,label,canvas,labelKey:''};g.traverse(o=>o.userData.authorId=a.author);this.owner.scene.add(g);return g;
 }
 update(t){
  const ids=new Set(t.literati.actors.map(a=>a.author));for(const [id,g] of this.models)if(!ids.has(id)){this.owner.scene.remove(g);this.owner.clearGroup(g);this.models.delete(id);}
  for(const a of t.literati.actors){let g=this.models.get(a.author);if(!g){g=this.create(a);this.models.set(a.author,g);}g.visible=a.visible;if(!a.visible)continue;
   const p=streetPosition(a);g.position.set(p[0],streetHeight(a.x,a.z),p[1]);g.rotation.y=a.angle||0;
   const writing=a.phase==='writing'&&!t.weather.raining,d=g.userData;d.desk.visible=writing;d.brush.visible=writing;d.brush.rotation.z=writing&&!this.owner.reducedMotion?Math.sin(t.elapsed*5)*.35:0;
   this.owner.lifeScene.animateHuman(d.human,t.elapsed,a.walking&&!a.traffic,writing||a.phase==='reading');this.owner.weatherScene.umbrella(d.human,t.weather.raining,{authorId:a.author});
   const status=t.weather.raining?'聽雨':writing?'落筆':a.phase==='reading'?'展卷':'行旅',text=authorById(a.author).name+' · '+status;
   if(d.labelKey!==text){const ctx=d.canvas.getContext('2d');ctx.clearRect(0,0,384,88);ctx.fillStyle='#f5efddeb';ctx.fillRect(3,3,378,82);ctx.strokeStyle='#a0946e';ctx.lineWidth=3;ctx.strokeRect(3,3,378,82);ctx.fillStyle='#3d543e';ctx.font='42px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,192,45);d.label.material.map.needsUpdate=true;d.labelKey=text;}
  }
 }
 reset(){for(const g of this.models.values()){this.owner.scene.remove(g);this.owner.clearGroup(g);}this.models.clear();}
}
