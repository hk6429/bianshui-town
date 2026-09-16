// Three.js registers its restoration listener before this application listener.
// CPU-side scene objects survive; the renderer reuploads their GPU resources.
export function installContextRecovery({canvas,runtime,capture,rebuild,notify,onError,setTimer=setTimeout,clearTimer=clearTimeout,timeout=10000}){
 let state='ready',timer=null;
 const clear=()=>{if(timer!==null)clearTimer(timer);timer=null;};
 function lost(event){
  event.preventDefault();if(state==='disposed'||state==='failed'||state==='lost'||state==='timeout')return;
  state='lost';
  try{runtime.suspend();capture();notify('lost');timer=setTimer(()=>{timer=null;if(state==='lost'){state='timeout';notify('timeout');}},timeout);}catch(error){fail(error);}
 }
 function fail(error){clear();state='failed';runtime.stop();onError(error);}
 function restored(){
  if(state!=='lost'&&state!=='timeout')return;clear();
  try{rebuild();state='ready';notify('restored');runtime.resume();}catch(error){fail(error);}
 }
 canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
 return {get state(){return state;},dispose(){clear();state='disposed';canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);}};
}
