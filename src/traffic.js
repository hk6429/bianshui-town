// One snapshot per simulation step keeps yielding independent of update order.
const snapshots=new WeakMap();
const heading=a=>{const next=a.route?.find(([x,z])=>Math.hypot(x-a.x,z-a.z)>.01);if(!next)return [Math.sin(a.angle||0),Math.cos(a.angle||0)];const dx=next[0]-a.x,dz=next[1]-a.z,d=Math.hypot(dx,dz);return [dx/d,dz/d];};
export function prepareTraffic(t){
 const actors=[...(t.literati?.actors||[]).filter(a=>a.visible),...t.people.filter(p=>p.outside),...t.carts.filter(p=>p.outside).map(p=>({...p,kind:'cart'})),...t.life.visitors.filter(p=>p.visible),...t.life.porters,...t.life.oxen];
 snapshots.set(t,actors.map(a=>({...a,heading:heading(a),moving:!!a.route?.length,vehicle:['ox','cart'].includes(a.kind)})));
}
export function trafficMotion(t,a){
 if(a.kind==='ox'||t.carts.includes(a))return {scale:1,offset:0,reason:''};
 const [dx,dz]=heading(a);let scale=1,offset=.23,reason='';
 for(const b of snapshots.get(t)||[]){
  if(b.id===a.id)continue;const x=b.x-a.x,z=b.z-a.z,d=Math.hypot(x,z),ahead=x*dx+z*dz,lateral=Math.abs(x*dz-z*dx);
  if(b.vehicle&&d<3.4){offset=.85;if(b.moving&&ahead>-.5&&ahead<3.2&&lateral<1){scale=0;reason=b.kind==='ox'?'讓牛車先過':'讓推車先過';}}
  else if(!b.vehicle&&b.moving&&ahead>0&&ahead<.62&&lateral<.3&&dx*b.heading[0]+dz*b.heading[1]>.7){scale=0;reason='等前方行人走開';}
  if(Math.abs(a.z+16)<.8&&a.x>=12&&a.x<=24&&d<2&&scale>0){scale=.6;reason='橋上人多，放慢腳步';}
 }
 return {scale,offset,reason};
}
export function applyTraffic(t,a){if(!a.route?.length){a.traffic='';return 1;}const motion=trafficMotion(t,a);a.traffic=motion.reason;a.laneOffset=motion.offset;return motion.scale;}
export function streetPosition(a){const [dx,dz]=heading(a),offset=a.laneOffset||0;return [a.x+dz*offset,a.z-dx*offset];}
