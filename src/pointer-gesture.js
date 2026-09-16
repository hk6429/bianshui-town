// A multi-pointer gesture remains ineligible until every pointer has lifted.
export class PointerGesture {
 constructor(){this.active=new Set();this.primary=null;this.blocked=false;}
 start(e){
  if(e.button!==0)return 'ignore';
  if(this.active.has(e.pointerId))return 'ignore';
  this.active.add(e.pointerId);
  if(this.active.size>1||this.blocked){this.blocked=true;this.primary=null;return 'cancel';}
  this.primary=e.pointerId;return 'start';
 }
 owns(id){return !this.blocked&&this.primary===id&&this.active.has(id);}
 end(id,cancelled=false){
  const eligible=this.owns(id)&&!cancelled;
  this.active.delete(id);
  if(this.primary===id)this.primary=null;
  if(cancelled&&this.active.size)this.blocked=true;
  if(!this.active.size)this.blocked=false;
  return eligible;
 }
 cancel(){this.primary=null;this.blocked=this.active.size>0;}
}
export function shiftDraft(cells,dx,dz){return cells.map(c=>({x:c.x+dx,z:c.z+dz}));}
