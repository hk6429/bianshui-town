// Identity-based ownership: cloning a shared material creates an owned material.
const shared=new WeakSet(),caches=new Set();let owners=0;
export function shareResource(resource){shared.add(resource);return resource;}
export function sharedCache(){const cache=new Map();caches.add(cache);return cache;}
export function retainSceneResources(){
 owners++;let released=false;
 return ()=>{if(released)return;released=true;if(--owners===0){for(const cache of caches){for(const resource of cache.values())resource.dispose();cache.clear();}}};
}
export function disposeTree(root){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 root.traverse(object=>{
  if(object.geometry&&!shared.has(object.geometry))geometries.add(object.geometry);
  for(const material of Array.isArray(object.material)?object.material:object.material?[object.material]:[]){
   if(shared.has(material))continue;materials.add(material);
   for(const value of Object.values(material))if(value?.isTexture&&!shared.has(value))textures.add(value);
  }
 });
 for(const resource of [...geometries,...textures,...materials])resource.dispose();
 root.clear();
}
