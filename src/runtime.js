// Simulation time advances in equal steps, independently of screen refresh rate.
export class SimulationClock {
 constructor(step=.05){this.step=step;this.previous=null;this.pending=0;}
 reset(){this.previous=null;this.pending=0;}
 advance(now,{speed=1,paused=false,tick}){
  if(!Number.isFinite(now))return 0;
  if(this.previous===null){this.previous=now;return 0;}
  const elapsed=Math.max(0,Math.min((now-this.previous)/1000,.25));this.previous=now;
  if(paused){this.pending=0;return elapsed;}
  this.pending+=elapsed*Math.max(0,Math.min(4,speed));
  while(this.pending+1e-10>=this.step){tick(this.step);this.pending=Math.max(0,this.pending-this.step);}
  return elapsed;
 }
}

// Exactly one scheduled frame while visible; no background simulation or render work.
export function createRuntime({request,cancel,hidden,options,tick,render,mute,onHide=()=>{},onError=()=>{}}){
 const clock=new SimulationClock();let frameId=null,stopped=false;
 function schedule(){if(!stopped&&!hidden()&&frameId===null)frameId=request(frame);}
 function fail(error){if(stopped)return;stopped=true;if(frameId!==null)cancel(frameId);frameId=null;clock.reset();try{mute();}catch{}onError(error);}
 function frame(now){frameId=null;if(stopped||hidden())return;try{const settings=options();const dt=clock.advance(now,{...settings,tick});render(dt,now,settings.paused);schedule();}catch(error){fail(error);}}
 function visibility(){if(stopped)return;try{if(hidden()){if(frameId!==null)cancel(frameId);frameId=null;clock.reset();mute();onHide();}else{clock.reset();schedule();}}catch(error){fail(error);}}
 schedule();return {visibility,reset:()=>clock.reset(),stop(){stopped=true;if(frameId!==null)cancel(frameId);frameId=null;clock.reset();mute();}};
}
