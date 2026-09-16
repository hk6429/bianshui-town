import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {disposeTree,shareResource,sharedCache,retainSceneResources} from '../src/scene-resources.js';
import {TownScene} from '../src/scene.js';

test('owned textures, material arrays, lines and sprites release once; shared resources survive',()=>{
 const sharedTexture=shareResource(new THREE.Texture()),texture=new THREE.Texture(),sharedMaterial=shareResource(new THREE.MeshBasicMaterial({map:sharedTexture}));
 const material=new THREE.MeshBasicMaterial({map:texture,alphaMap:texture}),clone=sharedMaterial.clone(),geometry=new THREE.BoxGeometry();
 const counts=new Map();for(const resource of [sharedTexture,texture,sharedMaterial,material,clone,geometry])resource.addEventListener('dispose',()=>counts.set(resource,(counts.get(resource)||0)+1));
 const group=new THREE.Group();group.add(new THREE.Mesh(geometry,[sharedMaterial,material]),new THREE.Mesh(geometry,clone),new THREE.Line(geometry,material),new THREE.Sprite(material));disposeTree(group);
 for(const r of [texture,material,clone,geometry])assert.equal(counts.get(r),1);for(const r of [sharedTexture,sharedMaterial])assert.equal(counts.get(r),undefined);
 assert.equal(group.children.length,0);
});
test('shared caches last until final scene releases; disposal is idempotent and next scene can repopulate',()=>{
 const cache=sharedCache(),a=retainSceneResources(),b=retainSceneResources(),m=shareResource(new THREE.MeshBasicMaterial());let disposed=0;m.addEventListener('dispose',()=>disposed++);cache.set('test',m);
 a();a();assert.equal(disposed,0);assert.equal(cache.size,1);b();assert.equal(disposed,1);assert.equal(cache.size,0);
 const c=retainSceneResources();cache.set('next',shareResource(new THREE.MeshBasicMaterial()));c();assert.equal(cache.size,0);
});
test('unchanged preview reuses geometry; changed or explicitly cleared preview is reconstructed',()=>{
 const scene=Object.create(TownScene.prototype);scene.preview=new THREE.Group();scene.selection=new THREE.Group();const cells=[{x:0,z:0}];
 scene.outline(cells,0xaa0000);const mesh=scene.preview.children[0];let disposed=0;mesh.material.addEventListener('dispose',()=>disposed++);
 scene.outline(cells,0xaa0000);assert.equal(scene.preview.children[0],mesh);assert.equal(disposed,0);
 scene.outline(cells,0x00aa00);assert.equal(disposed,1);assert.notEqual(scene.preview.children[0],mesh);
 scene.clearGroup(scene.preview);scene.outline(cells,0x00aa00);assert(scene.preview.children.length>0);scene.clearGroup(scene.preview);
});
