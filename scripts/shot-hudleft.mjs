import {chromium} from 'playwright';
const out=process.argv[2]||'/tmp/hudleft';
const b=await chromium.launch({channel:'chrome'});
for(const [w,h,tag] of [[1280,800,'desktop'],[390,844,'mobile']]){
 const p=await b.newPage({viewport:{width:w,height:h}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://127.0.0.1:4173/?storage-test=1');
 await p.waitForTimeout(2500);
 const start=await p.$('#welcome button');if(start)await start.click();
 await p.waitForTimeout(2500);
 const boxes=await p.evaluate(()=>{const o={};for(const id of ['data-layers','hud-demand','next-step','hud-left']){const e=document.getElementById(id);o[id]=e&&!e.hidden?e.getBoundingClientRect().toJSON():null;}
  o.rows=[...document.querySelectorAll('[data-demand]')].map(r=>{const b=r.getBoundingClientRect();return {k:r.dataset.demand,top:b.top,bottom:b.bottom,visible:b.height>0};});
  o.step=document.getElementById('next-step-text')?.textContent;return o;});
 console.log(tag,JSON.stringify(boxes,null,1),errs);
 await p.screenshot({path:`${out}-${tag}.png`});
 await p.close();
}
await b.close();
