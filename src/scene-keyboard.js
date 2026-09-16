// Scene shortcuts never intercept native controls, modifiers or IME input.
export function sceneCommand(e,scene){
 if(e.target!==scene||e.isComposing||e.ctrlKey||e.altKey||e.metaKey)return null;
 const key=e.key.toLowerCase(),direction={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]}[key];
 if(direction)return {type:'direction',direction};
 if(key==='escape')return {type:'cancel'};
 if(!e.repeat&&key==='enter')return {type:'submit'};
 if(!e.repeat&&e.code==='Space')return {type:'pause'};
 if(['1','2','3','4'].includes(key))return {type:'mode',mode:['explore','home','shop','work'][Number(key)-1]};
 if(key==='q'||key==='e')return {type:'rotate',angle:(key==='q'?-1:1)*Math.PI/8};
 return null;
}
export function stepCursor(cursor,[dx,dz],bounds){
 return {x:Math.max(bounds.minX,Math.min(bounds.maxX,cursor.x+dx)),z:Math.max(bounds.minZ,Math.min(bounds.maxZ,cursor.z+dz))};
}
