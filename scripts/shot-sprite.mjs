import {chromium} from 'playwright';
const b=await chromium.launch({channel:'chrome'});
for(const [w,h,tag] of [[1280,800,'desktop'],[390,844,'mobile']]){
const p=await b.newPage({viewport:{width:w,height:h}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:4173/?storage-test=1');
await p.waitForTimeout(2000);
const s=await p.$('#welcome button');if(s)await s.click();
await p.waitForTimeout(3000);
console.log(tag,await p.evaluate(()=>[document.getElementById('sprite-quest').textContent,document.getElementById('sprite-art').innerHTML.length]),errs);
await p.screenshot({path:`/tmp/sprite-${tag}.png`});
await p.click('#quest-btn');await p.waitForTimeout(800);
await p.screenshot({path:`/tmp/quest-${tag}.png`});
await p.close();}
await b.close();
