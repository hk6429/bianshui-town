import {chromium} from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1280,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:4173/?storage-test=1');
await p.waitForTimeout(1800);
const demo=await p.$('#demo-btn');if(demo)await demo.click();   // demo = 自由營造
await p.waitForTimeout(2500);
console.log('mode',await p.evaluate(()=>window.__townDebug.town().city.mode));
await p.click('#hud-treasury');await p.waitForTimeout(800);
const before=await p.evaluate(()=>window.__townDebug.town().city.expansion);
const info=await p.evaluate(()=>{const b=document.getElementById('buy-land');return {label:b.textContent,disabled:b.disabled,summary:document.getElementById('land-summary').textContent};});
console.log(info);
await p.click('#buy-land');await p.waitForTimeout(900);
console.log('expansion',before,'→',await p.evaluate(()=>window.__townDebug.town().city.expansion),errs);
await p.screenshot({path:'/tmp/land.png'});
await b.close();
