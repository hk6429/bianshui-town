import * as THREE from 'three';
import {categoryFor} from './view-preferences.js';
// DOM labels share the canvas camera but never intercept scene gestures.
export class BuildingLabels{
 constructor(root){this.root=root;this.items=new Map();this.enabled=false;}
 setVisible(value){this.enabled=value;this.root.hidden=!value;}
 update(town,scene){
  if(!this.enabled)return;
  const live=new Set(town.buildings.map(b=>b.id));
  for(const [id,item] of this.items)if(!live.has(id)){item.element.remove();this.items.delete(id);}
  const rect=scene.canvas.getBoundingClientRect();
  for(const b of town.buildings){
   const model=scene.buildingModels.get(b.id);if(!model)continue;
   let item=this.items.get(b.id);
   if(!item){const element=document.createElement('span');element.className='building-use-label';element.dataset.building=String(b.id);this.root.append(element);item={element};this.items.set(b.id,item);}
   if(item.model!==model){item.model=model;item.height=new THREE.Box3().setFromObject(model).max.y+.5;}
   const category=categoryFor(b),text=`${category.mark} · ${category.name}`;
   if(item.element.textContent!==text){item.element.textContent=text;item.element.dataset.type=b.type;}
   item.element.title=b.name;
   const point=new THREE.Vector3(b.x*4,item.height,b.z*4).project(scene.camera);
   const x=(point.x+1)*rect.width/2+rect.left,y=(1-point.y)*rect.height/2+rect.top;
   item.element.hidden=!Number.isFinite(x+y)||point.z < -1||point.z > 1||x<0||x>innerWidth||y<0||y>innerHeight;
   const position=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;
   if(item.position!==position){item.element.style.transform=position;item.position=position;}
  }
 }
}
