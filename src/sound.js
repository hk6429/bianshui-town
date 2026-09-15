// Procedural ambient sound: no external recordings and no autoplay.
export class Soundscape {
 constructor(){this.enabled=false;this.volume=.28;this.nextBird=0;this.nextWood=0;this.nextMarket=0;}
 async toggle(){
  if(!this.ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('目前瀏覽器不支援環境音');this.ctx=new Audio();this.master=this.ctx.createGain();this.master.gain.value=0;this.master.connect(this.ctx.destination);
   const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate*3,this.ctx.sampleRate);const data=buffer.getChannelData(0);let seed=1827,soft=0;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;soft=(soft+((seed/4294967296)*2-1)*.025)/1.025;data[i]=soft*6;}
   const source=this.ctx.createBufferSource();source.buffer=buffer;source.loop=true;
   this.water=this.ctx.createBiquadFilter();this.water.type='lowpass';this.water.frequency.value=850;const gain=this.ctx.createGain();gain.gain.value=.2;this.waterGain=gain;source.connect(this.water).connect(gain).connect(this.master);source.start();
  }
  await this.ctx.resume();this.enabled=!this.enabled;return this.enabled;
 }
 setVolume(value){this.volume=Math.max(0,Math.min(.7,value));}
 tone(frequency,duration,volume,type='sine',end=frequency){const c=this.ctx,o=c.createOscillator(),g=c.createGain(),now=c.currentTime;o.type=type;o.frequency.setValueAtTime(frequency,now);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),now+duration);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(volume,now+.02);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g).connect(this.master);o.start();o.stop(now+duration+.03);o.onended=()=>{o.disconnect();g.disconnect();};}
 update(town,paused){
  if(!this.ctx)return;const active=this.enabled&&!paused;this.master.gain.setTargetAtTime(active?this.volume:0,this.ctx.currentTime,.25);if(!active)return;
  this.water.frequency.setTargetAtTime(town.weather.raining?2600:850,this.ctx.currentTime,.5);this.waterGain.gain.setTargetAtTime(town.weather.raining?.4:.2,this.ctx.currentTime,.5);
  const h=town.time%24,day=h>=6&&h<19,now=this.ctx.currentTime;
  if(now>this.nextBird){this.tone(day?1900:3100,day?.18:.09,day?.07:.018,'sine',day?2800:2900);this.nextBird=now+(day?3.5:1.8)+Math.sin(town.elapsed)*.4;}
  const cart=town.life.oxen.some(a=>a.walking)||town.carts.some(a=>a.outside),craft=day&&town.people.some(p=>!p.outside&&town.building(p.current)?.type==='work');
  if(now>this.nextWood&&(cart||craft)){this.tone(cart?120:390,.055,cart?.055:.035,'triangle',cart?80:180);this.nextWood=now+(cart?.48:1.6);}
  if(day&&town.life.visitors.some(a=>a.visible)&&now>this.nextMarket){this.tone(185+Math.sin(town.elapsed)*25,.32,.012,'triangle',155);this.nextMarket=now+2.4;}
 }
}
