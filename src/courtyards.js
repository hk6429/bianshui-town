export function courtyards(block){
 const result=[];if(block.combined)return result;
 for(const c of block.cells)for(const [dx,dz] of [[1,0],[0,1]])if(block.cells.some(n=>n.x===c.x+dx&&n.z===c.z+dz))result.push({x:c.x*4+dx*2,z:c.z*4+dz*2,acrossX:!!dx,cells:[[c.x,c.z],[c.x+dx,c.z+dz]],width:dx?1.2:3.2,depth:dz?1.2:3.2});
 return result;
}
export function courtyardFor(t,b){const block=t.blocks.find(g=>g.id===b.blockId);return block?courtyards(block).find(c=>c.cells.some(([x,z])=>x===b.x&&z===b.z)):null;}
export function courtyardPosition(t,p){
 if(p.outside||t.weather.raining)return null;const b=t.building(p.current),c=b&&courtyardFor(t,b);if(!c||b.type==='shop')return null;
 return [c.x+(c.acrossX?0:(p.id%2?-.4:.4)),c.z+(c.acrossX?(p.id%2?-.4:.4):0)];
}
