import {chromium} from '@playwright/test';
const out='/Users/naichengchen/projects/bianshui-town/evidence/expert-review-2026-09-19/simcity/';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:900}});
const log=[];
await p.goto('https://bianshui-town.pages.dev/',{waitUntil:'networkidle',timeout:60000});
await p.waitForTimeout(3000);
await p.screenshot({path:out+'01-default.png'});
// visibility of budget button by default
const vis=await p.evaluate(()=>{const b=document.querySelector('#budget-btn');const r=b.getBoundingClientRect();const cs=getComputedStyle(b);const et=document.querySelector('#extra-tools');const ecs=getComputedStyle(et);return {text:b.textContent,rect:[r.x,r.y,r.width,r.height],display:cs.display,visibility:cs.visibility,opacity:cs.opacity,extraDisplay:ecs.display,extraHeight:et.getBoundingClientRect().height,extraOverflow:ecs.overflow,welcome:!!document.querySelector('#welcome:not([hidden])')};});
log.push({step:'default budget-btn',vis});
// start from a home
await p.click('#start-btn').catch(e=>log.push({err:String(e)}));
await p.waitForTimeout(1500);
await p.screenshot({path:out+'02-after-start.png'});
const vis2=await p.evaluate(()=>{const b=document.querySelector('#budget-btn');const r=b.getBoundingClientRect();const et=document.querySelector('#extra-tools');return {rect:[r.x,r.y,r.width,r.height],extraHeight:et.getBoundingClientRect().height,tools:document.querySelector('#tools-toggle').getAttribute('aria-expanded'),mode:localStorage.length};});
log.push({step:'after start budget-btn',vis2});
// expand tools
await p.click('#tools-toggle');await p.waitForTimeout(800);
await p.screenshot({path:out+'03-tools-expanded.png'});
const vis3=await p.evaluate(()=>{const b=document.querySelector('#budget-btn');const r=b.getBoundingClientRect();return {text:b.textContent,rect:[r.x,r.y,r.width,r.height]};});
log.push({step:'expanded budget-btn',vis3});
// open budget dialog
await p.click('#budget-btn');await p.waitForTimeout(800);
await p.screenshot({path:out+'04-budget-dialog.png'});
log.push({budgetSummary:await p.textContent('#budget-summary')});
await p.keyboard.press('Escape');await p.waitForTimeout(400);
// open blueprints
await p.click('#blueprints-btn');await p.waitForTimeout(800);
await p.screenshot({path:out+'05-blueprints-all.png'});
const grid=await p.evaluate(()=>[...document.querySelectorAll('#blueprint-grid button, #blueprint-grid [data-design]')].map(e=>({d:e.dataset.design,t:e.textContent.trim().slice(0,60),disabled:e.disabled,hidden:e.hidden||getComputedStyle(e).display==='none'})));
log.push({grid1:grid});
await p.click('[data-design-filter="garden"]');await p.waitForTimeout(500);
await p.screenshot({path:out+'06-blueprints-garden-1cell.png'});
const grid2=await p.evaluate(()=>[...document.querySelectorAll('#blueprint-grid button, #blueprint-grid [data-design]')].map(e=>({d:e.dataset.design,t:e.textContent.trim().slice(0,80),disabled:e.disabled,hidden:e.hidden||getComputedStyle(e).display==='none'})));
log.push({gridGarden1:grid2});
await p.click('[data-size="4"]');await p.waitForTimeout(500);
await p.screenshot({path:out+'07-blueprints-garden-4cell.png'});
const grid3=await p.evaluate(()=>[...document.querySelectorAll('#blueprint-grid button, #blueprint-grid [data-design]')].map(e=>({d:e.dataset.design,t:e.textContent.trim().slice(0,80),disabled:e.disabled,hidden:e.hidden||getComputedStyle(e).display==='none'})));
log.push({gridGarden4:grid3});
await p.keyboard.press('Escape');await p.waitForTimeout(300);
// demo town
await p.goto('https://bianshui-town.pages.dev/',{waitUntil:'networkidle'});await p.waitForTimeout(2000);
const demo=await p.$('#demo-btn');if(demo){await demo.click();await p.waitForTimeout(4000);await p.screenshot({path:out+'08-demo-town.png'});
 const stats=await p.evaluate(()=>({pop:document.querySelector('#population').textContent,bld:document.querySelector('#building-count').textContent,budget:document.querySelector('#budget-btn').textContent,clock:document.querySelector('#clock').textContent}));log.push({demo:stats});}
await p.screenshot({path:out+'09-demo-town-zoom.png'});
console.log(JSON.stringify(log,null,1));
await b.close();
